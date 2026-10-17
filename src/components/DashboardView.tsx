import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Star,
  UserX,
  Users,
  HeartHandshake,
  RotateCcw,
  X,
  Download,
  ArrowUpDown,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { AnalysisResult, FilterTab, InstagramUser, SortOrder } from '../types';
import { isDeletedOrGhostAccount } from '../utils/instagramParser';

interface DashboardViewProps {
  data: AnalysisResult;
  onReset: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('not_following_back');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical_asc');
  const [copiedUser, setCopiedUser] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Whitelist persisted in localStorage
  const [whitelist, setWhitelist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cek_unfoll_whitelist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleWhitelist = (username: string) => {
    setWhitelist((prev) => {
      const next = new Set(prev);
      const lower = username.toLowerCase();
      if (next.has(lower)) {
        next.delete(lower);
      } else {
        next.add(lower);
      }
      try {
        localStorage.setItem('cek_unfoll_whitelist', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Filter out any ghost/deleted accounts like __deleted__*
  const cleanNotFollowingBack = useMemo(() => {
    return data.notFollowingBack.filter((u) => !isDeletedOrGhostAccount(u.username));
  }, [data.notFollowingBack]);

  const cleanFans = useMemo(() => {
    return data.fans.filter((u) => !isDeletedOrGhostAccount(u.username));
  }, [data.fans]);

  const cleanMutual = useMemo(() => {
    return data.mutual.filter((u) => !isDeletedOrGhostAccount(u.username));
  }, [data.mutual]);

  const cleanFollowing = useMemo(() => {
    return data.following.filter((u) => !isDeletedOrGhostAccount(u.username));
  }, [data.following]);

  const cleanFollowers = useMemo(() => {
    return data.followers.filter((u) => !isDeletedOrGhostAccount(u.username));
  }, [data.followers]);

  const cleanWhitelisted = useMemo(() => {
    return cleanFollowing.filter((u) => whitelist.has(u.username.toLowerCase()));
  }, [cleanFollowing, whitelist]);

  // Base list depending on active tab
  const baseList = useMemo<InstagramUser[]>(() => {
    switch (activeTab) {
      case 'not_following_back':
        return cleanNotFollowingBack;
      case 'fans':
        return cleanFans;
      case 'mutual':
        return cleanMutual;
      case 'whitelisted':
        return cleanWhitelisted;
      default:
        return cleanNotFollowingBack;
    }
  }, [activeTab, cleanNotFollowingBack, cleanFans, cleanMutual, cleanWhitelisted]);

  // Filtered by search and sorted
  const displayList = useMemo(() => {
    let list = [...baseList];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((u) => u.username.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (sortOrder === 'alphabetical_asc') {
        return a.username.localeCompare(b.username);
      }
      if (sortOrder === 'alphabetical_desc') {
        return b.username.localeCompare(a.username);
      }
      if (sortOrder === 'newest') {
        return (b.timestamp || 0) - (a.timestamp || 0);
      }
      if (sortOrder === 'oldest') {
        return (a.timestamp || 0) - (b.timestamp || 0);
      }
      return 0;
    });

    return list;
  }, [baseList, searchQuery, sortOrder]);

  const handleCopySingle = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUser(username);
    setTimeout(() => setCopiedUser(null), 2000);
  };

  const handleCopyAll = () => {
    const text = displayList.map((u) => `@${u.username}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportTXT = () => {
    const text = displayList.map((u) => u.username).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unfollowers_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Hasil Analisis Akun</h2>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              Selesai
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 font-mono">
            {cleanFollowing.length} Following · {cleanFollowers.length} Followers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Upload File Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Unfollow */}
        <button
          onClick={() => setActiveTab('not_following_back')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'not_following_back'
              ? 'bg-rose-500/15 border-rose-500/60 shadow-lg shadow-rose-500/10'
              : 'bg-neutral-900/80 border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-400">
            <span>Unfollow</span>
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-white">
            {cleanNotFollowingBack.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">tidak mengikuti kembali</p>
        </button>

        {/* Follower */}
        <button
          onClick={() => setActiveTab('fans')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'fans'
              ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
              : 'bg-neutral-900/80 border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Follower</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-white">
            {cleanFans.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">pengikut yang tidak anda follback</p>
        </button>

        {/* Mutuals */}
        <button
          onClick={() => setActiveTab('mutual')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'mutual'
              ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
              : 'bg-neutral-900/80 border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Mutuals</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono tabular-nums text-white">
            {cleanMutual.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Saling mengikuti (mutual)</p>
        </button>
      </div>

      {/* Pemberitahuan: Mengapa ada akun yang tidak ditemukan saat dibuka */}
      <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/70 backdrop-blur-md overflow-hidden transition-all shadow-md">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full p-4 flex items-center justify-between text-left text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Pemberitahuan: Kenapa ada akun yang tidak ditemukan atau tidak ada saat dibuka?
              </p>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                Penyebab munculnya pesan &quot;Sorry, this page isn&apos;t available&quot; di Instagram
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-[11px] text-rose-400 font-semibold hidden sm:inline">
              {showExplanation ? 'Tutup' : 'Lihat Penyebab'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                showExplanation ? 'rotate-180 text-rose-400' : ''
              }`}
            />
          </div>
        </button>

        {showExplanation && (
          <div className="px-5 pb-5 pt-1 text-xs text-neutral-300 border-t border-white/[0.06] space-y-3">
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Jika Anda menekan tombol <strong>&quot;Buka IG&quot;</strong> dan mendapati akun tidak ada atau halaman tidak tersedia, berikut beberapa penyebab utamanya:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider">1. Akun Ditutup Sementara</span>
                <p className="text-xs font-semibold text-white">Deactivate Akun</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Pemilik akun sedang menonaktifkan akunnya untuk istirahat dari media sosial. Akun tidak akan muncul di Instagram hingga pemiliknya login kembali.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">2. Akun Dihapus / Banned</span>
                <p className="text-xs font-semibold text-white">Akun Dihapus Permanen</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Akun telah dihapus secara permanen oleh pemiliknya atau ditutup oleh Instagram karena melanggar pedoman komunitas.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-purple-400 font-mono uppercase tracking-wider">3. Mengganti Username</span>
                <p className="text-xs font-semibold text-white">Ganti Nama Pengguna</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Pemilik akun telah mengganti username lamanya ke nama baru setelah berkas unduhan Meta Anda dibuat, sehingga link username lama tidak ditemukan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">4. Akun Diblokir</span>
                <p className="text-xs font-semibold text-white">Pemblokiran Akun</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Pemilik akun memblokir akun Anda (atau sebaliknya), sehingga profil mereka tidak dapat diakses atau dilihat dari akun Anda.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-400">
              💡 <strong>Catatan:</strong> Data pada aplikasi ini bersumber langsung dari berkas unduhan resmi Meta pada tanggal Anda meminta ekspor data.
            </div>
          </div>
        )}
      </div>

      {/* Main List Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="p-3 border-b border-white/[0.08] bg-neutral-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('not_following_back')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'not_following_back'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Unfollow ({cleanNotFollowingBack.length})
            </button>
            <button
              onClick={() => setActiveTab('fans')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'fans'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Follower ({cleanFans.length})
            </button>
            <button
              onClick={() => setActiveTab('mutual')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'mutual'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Mutuals ({cleanMutual.length})
            </button>
            <button
              onClick={() => setActiveTab('whitelisted')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'whitelisted'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Whitelist ({cleanWhitelisted.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              disabled={displayList.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-neutral-200 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Tersalin!' : 'Salin Semua (@)'}</span>
            </button>

            <button
              onClick={handleExportTXT}
              disabled={displayList.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-neutral-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Download daftar sebagai TXT"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>
          </div>
        </div>

        {/* Live Search & Sorter Bar */}
        <div className="p-3.5 border-b border-white/[0.06] bg-neutral-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari username akun..."
              className="w-full bg-neutral-950/80 border border-white/10 focus:border-rose-500 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sorter */}
            <div className="flex items-center gap-1.5 bg-neutral-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 hidden sm:inline">Urutan:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="bg-transparent outline-none cursor-pointer text-neutral-200 text-xs"
              >
                <option value="alphabetical_asc" className="bg-neutral-900">A - Z (Abjad)</option>
                <option value="alphabetical_desc" className="bg-neutral-900">Z - A (Abjad)</option>
                <option value="newest" className="bg-neutral-900">Follow Terbaru</option>
                <option value="oldest" className="bg-neutral-900">Follow Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Rows */}
        {displayList.length === 0 ? (
          <div className="p-10 text-center text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-300">Tidak ada akun yang ditemukan</p>
            <p>
              {searchQuery
                ? `Tidak ada username yang cocok dengan "${searchQuery}"`
                : 'Kategori ini kosong.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[520px] overflow-y-auto">
            {displayList.map((user, idx) => {
              const lower = user.username.toLowerCase();
              const isWhitelisted = whitelist.has(lower);
              const initial = user.username.charAt(0).toUpperCase();

              return (
                <div
                  key={user.username + idx}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Left: Avatar with story gradient ring & username */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono tabular-nums text-neutral-500 w-5 text-right shrink-0">
                      {idx + 1}
                    </span>

                    {/* Avatar */}
                    <div className="p-[2px] rounded-full shrink-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                      <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center font-bold text-xs text-white">
                        {initial}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold truncate text-white">
                          @{user.username}
                        </span>

                        {isWhitelisted && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded-md border border-amber-500/20">
                            Whitelist
                          </span>
                        )}
                      </div>

                      {user.dateStr && (
                        <p className="text-[11px] text-neutral-400 font-mono">
                          Di-follow: {user.dateStr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Whitelist Star */}
                    <button
                      onClick={() => toggleWhitelist(user.username)}
                      title={isWhitelisted ? 'Hapus dari whitelist' : 'Simpan ke whitelist (jangan unfollow)'}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isWhitelisted
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 scale-105'
                          : 'bg-white/[0.04] border-white/10 text-neutral-400 hover:text-amber-400 hover:bg-white/[0.08]'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isWhitelisted ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Copy Username */}
                    <button
                      onClick={() => handleCopySingle(user.username)}
                      title="Salin username"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 transition-colors cursor-pointer"
                    >
                      {copiedUser === user.username ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Direct Instagram Link */}
                    <a
                      href={`https://www.instagram.com/${user.username}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                      <span>Buka IG</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-neutral-950/70 border-t border-white/[0.06] text-xs text-neutral-400 flex items-center justify-between">
          <span>Menampilkan {displayList.length} dari {baseList.length} akun</span>
          <span className="text-[11px] text-neutral-500">Tips: Unfollow perlahan agar akun tetap aman</span>
        </div>
      </div>
    </div>
  );
};
