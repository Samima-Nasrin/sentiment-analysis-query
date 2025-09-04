# Sentiment Analyzer Dashboard

A **Next.js 15** application that fetches live data from **GNews**, **Wikipedia**, and **Reddit**, applies semantic filtering and performs **sentiment analysis** on the text, and visualizes the results in an interactive dashboard.  

This project combines **real-time data fetching, natural language sentiment scoring, and visual analytics** into one tool, making it easy to analyze the overall public mood on any topic (e.g., *Ferrari, AI, SpaceX, Elections*).

---

## Features

- **Multi-source data fetching**  
  - **GNews API** for trending news articles.  
  - **Wikipedia API** for knowledge-based summaries.  
  - **Reddit API** for public opinions and discussions.
- **Semantic embedding**
  - Uses a **semantic embedding model** (`@xenova/transformers` / MiniLM) to score each candidate by *relevance to the query*.
  - Keeps only the top-N **most relevant texts** (configurable). 

- **Sentiment analysis** using [`vader-sentiment`](https://www.npmjs.com/package/vader-sentiment):  
  - Classifies each text into **Positive**, **Negative**, or **Neutral**.  
  - Computes overall distribution with percentages.  

- **Visual dashboard** built with:  
  - [`chart.js`](https://www.chartjs.org/)  
  - [`react-chartjs-2`](https://react-chartjs-2.js.org/)  

- **Optimized API routes** (`/api/analyze`)  
  - Filters low-quality Reddit posts.  
  - Avoids irrelevant data.  
  - Returns structured results with sentiment breakdown.  

- **Modern UI/UX**  
  - **Tailwind CSS v4** for styling.  
  - **Geist font** for a clean look.  
  - Responsive design.  

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, TypeScript, Turbopack)  
- **Frontend:** React 19, Tailwind CSS, Chart.js  
- **Backend:** Next.js API Routes  
- **APIs Used:**  
  - [GNews](https://gnews.io/) – news articles  
  - [Wikipedia](https://www.mediawiki.org/wiki/API:Main_page) – knowledge summaries  
  - [Reddit](https://www.reddit.com/dev/api/) – user posts  
- **Sentiment Engine:** [`vader-sentiment`](https://www.npmjs.com/package/vader-sentiment)
- **Embedding model:** `@xenova/transformers` (semantic embeddings for relevance scoring) — optional / configurable  

---

## Project Structure

```
sentiment-dashboard/
│── app/                     # Next.js app router (frontend + API routes)
│  │── api/analyze/route.ts  # Sentiment analysis API route
│  │── layout.tsx            # Handles main page and metadata
│  │── page.tsx              # Renders functional page
│  └── globals.css           # Global style sheet 
│── public/                  # Static assets (favicon, images, etc.)
│── types/                   # TypeScript definitions
│── package.json             # Dependencies & scripts
│── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration

```

---

## Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Samima-Nasrin/sentiment-analysis-query.git
   cd sentiment-dashboard
   ```
2. **Install dependencies**

  ```bash
  npm install
  ```
3. **Setup environment variables**

  ```bash
  GNEWS_API_KEY
  REDDIT_CLIENT_ID
  REDDIT_CLIENT_SECRET
  REDDIT_USER_AGENT
  ```
4. Run locally

  ```bash
  npm run dev
  ```

---

## Author

Samima Nasrin
GitHub: Samima-Nasrin
