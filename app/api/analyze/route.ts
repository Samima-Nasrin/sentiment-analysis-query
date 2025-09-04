import { NextResponse } from "next/server";
import axios from "axios";
import vader from "vader-sentiment";
import { pipeline } from "@xenova/transformers";

// APIs
const GNEWS_API = "https://gnews.io/api/v4/search";
const WIKI_API = "https://en.wikipedia.org/w/api.php";

// Sentiment Analysis
function analyzeSentiment(text: string) {
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  if (intensity.compound >= 0.05) return "Positive";
  if (intensity.compound <= -0.05) return "Negative";
  return "Neutral";
}

// Relevance Scoring
let embedder: any = null;
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

async function scoreRelevance(query: string, items: any[]) {
  const model = await getEmbedder();

  const queryEmbedding = await model(query, { pooling: "mean", normalize: true });
  const queryVec = queryEmbedding.data;

  const textEmbeddings = await Promise.all(
    items.map((item) =>
      model(item.title || item.text || "", { pooling: "mean", normalize: true })
    )
  );

  function cosine(a: Float32Array, b: Float32Array) {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  return items
    .map((item, i) => ({
      ...item,
      relevance: cosine(queryVec, textEmbeddings[i].data),
    }))
    .sort((a, b) => b.relevance - a.relevance);
}

// Reddit OAuth Token Fetch
async function getRedditToken() {
  const auth = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const res = await axios.post(
    "https://www.reddit.com/api/v1/access_token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "User-Agent": process.env.REDDIT_USER_AGENT || "sentiment-dashboard/1.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data.access_token;
}

// Main API
export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

    // GNews fetch
    let gnewsArticles: any[] = [];
    try {
      const gnewsRes = await axios.get(GNEWS_API, {
        params: { q: query, lang: "en", max: 10, token: process.env.GNEWS_API_KEY },
      });
      gnewsArticles = gnewsRes.data.articles.map((a: any) => ({
        source: "GNews",
        title: a.title,
        sentiment: analyzeSentiment(a.title),
      }));
    } catch (e: any) {
      console.warn("GNews fetch failed:", e.message);
    }

    // Wikipedia fetch
    let wikiPages: any[] = [];
    try {
      const wikiSearch = await axios.get(WIKI_API, {
        params: { action: "query", format: "json", list: "search", srsearch: query, utf8: 1 },
      });

      wikiPages = await Promise.all(
        wikiSearch.data.query.search.slice(0, 5).map(async (p: any) => {
          const summaryRes = await axios.get(WIKI_API, {
            params: {
              action: "query",
              prop: "extracts",
              exintro: true,
              explaintext: true,
              pageids: p.pageid,
              format: "json",
            },
          });

          const page = summaryRes.data.query.pages[p.pageid];
          return {
            source: "Wikipedia",
            title: p.title,
            text: page.extract,
            sentiment: analyzeSentiment(page.extract || p.title),
          };
        })
      );
    } catch (e: any) {
      console.warn("Wikipedia fetch failed:", e.message);
    }

    // Reddit fetch using OAuth
    let redditPosts: any[] = [];
    try {
      const token = await getRedditToken();
      const redditRes = await axios.get("https://oauth.reddit.com/search", {
        params: { q: query, limit: 50, sort: "relevance", t: "month" },
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": process.env.REDDIT_USER_AGENT || "sentiment-dashboard/1.0",
        },
      });

      redditPosts = redditRes.data.data.children
        .map((c: any) => c.data)
        .filter((post: any) => {
          if (!post.title) return false;
          if (post.title.length < 15) return false;
          if (post.subreddit && ["anime", "memes", "funny", "pics"].includes(post.subreddit.toLowerCase()))
            return false;
          if (post.upvote_ratio && post.upvote_ratio < 0.5) return false;
          return true;
        })
        .slice(0, 10)
        .map((post: any) => ({
          source: "Reddit",
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          sentiment: analyzeSentiment(post.title),
        }));
    } catch (e: any) {
      console.warn("Reddit fetch failed:", e.message);
    }

    // Combine & relevance
    const rawResults = [...gnewsArticles, ...wikiPages, ...redditPosts].filter(Boolean);
    const scored = await scoreRelevance(query, rawResults);
    const allResults = scored.slice(0, 50);

    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    allResults.forEach((r) => counts[r.sentiment as keyof typeof counts]++);
    const total = allResults.length || 1;
    const percentages = {
      Positive: Math.round((counts.Positive / total) * 100),
      Negative: Math.round((counts.Negative / total) * 100),
      Neutral: Math.round((counts.Neutral / total) * 100),
    };

    return NextResponse.json({ query, total: allResults.length, counts, percentages, results: allResults });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
