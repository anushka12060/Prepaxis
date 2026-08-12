import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import api from '../api/axios';

interface Question {
  question: string;
  answer: string;
  feedback: string;
}

interface Session {
  _id: string;
  role: string;
  questions: Question[];
  currentQuestionIndex: number;
  status: string;
  score: number | null;
  overallSummary: string;
  weakTopics: string[];
}

const TOTAL_QUESTIONS = 5;

export default function Interview() {
  const [stage, setStage] = useState<'start' | 'active' | 'complete'>('start');
  const [role, setRole] = useState('');
  const [useResume, setUseResume] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!role.trim()) {
      setError('Please enter a role.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/interview/start', { role, useResume });
      setSession(res.data);
      setStage('active');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to start interview');
      } else {
        setError('Failed to start interview');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !session) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/interview/${session._id}/answer`, { answer });
      setSession(res.data.session);
      setAnswer('');

      if (res.data.isLastQuestion) {
        const completeRes = await api.post(`/interview/${session._id}/complete`);
        setSession(completeRes.data);
        setStage('complete');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to submit answer');
      } else {
        setError('Failed to submit answer');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setStage('start');
    setRole('');
    setUseResume(false);
    setSession(null);
    setAnswer('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-paper flex">
      <Navbar />

      <div className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-[520px]">
          {stage === 'start' && (
            <div className="border border-line rounded-lg p-6">
              <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-1">NEW SESSION</p>
              <h1 className="font-display font-bold text-2xl text-ink mb-7">
                Start a mock interview.
              </h1>

              {error && (
                <div className="bg-stamp/10 border border-stamp text-stamp text-sm rounded px-3 py-2 mb-4">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm text-[#6b675d] mb-1.5">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full border-0 border-b border-line bg-transparent py-2 px-0.5 text-base text-ink outline-none focus:border-ink transition-colors"
                />
              </div>

              <label className="flex items-center gap-2.5 mb-7 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useResume}
                  onChange={(e) => setUseResume(e.target.checked)}
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-sm text-ink">Personalize using my resume</span>
              </label>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-ink text-paper font-display font-medium text-sm py-3 rounded disabled:opacity-50 hover:opacity-90 transition"
              >
                {loading ? 'Starting...' : 'Start interview'}
              </button>
            </div>
          )}

          {stage === 'active' && session && (
            <div className="border border-line rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-lg text-ink">PrepAxis</span>
                <span className="font-mono text-xs text-[#8a8578] uppercase">{session.role}</span>
              </div>

              <div className="flex gap-1.5 mb-5">
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-[3px] rounded-full ${
                      i < session.questions.length ? 'bg-ink' : 'bg-line'
                    }`}
                  />
                ))}
              </div>
              <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-6">
                QUESTION {String(session.currentQuestionIndex + 1).padStart(2, '0')} OF{' '}
                {String(TOTAL_QUESTIONS).padStart(2, '0')}
              </p>

              {error && (
                <div className="bg-stamp/10 border border-stamp text-stamp text-sm rounded px-3 py-2 mb-4">
                  {error}
                </div>
              )}

              <div className="border border-line rounded p-5 mb-5">
                <p className="font-display font-medium text-base text-ink leading-relaxed">
                  {session.questions[session.currentQuestionIndex]?.question}
                </p>
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full min-h-[140px] border border-line rounded px-3.5 py-3 text-sm text-ink outline-none focus:border-ink transition-colors mb-4 resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8a8578]">
                  Take your time — feedback follows each answer.
                </span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading || !answer.trim()}
                  className="bg-ink text-paper font-display font-medium text-sm px-5 py-2.5 rounded disabled:opacity-50 hover:opacity-90 transition"
                >
                  {loading ? 'Submitting...' : 'Submit answer'}
                </button>
              </div>
            </div>
          )}

          {stage === 'complete' && session && (
            <div className="border border-line rounded-lg p-6">
              <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-1">INTERVIEW COMPLETE</p>
              <h1 className="font-display font-bold text-2xl text-ink mb-6">Here's how you did.</h1>

              <div className="border border-line rounded p-5 mb-5 text-center">
                <p className="text-xs text-[#8a8578] mb-1.5">Overall score</p>
                <p className="font-mono text-5xl font-medium text-stamp">{session.score}</p>
              </div>

              <div className="mb-5">
                <p className="text-xs text-[#8a8578] tracking-wide mb-2">SUMMARY</p>
                <p className="text-sm text-ink leading-relaxed">{session.overallSummary}</p>
              </div>

              {session.weakTopics.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-[#8a8578] tracking-wide mb-2">TOPICS TO PRACTICE</p>
                  <div className="flex flex-wrap gap-2">
                    {session.weakTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs text-ink border border-line rounded-full px-3 py-1"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetInterview}
                className="w-full bg-ink text-paper font-display font-medium text-sm py-3 rounded hover:opacity-90 transition"
              >
                Start another interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}