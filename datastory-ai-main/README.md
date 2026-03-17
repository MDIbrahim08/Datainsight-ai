# 📊 DataInsight AI
### Instant Business Intelligence Dashboards via Conversational AI

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**DataInsight AI** is a cutting-edge Business Intelligence tool designed for the non-technical executive. Built for the GfG x Chanakya University Hackathon, it bridges the gap between raw data and actionable insights using natural language.

---

## 🚀 Key Features

- **🗣️ Natural Language to Dashboard**: Ask complex business questions like *"Show me the monthly revenue trend split by region"* and get instant, interactive visualizations.
- **📈 Intelligent Chart Selection**: Automatically determines the best visualization (Line, Bar, Pie, Area) based on data distribution and user intent.
- **💬 Conversational Context**: Supports follow-up queries (e.g., *"Now filter this to only show Q3"*) maintaining analysis state.
- **✨ Premium UI/UX**: Stunning 3D particle backgrounds, glassmorphism design, and buttery-smooth animations using Framer Motion and Three.js.
- **📂 Data Agnostic**: Upload any CSV and start chatting with your data immediately.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Visualization**: Recharts (D3-based)
- **AI Engine**: Google Gemini 1.5 Flash (via Supabase Edge Functions)
- **Animations**: Framer Motion & Three.js (Fiber)
- **Backend/Storage**: Supabase

## 📖 How it Works

1.  **Ingestion**: User uploads a CSV file. The system parses headers, detects data types, and generates local previews.
2.  **AI Analysis**: The natural language query is sent to a custom-tuned Gemini 1.5 agent along with dataset schema and sample distributions.
3.  **Execution Plan**: AI returns a structural JSON plan (metrics, dimensions, filters, chart types).
4.  **Local Aggregation**: The frontend executes the data transformations locally to ensure 100% mathematical accuracy and zero hallucination of numbers.
5.  **Rendering**: Beautiful, interactive charts are rendered in real-time.

## 🏆 Hackathon Alignment

- **Accuracy**: Local data engine ensures data integrity.
- **UX**: Modern, intuitive interface with loading states and interaction-rich charts.
- **Innovation**: Real-time reasoning descriptions explain *why* a specific chart was chosen.

---
*Built with ❤️ for the GfG Classroom Program x Chanakya University Hackathon.*
