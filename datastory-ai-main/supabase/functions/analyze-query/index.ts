import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, columns, dataPreview, lastState } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `You are the Lead Data Scientist for DataInsight AI. 
Analyze natural language business queries and convert them into actionable charting JSON.

DATA CONTEXT:
- Columns: \${JSON.stringify(columns)}
- Sample Data: \${JSON.stringify(dataPreview)}
\${lastState ? `- PREVIOUS CONTEXT: User asked "\${lastState.query}". Current request might be a refinement (e.g., "now filter by X").` : ""}

STRICT JSON OUTPUT FORMAT:
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
      "reason": "Why this chart fits the persona (Executive CXO)"
    }
  ],
  "insight": "1-2 sentence business-value insight",
  "suggestions": ["3 deep-dive follow-up questions"],
  "error": null
}

CORE ANALYSIS LOGIC:
1. HALLUCINATION GUARD: If a query references data outside the defined columns, return {"error": "Specific reason why data is missing"}.
2. AGENTIC REFINEMENT & DRILL-DOWN: 
   - If a filter is applied to the CURRENT x_axis (e.g., user clicks 'Fashion' in a 'Revenue by Category' chart), SWAP the x_axis to a different dimension (like 'Region' or 'Date') to provide a deeper breakdown.
   - DO NOT show a chart with only one bar/segment if it can be broken down further.
3. CXO AESTHETICS: Use clean, professional titles. Avoid technical jargon in 'insight'.
4. CHART SELECTION:
   - Line: Growth/Trends over time.
   - Bar: Comparisons/Rankings.
   - Pie: Distribution/Percentage of total.
   - Area: Cumulative volume.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI raw response:", JSON.stringify(aiResponse).substring(0, 500));
    
    let content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Handle tool calls if present
    const toolCalls = aiResponse.choices?.[0]?.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      content = toolCalls[0].function?.arguments || content;
    }

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Validate JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({
          error: null,
          charts: [],
          metrics: [],
          dimensions: [],
          filters: [],
          insight: "The AI returned an unexpected format. Please try rephrasing your query.",
          rawResponse: content,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate columns exist
    const allCols = columns.map((c: any) => c.name || c);
    if (parsed.charts) {
      parsed.charts = parsed.charts.filter((chart: any) => {
        const xValid = allCols.includes(chart.x_axis);
        const yValid = allCols.includes(chart.y_axis);
        if (!xValid || !yValid) {
          console.warn(`Filtered invalid chart: x=${chart.x_axis}, y=${chart.y_axis}`);
        }
        return xValid && yValid;
      });
    }

    if (parsed.dimensions) {
      parsed.dimensions = parsed.dimensions.filter((d: string) => allCols.includes(d));
    }
    if (parsed.metrics) {
      parsed.metrics = parsed.metrics.filter((m: string) => allCols.includes(m));
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-query error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
