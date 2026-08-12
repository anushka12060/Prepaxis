import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface DashboardData {
  totalInterviews: number;
  averageScore: number;
  weakTopicsFrequency: Record<string, number>;
  scoreTrend: { date: string; score: number; role: string }[];
  roleBreakdown: Record<string, number>;
  resumesUploaded: number;
  savedQuestionsCount: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex">
        <Navbar />
        <div className="flex-1 p-8 text-[#8a8578] text-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <Navbar />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto border border-line rounded-lg p-6">
          <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-1">
            GOOD MORNING
          </p>
          <h1 className="font-display font-bold text-2xl text-ink mb-7">
            {firstName}'s prep log.
          </h1>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="border border-line rounded p-4">
              <p className="text-xs text-[#8a8578] mb-1.5">Interviews taken</p>
              <p className="font-mono text-[26px] font-medium text-ink">
                {String(data?.totalInterviews ?? 0).padStart(2, "0")}
              </p>
            </div>
            <div className="border border-line rounded p-4">
              <p className="text-xs text-[#8a8578] mb-1.5">Average score</p>
              <p className="font-mono text-[26px] font-medium text-stamp">
                {data?.averageScore ?? 0}
              </p>
            </div>
            <div className="border border-line rounded p-4">
              <p className="text-xs text-[#8a8578] mb-1.5">Saved questions</p>
              <p className="font-mono text-[26px] font-medium text-ink">
                {String(data?.savedQuestionsCount ?? 0).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Score chart */}
          <div className="border border-line rounded p-5 mb-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-xs text-[#8a8578] tracking-wide">
                SCORE PROGRESS
              </p>
              {data && data.scoreTrend.length > 0 && (
                <p className="font-mono text-xs text-[#8a8578]">
                  LATEST:{" "}
                  <span className="text-stamp font-medium">
                    {data.scoreTrend[data.scoreTrend.length - 1].score}
                  </span>
                </p>
              )}
            </div>

            {data && data.scoreTrend.length > 0 ? (
              <div>
                <svg
                  width="100%"
                  height="200"
                  viewBox="0 0 440 170"
                  preserveAspectRatio="none"
                  style={{ display: "block" }}
                >
                  {/* Gridlines */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y = 140 - (val / 100) * 120;
                    return (
                      <g key={val}>
                        <line
                          x1="30"
                          y1={y}
                          x2="440"
                          y2={y}
                          stroke="#D8D3C7"
                          strokeWidth="1"
                          strokeDasharray="2,3"
                        />
                        <text
                          x="0"
                          y={y + 4}
                          fontSize="10"
                          fontFamily="monospace"
                          fill="#8a8578"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill + line */}
                  {(() => {
                    const points = data.scoreTrend;
                    const chartWidth = 400;
                    const chartLeft = 30;
                    const chartTop = 20;
                    const chartHeight = 120;
                    const step =
                      points.length > 1 ? chartWidth / (points.length - 1) : 0;
                    const coords = points.map((p, i) => ({
                      x:
                        chartLeft +
                        (points.length === 1 ? chartWidth / 2 : i * step),
                      y: chartTop + chartHeight - (p.score / 100) * chartHeight,
                      score: p.score,
                    }));
                    const linePoints = coords
                      .map((c) => `${c.x},${c.y}`)
                      .join(" ");
                    const areaPoints = `${chartLeft},${chartTop + chartHeight} ${linePoints} ${
                      coords[coords.length - 1].x
                    },${chartTop + chartHeight}`;

                    return (
                      <>
                        <polygon
                          points={areaPoints}
                          fill="#B23B3B"
                          fillOpacity="0.08"
                        />
                        <polyline
                          points={linePoints}
                          fill="none"
                          stroke="#B23B3B"
                          strokeWidth="2"
                        />
                        {coords.map((c, i) => (
                          <g key={i}>
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r="4"
                              fill="#F3F1EC"
                              stroke="#B23B3B"
                              strokeWidth="2"
                            />
                            <text
                              x={c.x}
                              y={c.y - 10}
                              fontSize="10"
                              fontFamily="monospace"
                              fill="#1C2430"
                              textAnchor="middle"
                            >
                              {c.score}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                {/* X-axis date labels */}
                <div className="flex justify-between pl-[30px] mt-1">
                  {data.scoreTrend.map((p, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-[#8a8578]"
                    >
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8a8578] py-8 text-center">
                Complete an interview to start tracking your progress.
              </p>
            )}
          </div>

          {/* Weak topics + actions */}
          <div className="flex gap-3">
            <div className="flex-1 border border-line rounded p-4">
              <p className="text-xs text-[#8a8578] tracking-wide mb-2.5">
                WEAK TOPICS
              </p>
              {data && Object.keys(data.weakTopicsFrequency).length > 0 ? (
                <div className="flex flex-col gap-2 text-sm text-ink">
                  {Object.entries(data.weakTopicsFrequency).map(
                    ([topic, count]) => (
                      <div
                        key={topic}
                        className="flex justify-between capitalize"
                      >
                        <span>{topic}</span>
                        <span className="text-[#8a8578]">x{count}</span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#8a8578]">No data yet.</p>
              )}
            </div>

            <div className="w-[200px] flex flex-col gap-2">
              <button
                onClick={() => navigate("/interviews")}
                className="bg-ink text-paper text-left px-3 py-3 rounded text-sm font-display font-medium hover:opacity-90 transition"
              >
                Start new interview →
              </button>
              <button
                onClick={() => navigate("/resume")}
                className="border border-line text-ink text-left px-3 py-3 rounded text-sm font-display font-medium hover:bg-[#eeeae1] transition"
              >
                Upload resume →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
