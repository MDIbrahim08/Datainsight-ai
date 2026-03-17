// AI-powered data engine with Gemini integration

export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'date' | 'unknown';
  sample: string[];
}

export interface ParsedDataset {
  columns: DataColumn[];
  columnNames: string[];
  originalHeaders: string[];
  rows: Record<string, any>[];
  rowCount: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  xAxis: string;
  yAxis: string;
  aggregation: 'sum' | 'avg' | 'count';
  title: string;
  reason: string;
}

export interface QueryResult {
  charts: ChartConfig[];
  data: Record<string, any>[][];
  insight: string;
  error: string | null;
  kpis: KPI[];
  suggestions?: string[];
  filters?: any[];
  dimensions?: string[];
  metrics?: string[];
  rawAIPlan?: any;
  /** If set, this is a direct factual answer — show as answer card, skip charts */
  directAnswer?: string;
}

export interface KPI {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface QueryState {
  query: string;
  result: QueryResult;
  dimensions: string[];
  metrics: string[];
  filters: Record<string, any>;
}

// CSV Parser with encoding fallback and delimiter detection
export function parseCSV(text: string): ParsedDataset {
  const firstLine = text.split('\n')[0];
  let delimiter = ',';
  if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '\t';
  } else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  }

  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('File must have headers and at least one data row');

  const rawHeaders = parseLine(lines[0], delimiter);
  const headers = rawHeaders.map(h =>
    h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  );

  if (headers.length < 2) throw new Error('Dataset must have at least 2 columns');

  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    const row: Record<string, any> = {};
    headers.forEach((h, j) => {
      const val = values[j]?.trim() || '';
      const cleaned = val.replace(/[,$%]/g, '');
      const num = Number(cleaned);
      row[h] = (!isNaN(num) && cleaned !== '' && val !== '') ? num : val;
    });
    rows.push(row);
  }

  const columns: DataColumn[] = headers.map(name => {
    const samples = rows.slice(0, 10).map(r => String(r[name] ?? ''));
    
    const numericCount = samples.filter(s => {
      const c = s.replace(/[,$%]/g, '');
      return !isNaN(Number(c)) && c !== '';
    }).length;
    
    const dateCount = samples.filter(s => isDateLike(s)).length;

    let type: DataColumn['type'] = 'categorical';

    if (dateCount > samples.length * 0.5) {
      type = 'date';
    } else if (numericCount > samples.length * 0.5) {
      const isIdCol = /id$|^id_|_id$|uuid|guid|reference/i.test(name);
      type = isIdCol ? 'categorical' : 'numeric';
    }

    return { name, type, sample: samples.slice(0, 3) };
  });

  return { 
    columns, 
    columnNames: headers, 
    originalHeaders: rawHeaders, 
    rows, 
    rowCount: rows.length
  };
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === delimiter && !inQuotes) { result.push(current); current = ''; continue; }
    current += char;
  }
  result.push(current);
  return result;
}

function isDateLike(s: string): boolean {
  if (!s) return false;
  return /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(s) ||
    /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(s) ||
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(s) ||
    /^\d{4}$/.test(s) ||
    /^(q[1-4]|quarter)/i.test(s);
}

// Deterministic chart type override
function overrideChartType(
  xCol: DataColumn,
  _yCol: DataColumn,
  query: string,
  suggestedType?: string
): { type: ChartConfig['type']; reason: string } {
  const q = query.toLowerCase();

  if (xCol.type === 'date' || /trend|over time|monthly|yearly|daily|weekly|growth|quarter/i.test(q)) {
    return { type: 'line', reason: 'Time-series data detected → Line chart for trend visualization' };
  }
  if (/distribution|proportion|share|percentage|breakdown|split|composition/i.test(q)) {
    return { type: 'pie', reason: 'Distribution query detected → Pie chart for proportional analysis' };
  }
  if (/top|bottom|compare|versus|vs|ranking|highest|lowest/i.test(q)) {
    return { type: 'bar', reason: 'Comparison query detected → Bar chart for categorical ranking' };
  }
  if (xCol.type === 'categorical') {
    return { type: 'bar', reason: 'Categorical dimension → Bar chart for clear comparison' };
  }
  if (suggestedType && ['line', 'bar', 'pie', 'area'].includes(suggestedType)) {
    return { type: suggestedType as ChartConfig['type'], reason: `AI suggested ${suggestedType} chart` };
  }
  return { type: 'area', reason: 'Continuous data → Area chart for volume visualization' };
}

// Follow-up detection
const FOLLOWUP_KEYWORDS = [
  'now', 'only', 'filter', 'change', 'but', 'instead', 'also', 'exclude', 'include', 
  'just', 'remove', 'within', 'between', 'filtered', 'this', 'it', 'them', 'that',
  'show only', 'filter by', 'narrow down', 'keep', 'switch to', 'alternate', 'another',
  'refine', 'update', 're-calculate', 'based on', 'specifically', 'for the'
];

export function isFollowUp(query: string): boolean {
  const q = query.toLowerCase();
  return FOLLOWUP_KEYWORDS.some(kw => q.includes(kw)) || (q.split(' ').length < 4 && !/show|what|compare|how/i.test(q));
}

// ============================================================
// RAG-style Retrieval Helpers
// ============================================================

/**
 * Convert a single row into a structured text document (one row = one doc).
 * Format is key: value per line, preceded by ROW_ID.
 */
export function rowToDoc(rowId: number, row: Record<string, any>): string {
  const lines = [`ROW_ID: ${rowId}`];
  for (const [col, val] of Object.entries(row)) {
    lines.push(`${col}: ${val}`);
  }
  return lines.join('\n');
}

/**
 * Join multiple row-documents into a single context string for the LLM.
 */
export function buildRetrievedContext(docs: string[]): string {
  return docs.join('\n\n---\n\n');
}

/**
 * STOP-WORDS to exclude from entity extraction.
 */
const STOP_WORDS = new Set([
  'the','for','who','was','how','any','filter','name','specifically',
  'what','which','in','is','are','their','his','her','show','me',
  'tell','about','data','from','of','at','a','an','and','or','to',
  'give','find','get','list','where','when','does','do',
]);

/**
 * Smart entity retrieval:
 * 1. Extract candidate words from the query (non-stopwords, length > 1)
 * 2. Try EXACT match against every cell value in the dataset
 * 3. If not found, try CASE-INSENSITIVE partial match
 * Returns ALL matching rows (e.g. all rows for "Sneha") or empty array.
 */
export function smartRetrieve(
  query: string,
  rows: Record<string, any>[],
  columnNames: string[]
): { docs: string[]; matchValue: string; column: string } | null {
  const q = query.toLowerCase();
  const words = q
    .split(/[\s,?]+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return null;

  // Pass 1: exact cell match
  for (const word of words) {
    const matchedRows: Array<{ idx: number; row: Record<string, any>; col: string }> = [];
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      for (const col of columnNames) {
        const cell = String(row[col] ?? '').toLowerCase().trim();
        if (cell === word) {
          matchedRows.push({ idx, row, col });
        }
      }
    }
    if (matchedRows.length > 0) {
      const docs = matchedRows.map(m => rowToDoc(m.idx, m.row));
      return { docs, matchValue: String(matchedRows[0].row[matchedRows[0].col]), column: matchedRows[0].col };
    }
  }

  // Pass 2: case-insensitive partial match (e.g. "sneha" matches "Sneha Sharma")
  for (const word of words) {
    if (word.length < 3) continue;
    const matchedRows: Array<{ idx: number; row: Record<string, any>; col: string }> = [];
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      for (const col of columnNames) {
        const cell = String(row[col] ?? '').toLowerCase().trim();
        if (typeof row[col] === 'string' && cell.includes(word)) {
          matchedRows.push({ idx, row, col });
        }
      }
    }
    if (matchedRows.length > 0 && matchedRows.length < rows.length * 0.3) {
      // Only use partial if it's a selective match (< 30% of rows)
      const docs = matchedRows.map(m => rowToDoc(m.idx, m.row));
      return { docs, matchValue: String(matchedRows[0].row[matchedRows[0].col]), column: matchedRows[0].col };
    }
  }

  return null;
}

/**
 * Detect if a query is a direct factual lookup (who/what/which about a specific entity).
 * These queries should return a plain-text answer, not a chart.
 */
export function isDirectAnswerQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  return (
    /^(who|what|which|where)\s+is\b/i.test(q) ||
    /^(who|what|which|where)\s+does\b/i.test(q) ||
    /\b(branch|department|section|roll|score|marks|salary|age|email|phone|city|grade)\s+(of|for|is|does)\b/i.test(q) ||
    /\bwhich\b.*\b(branch|department|section|class|group|team)\b/i.test(q) ||
    /(the\s+)?(branch|department|score|marks|salary|rating|grade|section)\s+(of|for)/i.test(q)
  );
}

// Legacy compatibility shim — thin wrapper around smartRetrieve that returns a single-row result
function findSpecificMatch(query: string, rows: Record<string, any>[], columnNames: string[]): { row: Record<string, any>, matchValue: string, column: string } | null {
  const result = smartRetrieve(query, rows, columnNames);
  if (!result || result.docs.length === 0) return null;
  // Parse first doc back to row (quick re-lookup)
  const firstLine = result.docs[0].split('\n')[0];
  const rowId = parseInt(firstLine.replace('ROW_ID: ', ''), 10);
  return { row: rows[rowId] ?? rows[0], matchValue: result.matchValue, column: result.column };
}

// Detect if a query is asking for dataset schema/metadata
export function isSchemaQuery(query: string): boolean {
  const keywords = [
    "columns", "fields", "schema",
    "rows", "how many rows",
    "categories", "unique values",
    "data types", "what data",
    "date range", "dates",
    "overview", "summary", "metadata"
  ];
  const q = query.toLowerCase();
  return keywords.some(word => q.includes(word));
}

// Handle schema queries deterministically without LLM
export function handleSchemaQuery(dataset: ParsedDataset, query: string): QueryResult {
  const { columns, rows, rowCount, columnNames } = dataset;
  
  const columnDetails = columns.map(col => {
    const allValues = rows.map(r => r[col.name]).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueVals = Array.from(new Set(allValues));
    let typeLabel = 'object/string';
    if (col.type === 'numeric') typeLabel = 'int/float';
    if (col.type === 'date') typeLabel = 'datetime';
    
    return {
      name: col.name,
      type: typeLabel,
      unique_values: uniqueVals.slice(0, 5).map(v => String(v))
    };
  });

  const dateRange: Record<string, [string, string]> = {};
  columns.forEach(col => {
    if (col.type === 'date') {
      const dates = rows
        .map(r => new Date(r[col.name]))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (dates.length > 0) {
        dateRange[col.name] = [
          dates[0].toISOString().split('T')[0],
          dates[dates.length - 1].toISOString().split('T')[0]
        ];
      }
    }
  });

  // Generate KPIs specific to schema
  const kpis: KPI[] = [
    { label: 'Total Rows', value: formatNumber(rowCount), trend: 'neutral' },
    { label: 'Total Columns', value: String(columnNames.length), trend: 'neutral' },
    { label: 'Numeric Fields', value: String(columns.filter(c => c.type === 'numeric').length), trend: 'neutral' },
    { label: 'Date Fields', value: String(columns.filter(c => c.type === 'date').length), trend: 'neutral' },
  ];

  const schemaResult = {
    type: "schema",
    columns: columnNames,
    row_count: rowCount,
    column_details: columnDetails,
    date_range: dateRange,
    sample_data: rows.slice(0, 5)
  };

  return {
    charts: [],
    data: [],
    insight: JSON.stringify(schemaResult, null, 2),
    error: null,
    kpis,
    suggestions: [
      "Show revenue distribution across regions",
      "What is the average product rating?",
      "Identify the top 5 growing categories"
    ]
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(n % 1 === 0 ? 0 : 1);
}

// ============================================================
// SYSTEM PROMPT: for charting/analytics queries
// ============================================================
const CHART_SYSTEM_PROMPT = (columnInfo: any[], dataPreview: any[]) => `You are the Lead Data Scientist for DataInsight AI.
Analyze natural language business queries and convert them into actionable charting JSON for an Executive CXO.

DATA CONTEXT:
- Columns: ${JSON.stringify(columnInfo)}
- Sample Data: ${JSON.stringify(dataPreview)}

STRICT JSON OUTPUT FORMAT (NO MARKDOWN, NO EXPLANATION):
{
  "metrics": ["col_name"],
  "dimensions": ["col_name"],
  "filters": [{"column": "col", "operator": "eq|gt|lt|contains", "value": "val"}],
  "charts": [
    {
      "type": "line|bar|pie|area",
      "x_axis": "col",
      "y_axis": "col",
      "aggregation": "sum|avg|count",
      "title": "Business Title",
      "reason": "Expert justification for choosing this chart type for the persona"
    }
  ],
  "insight": "A crystal-clear, structured business insight focused on performance drivers or ROI.",
  "suggestions": [
    "One diagnostic question (WHY did something happen?)",
    "One look-ahead question (WHAT IF?)",
    "One granular drill-down question"
  ],
  "error": null
}

CORE ANALYSIS LOGIC:
1. HALLUCINATION GUARD: If a query references data outside the defined columns, return {"error": "Reason the data is missing"}.
2. AGENTIC DRILL-DOWN: If a filter is applied to the CURRENT x_axis, SWAP x_axis to a different dimension.
3. SEMANTIC SYNONYMS: Be smart about synonyms (department = branch, worth = revenue, who = name).
4. PINPOINT isolation: If the user asks about an entity like 'Geetha', isolate her record ONLY.
5. CHART STRATEGY: line=trends, bar=comparisons, pie=distribution, area=volume.
6. METRIC INTEGRITY: NEVER sum 'order_id' or 'rating'. Use 'count' for IDs and 'avg' for ratings.`;

// ============================================================
// SYSTEM PROMPT: for direct factual lookup queries (RAG mode)
// ============================================================
const DIRECT_ANSWER_SYSTEM_PROMPT = `You are a data assistant that answers questions strictly based on the provided dataset.

RULES (MANDATORY):
1. Only use the retrieved rows given in the context.
2. Do NOT guess or infer missing values.
3. If the exact answer is not found in the retrieved rows, say: "Data not found in the dataset."
4. Always match entities (like names) exactly. Do not approximate.
5. When the question asks about a specific person, return ONLY that person's row values.
6. Do NOT summarize the entire dataset unless explicitly asked.
7. Do NOT generate graphs, charts, or visualizations unless explicitly requested.
8. Always return answers in a clear structured format.

FORMAT RULES:
- For single record queries: Return as "ColumnName: Value" bullet points.
- For unknown queries: Return exactly: "Data not found in the dataset."`;

// ============================================================
// Process query using AI (Client-side Gemini Integration)
// ============================================================
export async function processQueryWithAI(
  query: string,
  dataset: ParsedDataset,
  previousState?: QueryState | null
): Promise<QueryResult> {
  if (isSchemaQuery(query)) {
    return handleSchemaQuery(dataset, query);
  }

  const { columns, rows } = dataset;
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not found in .env. Falling back to deterministic engine.');
    return fallbackProcessQuery(query, dataset);
  }

  const columnNames = columns.map(c => c.name);
  const columnInfo = columns.map(c => ({ name: c.name, type: c.type, sample: c.sample }));
  const dataPreview = rows.slice(0, 5);

  // ──────────────────────────────────────────────────────────
  // STEP 1: Smart Retrieval — find rows matching query entities
  // ──────────────────────────────────────────────────────────
  const retrieved = smartRetrieve(query, rows, columnNames);

  // ──────────────────────────────────────────────────────────
  // STEP 2: Route to DIRECT ANSWER mode if factual lookup
  // ──────────────────────────────────────────────────────────
  if (retrieved && isDirectAnswerQuery(query)) {
    console.log(`[RAG] Direct answer mode for: "${query}" — ${retrieved.docs.length} rows retrieved`);
    const retrievedContext = buildRetrievedContext(retrieved.docs);

    const userPrompt = `Question:
${query}

Retrieved rows:
${retrievedContext}

Answer using only the retrieved rows.
Return only the final answer.
Do not explain your reasoning.
Do not summarize the dataset.
Do not create graphs.`;

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gemini-1.5-flash',
            messages: [
              { role: 'system', content: DIRECT_ANSWER_SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.0,
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);

      const aiResponse = await response.json();
      const directAnswer = aiResponse.choices?.[0]?.message?.content?.trim() || 'Data not found in the dataset.';

      return {
        charts: [],
        data: [],
        insight: directAnswer,
        directAnswer,
        error: null,
        kpis: generateKPIs(dataset),
        filters: [{ column: retrieved.column, operator: 'eq', value: retrieved.matchValue }],
        suggestions: [
          `Show all records where ${retrieved.column} is ${retrieved.matchValue}`,
          `What is the average performance across all ${retrieved.column} values?`,
          `Compare ${retrieved.matchValue} against others in the same ${retrieved.column}`,
        ],
        rawAIPlan: { mode: 'direct_answer', retrieved_docs: retrieved.docs.length, match: { column: retrieved.column, value: retrieved.matchValue } },
      };
    } catch (err) {
      console.error('[RAG] Direct answer failed, falling back:', err);
      // Fall through to chart mode below
    }
  }

  // ──────────────────────────────────────────────────────────
  // STEP 3: Chart / Analytics mode
  // ──────────────────────────────────────────────────────────
  // Legacy pointMatch for filter injection (uses the existing retrieved result)
  const pointMatch = retrieved
    ? (() => {
        const firstDocLines = retrieved.docs[0]?.split('\n') || [];
        const rowIdLine = firstDocLines.find(l => l.startsWith('ROW_ID: '));
        const rowId = rowIdLine ? parseInt(rowIdLine.replace('ROW_ID: ', ''), 10) : 0;
        return { row: rows[rowId] ?? rows[0], matchValue: retrieved.matchValue, column: retrieved.column };
      })()
    : null;

  let enhancedQuery = query;

  if (pointMatch) {
    enhancedQuery = `
      PINPOINT DATA FOUND: ${JSON.stringify(pointMatch.row)}
      USER QUESTION: "${query}"
      ENTITY NAME: "${pointMatch.matchValue}"
      COLUMN: "${pointMatch.column}"
      
      INSTRUCTION: This is a DIRECT question about '${pointMatch.matchValue}'. 
      1. Provide a direct, one-sentence answer in 'insight' (e.g. "${pointMatch.matchValue} is in the [Branch] branch with [Marks] marks").
      2. Set 'filters' to: [{"column": "${pointMatch.column}", "operator": "eq", "value": "${pointMatch.matchValue}"}]
      3. CRITICAL: Do NOT mention other records or provide general breakdowns. Isolate this entity.
    `.trim();
  } else if (previousState && isFollowUp(query)) {
    const prevCharts = previousState.result.charts.map(c => c.title).join(', ');
    enhancedQuery = `
      CONTEXT: This is a follow-up refinement query.
      PREVIOUS QUERY: "${previousState.query}"
      PREVIOUS CHARTS GENERATED: ${prevCharts}
      CURRENT ACTIVE FILTERS: ${JSON.stringify(previousState.filters)}
      NEW INSTRUCTION: "${query}"
      
      GOAL: Update the analysis. 
      IMPORTANT DRILL-DOWN RULE: If filtering for a specific value in the CURRENT x_axis (e.g. category: Fashion), SWAP the x_axis to a different dimension (Region, Date, etc.) to show a breakdown of that subset.
      Always preserve relevant filters from the CURRENT ACTIVE FILTERS unless the user explicitly asks to remove them.
    `.trim();
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-1.5-flash',
          messages: [
            { role: 'system', content: CHART_SYSTEM_PROMPT(columnInfo, dataPreview) },
            { role: 'user', content: enhancedQuery },
          ],
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);

    const aiResponse = await response.json();
    let content = aiResponse.choices?.[0]?.message?.content || '';

    // Clean JSON content
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiResult = JSON.parse(content);

    // FORCE ENFORCE FILTERS for PINPOINT Accuracy
    if (pointMatch && (!aiResult.filters || aiResult.filters.length === 0)) {
      aiResult.filters = [{ column: pointMatch.column, operator: 'eq', value: pointMatch.matchValue }];
    }

    if (aiResult?.error) {
      return {
        charts: [],
        data: [],
        insight: aiResult.error,
        error: aiResult.error,
        kpis: generateKPIs(dataset),
        dimensions: [],
        metrics: [],
        filters: [],
      };
    }

    // Process AI-suggested charts with local data
    const charts: ChartConfig[] = [];
    const allData: Record<string, any>[][] = [];
    const aiCharts = aiResult?.charts || [];
    const validColNames = columns.map(c => c.name);

    for (const aiChart of aiCharts) {
      const xValid = validColNames.includes(aiChart.x_axis);
      const yValid = validColNames.includes(aiChart.y_axis);

      if (!xValid || !yValid) {
        console.warn(`AI hallucinated columns: x=${aiChart.x_axis}, y=${aiChart.y_axis}`);
        continue;
      }

      const xColDef = columns.find(c => c.name === aiChart.x_axis)!;
      const yColDef = columns.find(c => c.name === aiChart.y_axis)!;
      const { type, reason } = overrideChartType(xColDef, yColDef, query, aiChart.type);

      const chart: ChartConfig = {
        type,
        xAxis: aiChart.x_axis,
        yAxis: aiChart.y_axis,
        aggregation: aiChart.aggregation || 'sum',
        title: aiChart.title || `${aiChart.y_axis} by ${aiChart.x_axis}`,
        reason: aiChart.reason || reason,
      };
      charts.push(chart);

      const chartData = executeAggregation(
        rows, aiChart.x_axis, aiChart.y_axis, aiChart.aggregation || 'sum',
        aiResult.filters || [], query
      );
      allData.push(chartData);
    }

    if (charts.length === 0) return fallbackProcessQuery(query, dataset);

    return {
      charts,
      data: allData,
      insight: aiResult?.insight || 'Analysis complete.',
      error: null,
      kpis: generateKPIs(dataset, aiResult?.metrics?.[0]),
      suggestions: aiResult?.suggestions || [],
      filters: aiResult?.filters || [],
      rawAIPlan: aiResult,
    };
  } catch (err) {
    console.error('Client-side AI query failed:', err);
    return fallbackProcessQuery(query, dataset);
  }
}

// Execute local aggregation (pandas-equivalent)
function executeAggregation(
  rows: Record<string, any>[],
  xAxis: string,
  yAxis: string,
  aggregation: string,
  filters: any[],
  query: string
): Record<string, any>[] {
  let filtered = [...rows];

  // Apply filters
  for (const f of filters) {
    if (!f.column || !f.value) continue;
    filtered = filtered.filter(r => {
      const val = String(r[f.column] ?? '').toLowerCase().trim();
      const target = String(f.value).toLowerCase().trim();
      switch (f.operator) {
        case 'eq': return val === target;
        case 'gt': return Number(r[f.column]) > Number(f.value);
        case 'lt': return Number(r[f.column]) < Number(f.value);
        case 'contains': return val.includes(target);
        default: return val === target || val.includes(target);
      }
    });
  }

  // Group by x_axis
  const grouped = new Map<string, number[]>();
  for (const row of filtered) {
    const key = String(row[xAxis] ?? 'Unknown');
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(Number(row[yAxis]) || 0);
  }

  let result = Array.from(grouped.entries()).map(([key, values]) => {
    let value: number;
    if (aggregation === 'avg') value = values.reduce((a, b) => a + b, 0) / values.length;
    else if (aggregation === 'count') value = values.length;
    else value = values.reduce((a, b) => a + b, 0);

    return { name: key, value: Math.round(value * 100) / 100, count: values.length };
  });

  result.sort((a, b) => b.value - a.value);

  // Top N detection
  const topMatch = query.toLowerCase().match(/top\s+(\d+)/);
  if (topMatch) {
    result = result.slice(0, parseInt(topMatch[1]));
  }

  return result;
}

// Fallback: process without AI
function fallbackProcessQuery(query: string, dataset: ParsedDataset): QueryResult {
  const { columns, rows } = dataset;
  const q = query.toLowerCase();

  const numericCols = columns.filter(c => c.type === 'numeric');
  const catCols = columns.filter(c => c.type === 'categorical');
  const dateCols = columns.filter(c => c.type === 'date');

  if (numericCols.length === 0) {
    return { charts: [], data: [], insight: '', error: 'No numeric columns found.', kpis: [] };
  }

  let dimension = dateCols[0] || catCols[0] || columns[0];
  let metric = numericCols[0];

  for (const col of columns) {
    const colWords = col.name.replace(/_/g, ' ');
    if (q.includes(colWords) || q.includes(col.name)) {
      if (col.type === 'numeric') metric = col;
      else dimension = col;
    }
  }

  let aggregation: ChartConfig['aggregation'] = 'sum';
  if (/average|avg|mean/i.test(q)) aggregation = 'avg';
  if (/count|number of|how many/i.test(q)) aggregation = 'count';

  const { type, reason } = overrideChartType(dimension, metric, query);

  const chartData = executeAggregation(rows, dimension.name, metric.name, aggregation, [], query);

  const chart: ChartConfig = {
    type,
    xAxis: dimension.name,
    yAxis: metric.name,
    aggregation,
    title: `${metric.name.replace(/_/g, ' ')} by ${dimension.name.replace(/_/g, ' ')}`,
    reason,
  };

  const pointMatch = findSpecificMatch(query, rows, columns.map(c => c.name));
  
  let insight = '';
  let filters: any[] = [];
  
  if (pointMatch) {
    const row = pointMatch.row;
    // Enhanced Synonym Mapping for common BI queries
    const synonyms: Record<string, string[]> = {
      'branch': ['department', 'dept', 'stream', 'course', 'class'],
      'name': ['student', 'person', 'who', 'user'],
      'roll': ['id', 'rollno', 'number'],
      'marks': ['score', 'points', 'grade']
    };

    // Find target column with synonym support
    let targetCol = columns.find(c => {
      const name = c.name.toLowerCase();
      return q.includes(name) || (synonyms[name] && synonyms[name].some(s => q.includes(s)));
    });

    if (targetCol) {
      insight = `${pointMatch.matchValue} is in the ${targetCol.name}: ${row[targetCol.name]}. Full record found.`;
    } else {
      // If no specific col found, show all meaningful data (not just first 3)
      const details = columns
        .filter(c => !['id', 'roll'].includes(c.name.toLowerCase()))
        .map(c => `${c.name}: ${row[c.name]}`)
        .join(', ');
      insight = `Found details for ${pointMatch.matchValue}: ${details}.`;
    }
    filters = [{ column: columns.find(c => row[c.name] === pointMatch.matchValue)?.name, operator: 'eq', value: pointMatch.matchValue }];
  } else {
    const topItem = chartData[0];
    insight = topItem
      ? `"${topItem.name}" leads with ${formatNumber(topItem.value)} in ${metric.name.replace(/_/g, ' ')}. Dataset: ${rows.length} records across ${new Set(rows.map(r => r[dimension.name])).size} categories.`
      : 'Analysis complete.';
  }

  return {
    charts: [chart],
    data: [chartData],
    insight,
    error: null,
    kpis: generateKPIs(dataset, metric.name),
    filters
  };
}

// Generate KPIs from dataset
function generateKPIs(dataset: ParsedDataset, metricName?: string): KPI[] {
  const { columns, rows } = dataset;
  const numericCols = columns.filter(c => c.type === 'numeric');
  
  // Find the smartest primary metric
  let primaryMetric = numericCols[0];
  if (metricName) {
    primaryMetric = numericCols.find(c => c.name === metricName) || numericCols[0];
  } else {
    // Prioritize business-critical metrics as default (Revenue is king)
    const revenueCol = numericCols.find(c => /total_revenue|revenue|sales/i.test(c.name));
    const profitCol = numericCols.find(c => /profit|margin/i.test(c.name));
    const priceCol = numericCols.find(c => /amount|total|price/i.test(c.name));
    primaryMetric = revenueCol || profitCol || priceCol || numericCols[0];
  }

  if (!primaryMetric) return [];

  const values = rows.map(r => Number(r[primaryMetric.name]) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / values.length;
  const max = Math.max(...values);

  const catCols = columns.filter(c => c.type === 'categorical');
  const uniqueCats = catCols.length > 0 ? new Set(rows.map(r => r[catCols[0].name])).size : 0;

  // Simulate trend with random but consistent values
  const changes = ['+12.5%', '+8.3%', '-2.1%', '+15.7%', '+3.4%', '-5.2%'];
  const trends: Array<'up' | 'down' | 'neutral'> = ['up', 'up', 'down', 'up', 'up', 'down'];

  const kpis: KPI[] = [
    {
      label: `Total ${primaryMetric.name.replace(/_/g, ' ')}`,
      value: formatNumber(total),
      change: changes[0],
      trend: trends[0],
    },
    {
      label: 'Total Records',
      value: formatNumber(rows.length),
      trend: 'neutral',
    },
    {
      label: `Avg ${primaryMetric.name.replace(/_/g, ' ')}`,
      value: formatNumber(avg),
      change: changes[2],
      trend: trends[2],
    },
    {
      label: 'Peak Value',
      value: formatNumber(max),
      change: changes[3],
      trend: trends[3],
    },
  ];

  return kpis;
}

// Generate sample dataset for demo
export function generateSampleDataset(): ParsedDataset {
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const categories = ['Electronics', 'Clothing', 'Food & Beverages', 'Furniture', 'Sports & Outdoors'];
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

  const rows: Record<string, any>[] = [];
  for (const month of months) {
    for (const region of regions) {
      for (const category of categories) {
        rows.push({
          date: month,
          region,
          category,
          revenue: Math.round(Math.random() * 50000 + 10000),
          orders: Math.round(Math.random() * 500 + 50),
          profit: Math.round(Math.random() * 15000 + 2000),
          customers: Math.round(Math.random() * 200 + 20),
        });
      }
    }
  }

  const columns: DataColumn[] = [
    { name: 'date', type: 'date', sample: ['2024-01', '2024-02', '2024-03'] },
    { name: 'region', type: 'categorical', sample: ['North', 'South', 'East'] },
    { name: 'category', type: 'categorical', sample: ['Electronics', 'Clothing', 'Food & Beverages'] },
    { name: 'revenue', type: 'numeric', sample: ['45000', '32000', '28000'] },
    { name: 'orders', type: 'numeric', sample: ['350', '220', '180'] },
    { name: 'profit', type: 'numeric', sample: ['12000', '8500', '6200'] },
    { name: 'customers', type: 'numeric', sample: ['150', '95', '72'] },
  ];

  return { columns, columnNames: columns.map(c => c.name), originalHeaders: columns.map(c => c.name), rows, rowCount: rows.length };
}
