import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

interface BankQuestion {
  _id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  idealAnswer: string;
}

const difficultyColor: Record<string, string> = {
  easy: 'text-sage',
  medium: 'text-gold',
  hard: 'text-stamp',
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (topicFilter) params.topic = topicFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      const res = await api.get('/questions', { params });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFilter, difficultyFilter]);

  const handleSave = async (q: BankQuestion) => {
    try {
      await api.post('/questions/save', { questionId: q._id });
      setSavedIds((prev) => new Set(prev).add(q._id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex">
      <Navbar />

      <div className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-[640px]">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-1">QUESTION BANK</p>
              <h1 className="font-display font-bold text-2xl text-ink">Browse & practice.</h1>
            </div>
            <button
              onClick={() => navigate('/questions/generate')}
              className="flex items-center gap-1.5 bg-ink text-paper font-display font-medium text-sm px-4 py-2.5 rounded hover:opacity-90 transition"
            >
              <Sparkles size={14} />
              Generate new
            </button>
          </div>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              placeholder="Filter by topic..."
              className="flex-1 border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-ink transition-colors"
            />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-ink transition-colors bg-paper"
            >
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-[#8a8578]">Loading questions...</p>
          ) : questions.length === 0 ? (
            <div className="border border-line rounded-lg p-8 text-center">
              <p className="text-sm text-[#8a8578] mb-3">No questions found.</p>
              <button
                onClick={() => navigate('/questions/generate')}
                className="text-sm text-stamp font-medium"
              >
                Generate one →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {questions.map((q) => (
                <div key={q._id} className="border border-line rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-[#8a8578] capitalize">{q.topic}</span>
                        <span className={`text-xs font-mono uppercase ${difficultyColor[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">{q.question}</p>
                    </div>
                    <button
                      onClick={() => handleSave(q)}
                      disabled={savedIds.has(q._id)}
                      className="shrink-0 text-[#8a8578] hover:text-ink transition-colors disabled:text-sage"
                      title={savedIds.has(q._id) ? 'Saved' : 'Save question'}
                    >
                      <Bookmark size={16} fill={savedIds.has(q._id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                    className="text-xs text-stamp font-medium mt-2.5"
                  >
                    {expandedId === q._id ? 'Hide answer' : 'Show ideal answer'}
                  </button>

                  {expandedId === q._id && (
                    <p className="text-xs text-[#6b675d] leading-relaxed mt-2.5 pt-2.5 border-t border-line">
                      {q.idealAnswer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}