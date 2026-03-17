# ⚙️ Backend

All backend code lives in the **`../datastory-ai-main/supabase/`** directory.

## Tech Stack
- **Runtime**: Deno (Supabase Edge Functions)
- **API**: REST endpoint deployed on Supabase Edge
- **AI**: Google Gemini 1.5 Flash via REST API
- **Language**: TypeScript

## Key Files
```
supabase/
└── functions/
    └── analyze-query/
        └── index.ts    # Edge Function — receives query + dataset context,
                        # calls Gemini API, returns chart JSON + insights
```

## Architecture
```
User Query + Dataset columns + Sample rows
        ↓
  Supabase Edge Function (Deno)
        ↓
  Google Gemini 1.5 Flash API
        ↓
  Structured JSON: { charts, filters, insight, suggestions }
        ↓
  Frontend renders charts locally using Recharts
```

## Environment Variables Required
```
GEMINI_API_KEY=your_google_gemini_api_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key   # for client-side direct calls
```

## Note
The primary AI engine runs **client-side** in `dataEngine.ts` for zero-latency responses.
The Supabase Edge Function serves as a secondary/server-side fallback endpoint.
