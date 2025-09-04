"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleAnalyze = async () => {
    if (!query) return;
    setLoading(true);
    setData(null);

    const res = await axios.post("/api/analyze", { query });
    setData(res.data);
    setLoading(false);
  };

  // scroll when new data arrives
  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [data]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-8">
      <div className="hero-section">
        <h1 className="hero-title text-4xl font-extrabold text-center mb-10 text-gray-800 drop-shadow">
          Sentiment Dashboard
        </h1>
        <p className="hero-description">
          Analyze sentiment from live news, Wikipedia, and Reddit.
        </p>
        <div className="hero-search flex justify-center gap-3 mb-8">
          <input
            type="text"
            placeholder="Enter topic (e.g. Technology)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleAnalyze}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition"
          >
            Analyze
          </button>
        </div>
      </div>

      {loading && (
        <p className="loading-text text-center text-lg font-medium">
          Analyzing...
        </p>
      )}

      {data && (
        <div ref={resultsRef} className="max-w-4xl mx-auto space-y-8 mt-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{data.total} texts analyzed</h2>
            <p className="text-lg">
              <span className="text-green-600 font-semibold">
                Positive: {data.percentages.Positive}%
              </span>{" "}
              |{" "}
              <span className="text-red-600 font-semibold">
                Negative: {data.percentages.Negative}%
              </span>{" "}
              |{" "}
              <span className="text-yellow-600 font-semibold">
                Neutral: {data.percentages.Neutral}%
              </span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Pie
              data={{
                labels: ["Positive", "Negative", "Neutral"],
                datasets: [
                  {
                    data: [
                      data.percentages.Positive,
                      data.percentages.Negative,
                      data.percentages.Neutral,
                    ],
                    backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
                  },
                ],
              }}
            />
          </div>

          {/* GNews */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">News (GNews)</h3>
            <ul className="space-y-3">
              {data.results
                .filter((r: any) => r.source === "GNews")
                .map((r: any, i: number) => (
                  <li
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl shadow-sm flex items-start gap-3"
                  >
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        r.sentiment === "Positive"
                          ? "bg-green-200 text-green-800"
                          : r.sentiment === "Negative"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {r.sentiment}
                    </span>
                    <p className="text-gray-700">{r.title}</p>
                  </li>
                ))}
            </ul>
          </div>

          {/* Wikipedia */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Wikipedia</h3>
            <ul className="space-y-3">
              {data.results
                .filter((r: any) => r.source === "Wikipedia")
                .map((r: any, i: number) => (
                  <li
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl shadow-sm flex items-start gap-3"
                  >
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        r.sentiment === "Positive"
                          ? "bg-green-200 text-green-800"
                          : r.sentiment === "Negative"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {r.sentiment}
                    </span>
                    <p className="text-gray-700">
                      <strong>{r.title}:</strong> {r.text}
                    </p>
                  </li>
                ))}
            </ul>
          </div>

          {/* Reddit */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Reddit</h3>
            <ul className="space-y-3">
              {data.results
                .filter((r: any) => r.source === "Reddit")
                .map((r: any, i: number) => (
                  <li
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl shadow-sm flex items-start gap-3"
                  >
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        r.sentiment === "Positive"
                          ? "bg-green-200 text-green-800"
                          : r.sentiment === "Negative"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {r.sentiment}
                    </span>
                    <div>
                      <p className="text-gray-700 font-semibold">{r.title}</p>
                      <p className="text-gray-600 text-sm">{r.text}</p>
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-xs underline"
                        >
                          View Post
                        </a>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
