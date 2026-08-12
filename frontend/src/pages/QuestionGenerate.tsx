import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

interface GeneratedQuestion {
  question: string;
  idealAnswer: string;
  topic: string;
  difficulty: string;
}

export default function QuestionGenerate() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [generated, setGenerated] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedToBank, setSavedToBank] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setError('');
    setGenerated(null);
    setSavedToBank(false);
    setBookmarked(false);
    setLoading(true);
    try {
      const res = await api.post('/questions/generate', { topic, difficulty });
      setGenerated(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to generate question');
      } else {
        setError('Failed to generate question');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBank = async () => {
    if (!generated) return;
    setSaving(true);
    try {
      await api.post('/questions/bank', generated);
      setSavedToBank(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBookmark = async () => {
    if (!generated) return;
    setSaving(true);
    try {
      await api.post('/questions/save', { customQuestion: generated });
      setBookmarked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex">
      <Navbar />

      <div className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-[520px]">
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center gap-1.5 text-sm text-[#6b675d] mb-5 hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} />
            Back to bank
          </button>

          <div className="border border-line rounded-lg p-6">
            <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-1">ON DEMAND</p>
            <h1 className="font-display font-bold text-2xl text-ink mb-6">Generate a question.</h1>

            {error && (
              <div className="bg-stamp/10 border border-stamp text-stamp text-sm rounded px-3 py-2 mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-[#6b675d] mb-1.5">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. React, SQL joins, closures"
                className="w-full border-0 border-b border-line bg-transparent py-2 px-0.5 text-base text-ink outline-none focus:border-ink transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#6b675d] mb-1.5">Difficulty</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                      difficulty === level
                        ? 'bg-ink text-paper'
                        : 'border border-line text-[#6b675d] hover:bg-[#eeeae1]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-ink text-paper font-display font-medium text-sm py-3 rounded disabled:opacity-50 hover:opacity-90 transition"
            >
              {loading ? 'Generating...' : 'Generate question'}
            </button>
          </div>

          {generated && (
            <div className="border border-line rounded-lg p-6 mt-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#8a8578] capitalize">{generated.topic}</span>
                <span className="text-xs font-mono uppercase text-stamp">{generated.difficulty}</span>
              </div>
              <p className="text-sm text-ink leading-relaxed mb-4">{generated.question}</p>

              <div className="border-t border-line pt-4 mb-5">
                <p className="text-xs text-[#8a8578] tracking-wide mb-2">IDEAL ANSWER</p>
                <p className="text-xs text-[#6b675d] leading-relaxed">{generated.idealAnswer}</p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleAddToBank}
                  disabled={saving || savedToBank}
                  className="flex-1 border border-line text-ink text-sm font-medium py-2.5 rounded hover:bg-[#eeeae1] transition disabled:opacity-50"
                >
                  {savedToBank ? '✓ Added to bank' : 'Add to bank'}
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={saving || bookmarked}
                  className="flex-1 bg-ink text-paper text-sm font-medium py-2.5 rounded hover:opacity-90 transition disabled:opacity-50"
                >
                  {bookmarked ? '✓ Bookmarked' : 'Bookmark'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}