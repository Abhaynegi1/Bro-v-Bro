import React, { useState, useEffect } from 'react';
import { Swords, PlusCircle, LogIn, Trophy, AlertCircle, ArrowRight } from 'lucide-react';

interface LandingViewProps {
  onCreateRoom: (hostName: string, targetWins: number) => Promise<void>;
  onJoinRoom: (code: string, guestName: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  isLoading,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [hostName, setHostName] = useState('');
  const [targetWins, setTargetWins] = useState<number>(3);
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');

  // Check URL query parameters for ?code=ABCDE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim() || isLoading) return;
    await onCreateRoom(hostName.trim(), targetWins);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !guestName.trim() || isLoading) return;
    await onJoinRoom(joinCode.trim().toUpperCase(), guestName.trim());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-xl mx-auto w-full">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400 mb-6 shadow-sm">
        <Swords className="w-3.5 h-3.5" />
        <span>1v1 Browser Game Night</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display text-center tracking-tight text-white mb-3">
        BRO <span className="text-rose-500 italic">v</span> BRO
      </h1>
      <p className="text-slate-400 text-center text-sm sm:text-base max-w-md mb-8">
        Two bros. Multiple mini-games. One winner. Hop in a room, battle across quick rounds, and claim ultimate bragging rights.
      </p>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="w-full mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Action Card */}
      <div className="w-full bg-[#121826] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Room</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'join'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>

        {/* Form: Create Room */}
        {activeTab === 'create' ? (
          <form onSubmit={handleCreateSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Bro Name
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. Ludwig"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Series Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { wins: 1, label: 'Single Game' },
                  { wins: 3, label: 'First to 3' },
                  { wins: 5, label: 'First to 5' },
                ].map((opt) => (
                  <button
                    key={opt.wins}
                    type="button"
                    onClick={() => setTargetWins(opt.wins)}
                    className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all ${
                      targetWins === opt.wins
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !hostName.trim()}
              className="w-full arcade-button py-3.5 px-6 rounded-xl font-display font-bold text-base bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>CREATE ROOM</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Form: Join Room */
          <form onSubmit={handleJoinSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Room Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. BRO42"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-mono font-bold tracking-widest text-center text-xl uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Bro Name
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. Connor"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-medium text-base"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !joinCode.trim() || !guestName.trim()}
              className="w-full arcade-button py-3.5 px-6 rounded-xl font-display font-bold text-base bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>JOIN ROOM</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mt-8">
        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
        <span>No signup required. Instant 1v1 browser play.</span>
      </div>
    </div>
  );
};
