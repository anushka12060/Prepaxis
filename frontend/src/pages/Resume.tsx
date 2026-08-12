import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileCheck2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

interface SavedResume {
  _id: string;
  originalFilename: string | null;
  sourceType: 'file' | 'pasted';
  rawText: string;
  createdAt: string;
}

export default function Resume() {
  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentResume, setCurrentResume] = useState<SavedResume | null>(null);
  const [fetchingResume, setFetchingResume] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCurrentResume = async () => {
    setFetchingResume(true);
    try {
      const res = await api.get('/resume');
      setCurrentResume(res.data);
    } catch {
      setCurrentResume(null);
    } finally {
      setFetchingResume(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCurrentResume();
  }, []);

  const handleFileSelect = (selected: File | undefined) => {
    if (!selected) return;
    setFile(selected);
    setError('');
    setSuccess('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'file') {
        if (!file) {
          setError('Please select a file first.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('resume', file);
        await api.post('/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 50) {
          setError('Please paste at least 50 characters of resume text.');
          setLoading(false);
          return;
        }
        await api.post('/resume/upload', { resumeText: pastedText });
      }
      setSuccess('Resume saved to your file.');
      setFile(null);
      setPastedText('');
      void fetchCurrentResume();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save resume');
      } else {
        setError('Failed to save resume');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex">
      <Navbar />

      <div className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-[440px]">
          {/* Upload form — action card, bordered */}
          <div className="border border-line rounded-lg p-6 mb-6">
            <p className="font-mono text-xs text-[#8a8578] tracking-widest mb-1">
              CANDIDATE FILE
            </p>
            <h1 className="font-display font-bold text-2xl text-ink mb-7">
              {currentResume ? 'Replace your resume.' : 'Attach your resume.'}
            </h1>

            <div className="flex border-b border-line mb-5">
              <button
                onClick={() => setMode('file')}
                className={
                  mode === 'file'
                    ? 'px-4 py-2 text-sm font-medium text-ink border-b-2 border-ink -mb-px'
                    : 'px-4 py-2 text-sm text-[#8a8578]'
                }
              >
                Upload file
              </button>
              <button
                onClick={() => setMode('paste')}
                className={
                  mode === 'paste'
                    ? 'px-4 py-2 text-sm font-medium text-ink border-b-2 border-ink -mb-px'
                    : 'px-4 py-2 text-sm text-[#8a8578]'
                }
              >
                Paste text
              </button>
            </div>

            {error && (
              <div className="bg-stamp/10 border border-stamp text-stamp text-sm rounded px-3 py-2 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-sage/10 border border-sage text-sage text-sm rounded px-3 py-2 mb-4">
                {success}
              </div>
            )}

            {mode === 'file' ? (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-[1.5px] border-dashed rounded-md py-9 px-6 text-center mb-5 cursor-pointer transition-colors flex flex-col items-center gap-2.5 ${
                    dragOver ? 'border-ink bg-[#eeeae1]' : 'border-[#c4bfb0] hover:border-ink hover:bg-[#f7f5f0]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#eeeae1] flex items-center justify-center">
                    <UploadCloud size={20} className="text-[#8a8578]" />
                  </div>
                  <p className="text-sm text-ink font-medium">Drop your file here</p>
                  <p className="text-xs text-[#8a8578]">or click to browse — PDF or DOCX, up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>

                {file && (
                  <div className="border border-line rounded px-3.5 py-3 flex items-center justify-between mb-5">
                    <span className="text-sm text-ink truncate">{file.name}</span>
                    <span className="text-sage text-sm">✓</span>
                  </div>
                )}
              </>
            ) : (
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full min-h-[200px] border border-line rounded px-3.5 py-3 text-sm text-ink outline-none focus:border-ink transition-colors mb-5 resize-none"
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-ink text-paper font-display font-medium text-sm py-3 rounded disabled:opacity-50 hover:opacity-90 transition"
            >
              {loading ? 'Saving...' : 'Save to file'}
            </button>
          </div>

          {/* Currently on file — status card, softer treatment */}
          {!fetchingResume && currentResume && (
            <div className="bg-sage/[0.06] border border-sage/30 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/15 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck2 size={15} className="text-sage" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink">
                      {currentResume.originalFilename || 'Pasted text'}
                    </span>
                    <span className="text-[11px] font-mono text-sage tracking-wide">ACTIVE</span>
                  </div>
                  <p className="text-xs text-[#8a8578] mb-2">
                    On file since{' '}
                    {new Date(currentResume.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-[#6b675d] line-clamp-2 leading-relaxed">
                    {currentResume.rawText.slice(0, 130)}...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}