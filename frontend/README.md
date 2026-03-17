# 🖥️ Frontend

All frontend code lives in the **`../datastory-ai-main/src/`** directory.

## Tech Stack
- **Framework**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS + Glassmorphism custom CSS
- **Charts**: Recharts (Bar, Line, Pie, Area)
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui

## Key Files
```
src/
├── pages/
│   └── Index.tsx           # Main app page (dashboard, chat thread, results)
├── components/
│   ├── Navbar.tsx           # Top navigation bar with logo
│   ├── HeroQuery.tsx        # Natural language input hero section
│   ├── ChatThread.tsx       # Conversation UI (user + AI message bubbles)
│   ├── ChartCard.tsx        # Recharts chart renderer (bar/line/pie/area)
│   ├── InsightBar.tsx       # AI insight display card
│   ├── KPICards.tsx         # KPI metric summary cards
│   ├── LoadingProgress.tsx  # 4-step animated loading progress tracker
│   ├── DatasetSchemaView.tsx# Schema/metadata overview
│   ├── FileUploadModal.tsx  # CSV upload modal
│   └── Scene3DBackground.tsx# 3D animated background
└── lib/
    └── dataEngine.ts        # Core AI engine (RAG retrieval, Gemini API, CSV parser)
```

## Run Locally
```bash
cd ../datastory-ai-main
npm install
npm run dev
```
