import { useState } from 'react';
import {
  Send,
  Wrench,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  RefreshCw,
  Star
} from 'lucide-react';
import { api, AiMatchResponse, Artisan, currency } from './api';
import { Avatar, Badge, Button, FormError } from './ui';
import { motion, AnimatePresence } from 'motion/react';

const SUGGESTIONS = [
  'Water is leaking from under the kitchen sink onto the tiles',
  'The circuit breaker keeps tripping whenever the AC turns on',
  'Wooden door frame has warped and will not latch closed',
  'Split unit AC is running but blowing warm room temperature air',
  'Need 4 solar panels mounted and connected to hybrid inverter'
];

export function AiAssistant({
  onSelectArtisan
}: {
  onSelectArtisan: (artisan: Artisan) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiMatchResponse | null>(null);

  const handleSearch = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;
    setBusy(true);
    setError('');

    try {
      const data = await api<AiMatchResponse>('/ai/match', 'POST', { prompt: q });
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze project description.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-semibold">
          <Wrench size={14} />
          Project scoping assistant
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
          What needs skilled hands today?
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          Describe the fault or project in your own words. Our AI copilot identifies the exact trade, calculates a realistic Nigerian price estimate, and matches verified professionals.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-3xl p-3 shadow-xl border border-gray-200/80 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. My borehole pump makes a humming sound but does not pump water..."
            className="flex-1 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-none outline-none"
          />
          <Button
            type="submit"
            disabled={busy || !prompt.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
          >
            {busy ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                Analyze & Match <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        {/* Suggestion Pills */}
        <div className="pt-3 border-t border-gray-100 mt-2 flex flex-wrap items-center gap-1.5 px-2">
          <span className="text-xs text-gray-400 font-medium">Try asking:</span>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(s);
                handleSearch(s);
              }}
              className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 px-3 py-1 rounded-full transition truncate max-w-[280px]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <FormError error={error} />}

      {/* AI Analysis Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Scoping Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Wrench size={20} />
                  </span>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                      IDENTIFIED TRADE SPECIALTY
                    </span>
                    <h2 className="text-xl font-bold text-white">{result.trade}</h2>
                  </div>
                </div>

                <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-right">
                  <div className="text-[11px] font-mono text-slate-400">ESTIMATED RANGE</div>
                  <div className="text-lg font-extrabold text-emerald-400">
                    {currency(result.estimatedBudget.min)} – {currency(result.estimatedBudget.max)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>

              {/* Helpful Questions Checklist */}
              {result.keyQuestions?.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 font-mono">
                    <HelpCircle size={14} /> RECOMMENDED QUESTIONS TO CLARIFY
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.keyQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Matched Verified Artisans */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Verified {result.trade}s Available for Booking
                </h3>
                <span className="text-xs text-gray-500">
                  {result.recommendedArtisans.length} matched profiles
                </span>
              </div>

              {result.recommendedArtisans.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-200/80">
                  <ShieldCheck size={36} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-medium">No verified {result.trade}s published yet in this area.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Artisans appear here after creating an account and completing Didit verification.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendedArtisans.map((artisan) => (
                    <motion.div
                      key={artisan.id}
                      whileHover={{ y: -3 }}
                      className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition border border-gray-200/80 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={artisan.display_name} url={artisan.avatar_url} />
                            <div>
                              <h4 className="font-bold text-sm text-gray-900">
                                {artisan.display_name}
                              </h4>
                              <p className="text-xs text-gray-500">{artisan.trade} · {artisan.area}</p>
                            </div>
                          </div>
                          <Badge green>Identity verified</Badge>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {artisan.headline}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Base inspection fee</span>
                          <strong className="text-sm text-gray-900">{currency(artisan.base_fee)}</strong>
                        </div>
                        <Button
                          onClick={() => onSelectArtisan(artisan)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition"
                        >
                          Book Artisan <ArrowRight size={14} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
