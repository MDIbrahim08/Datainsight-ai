# 🎯 DataInsight AI
### Conversational AI for Instant Business Intelligence Dashboards

**Built for the GFG x Chanakya University Hackathon**

DataInsight AI is a powerful, agentic platform that transforms natural language queries into interactive, high-fidelity business intelligence dashboards in seconds. By leveraging **Google Gemini 1.5 Flash** and a custom **RAG (Retrieval-Augmented Generation) pipeline**, it allows non-technical users to "chat" with their data, retrieve pinpoint answers, and visualize complex trends without writing a single line of SQL.

---

## 🚀 Key Features

- **💬 Natural Language to Dashboard**: Ask complex questions like *"Show me revenue by region for last quarter"* and get interactive charts instantly.
- **🎯 Smart RAG Pipeline**: Prioritizes exact entity matching and context-aware retrieval for pinpoint accuracy on specific record lookups.
- **🛡️ Hallucination Guard**: A built-in validation layer that ensures AI insights are strictly grounded in the provided dataset.
- **📊 Interactive Visualizations**: Dynamic Bar, Line, Pie, and Area charts with drill-down filtering capabilities.
- **🧠 4-Step Intelligence Progress**: Real-time feedback on the AI's processing stages (Parsing → Retrieval → Analysis → Rendering).
- **📂 Data Agnostic**: Upload any CSV file and immediately start generating insights.
- **🔄 Conversational History**: A full chat thread UI to track your data exploration journey.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **AI Engine**: Google Gemini 1.5 Flash (Google AI Studio)
- **Backend**: Supabase Edge Functions (Deno) / Client-side RAG
- **UI/UX**: shadcn/ui, Lucide Icons, Glassmorphism Design System

---

## 📂 Project Structure

- **`/frontend`**: Documentation and architectural overview of the React application.
- **`/backend`**: Documentation and logic for AI integration and Edge Functions.
- **`/datastory-ai-main`**: The core source code containing the Vite app, source logic, and assets.

---

## ⚙️ Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone [your-repo-link]
   cd Data-insight-ai/datastory-ai-main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root of `datastory-ai-main`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

---

## 🏆 Hackathon Objective
The goal was to build an intelligent system for non-technical executives (CXOs) to access data insights without technical friction. DataInsight AI solves this by bridging the gap between raw data and decision-making through an intuitive, conversational interface.

---

## 🎥 Presentation Demo Queries
1. *"Show me the monthly sales revenue for Q3 broken down by region"* (Complex Analytics)
2. *"Which branch is [Entity Name] in?"* (Direct RAG Lookup)
3. *"Show schema overview"* (Deterministic Metadata)

---

**Developed with ❤️ for the GFG x Chanakya University Hackathon**
