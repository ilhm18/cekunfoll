import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  FileArchive,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  parseInstagramZip,
  parseInstagramHTML,
  parseInstagramJSON,
  computeAnalysis,
  AnalysisProgressStep,
} from '../utils/instagramParser';
import { AnalysisResult, InstagramUser } from '../types';

interface UploadSectionProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalysisComplete,
}) => {
  const [uploadMode, setUploadMode] = useState<'zip' | 'files'>('zip');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgressStep | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Zip state
  const [zipFile, setZipFile] = useState<File | null>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Two files state
  const [followingFile, setFollowingFile] = useState<File | null>(null);
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const followingInputRef = useRef<HTMLInputElement>(null);
  const followersInputRef = useRef<HTMLInputElement>(null);

  const handleZipChange = (file: File) => {
    setErrorMessage(null);
    setZipFile(file);
    processZip(file);
  };

  const processZip = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setProgress({
      step: 1,
      totalSteps: 4,
      message: 'Membuka dan membaca berkas ZIP...',
      subMessage: file.name,
      percent: 15,
    });

    try {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('Pilih file berformat .zip dari unduhan resmi Instagram.');
      }
      const result = await parseInstagramZip(file, (p) => {
        setProgress(p);
      });

      // Brief final state so user sees 100% completed
      setProgress({
        step: 4,
        totalSteps: 4,
        message: 'Analisis Selesai! Menyiapkan tampilan...',
        subMessage: `${result.notFollowingBack.length} akun tidak mengikuti kembali`,
        percent: 100,
        followingCount: result.following.length,
        followersCount: result.followers.length,
      });

      await new Promise((r) => setTimeout(r, 400));
      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membaca file ZIP. Pastikan file unduhan valid.');
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleProcessFiles = async () => {
    if (!followingFile || !followersFile) {
      setErrorMessage('Harap pilih kedua file: Following dan Followers.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setProgress({
      step: 1,
      totalSteps: 4,
      message: 'Membaca berkas Following dan Followers...',
      subMessage: `${followingFile.name} & ${followersFile.name}`,
      percent: 25,
    });

    try {
      await new Promise((r) => setTimeout(r, 200));

      const readText = (f: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(f);
        });

      const followingText = await readText(followingFile);
      const followersText = await readText(followersFile);

      setProgress({
        step: 2,
        totalSteps: 4,
        message: 'Mengekstrak data Following & Followers...',
        subMessage: 'Membaca daftar akun dari file...',
        percent: 50,
      });
      await new Promise((r) => setTimeout(r, 250));

      let followingUsers: InstagramUser[] = [];
      let followersUsers: InstagramUser[] = [];

      if (followingFile.name.endsWith('.json')) {
        followingUsers = parseInstagramJSON(JSON.parse(followingText));
      } else {
        followingUsers = parseInstagramHTML(followingText);
      }

      if (followersFile.name.endsWith('.json')) {
        followersUsers = parseInstagramJSON(JSON.parse(followersText));
      } else {
        followersUsers = parseInstagramHTML(followersText);
      }

      if (followingUsers.length === 0 && followersUsers.length === 0) {
        throw new Error('Tidak ditemukan data akun di dalam file tersebut.');
      }

      setProgress({
        step: 3,
        totalSteps: 4,
        message: 'Menganalisis perbandingan akun...',
        subMessage: `Memeriksa ${followingUsers.length} akun following...`,
        percent: 80,
        followingCount: followingUsers.length,
        followersCount: followersUsers.length,
      });
      await new Promise((r) => setTimeout(r, 300));

      const result = computeAnalysis(
        followingUsers,
        followersUsers,
        followingFile.name.endsWith('.json') ? 'json' : 'html'
      );

      setProgress({
        step: 4,
        totalSteps: 4,
        message: 'Analisis Selesai! Menampilkan hasil...',
        subMessage: `${result.notFollowingBack.length} akun tidak mengikuti kembali`,
        percent: 100,
        followingCount: result.following.length,
        followersCount: result.followers.length,
      });
      await new Promise((r) => setTimeout(r, 400));

      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file. Periksa kembali formatnya.');
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 relative">
      {/* Ambient Gradient Glow Background */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-rose-500/20 via-pink-500/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Title */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Cek Unfollowers Instagram
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Ketahui siapa saja yang tidak follback akunmu secara instan.
          <span className="text-neutral-300 font-medium"> 100% aman tanpa login & tanpa password.</span>
        </p>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Bebas Banned
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Deteksi Cepat
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <FileArchive className="w-3.5 h-3.5 text-rose-400" />
            Format ZIP / HTML / JSON
          </span>
        </div>
      </div>

      {/* Main Upload / Analysis Card */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-white/0 shadow-2xl">
        <div className="bg-neutral-900/90 backdrop-blur-xl rounded-[15px] p-5 sm:p-7 space-y-5">
          {isLoading ? (
            /* Dedicated Analysis Scanner Panel */
            <div className="py-6 px-2 text-center space-y-6 animate-in fade-in duration-300">
              {/* Radar pulse effect */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 animate-ping opacity-25" />
                <div className="relative w-20 h-20 rounded-full bg-neutral-950 border-2 border-rose-500/60 flex items-center justify-center shadow-xl shadow-rose-500/20">
                  <Loader2 className="w-9 h-9 text-rose-400 animate-spin" />
                </div>
              </div>

              {/* Status Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Tahap {progress?.step || 1} dari {progress?.totalSteps || 4}: Menganalisis Akun</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {progress?.message || 'Sedang Menganalisis Akun...'}
                </h3>
                {progress?.subMessage && (
                  <p className="text-xs text-neutral-400 font-mono">
                    {progress.subMessage}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 max-w-md mx-auto">
                <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-white/10 p-[1px]">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${progress?.percent || 20}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>Memproses data akun...</span>
                  <span className="font-bold text-rose-400">{progress?.percent || 20}%</span>
                </div>
              </div>


              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Analisis akun diproses secara aman langsung di browsermu tanpa login dan tanpa password.
              </p>
            </div>
          ) : (
            <>
              {/* Toggle Mode */}
              <div className="flex p-1 bg-neutral-950/80 rounded-xl border border-white/[0.08] text-xs font-semibold">
                <button
                  onClick={() => {
                    setUploadMode('zip');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadMode === 'zip'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  <span>File ZIP (Otomatis & Lengkap)</span>
                </button>
                <button
                  onClick={() => {
                    setUploadMode('files');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadMode === 'files'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>File HTML / JSON</span>
                </button>
              </div>

              {/* Mode 1: ZIP Upload */}
              {uploadMode === 'zip' && (
                <div className="space-y-4">
                  <div
                    onClick={() => zipInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleZipChange(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 space-y-3 ${
                      isDragOver
                        ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
                        : 'border-white/15 hover:border-rose-500/60 bg-neutral-950/50 hover:bg-neutral-950/80'
                    }`}
                  >
                    <input
                      ref={zipInputRef}
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleZipChange(e.target.files[0]);
                        }
                      }}
                    />

                    {/* Animated Upload Icon */}
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                      <Upload className="w-7 h-7 group-hover:-translate-y-0.5 transition-transform" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        {zipFile ? zipFile.name : 'Pilih atau Tarik File ZIP ke Sini'}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        File unduhan resmi dari Meta: <code className="text-rose-400 font-mono">instagram-*.zip</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Separate HTML / JSON Files */}
              {uploadMode === 'files' && (
                <div className="space-y-3">
                  {/* Following */}
                  <div
                    onClick={() => followingInputRef.current?.click()}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      followingFile
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/10 bg-neutral-950/50 hover:border-white/20'
                    }`}
                  >
                    <input
                      ref={followingInputRef}
                      type="file"
                      accept=".html,.htm,.json"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setFollowingFile(e.target.files[0]);
                      }}
                    />
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          followingFile
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {followingFile ? <CheckCircle2 className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-neutral-200">1. File Following</p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {followingFile ? followingFile.name : 'Pilih following.html atau .json'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-rose-400 font-semibold shrink-0 ml-2">
                      {followingFile ? 'Ganti' : 'Pilih File'}
                    </span>
                  </div>

                  {/* Followers */}
                  <div
                    onClick={() => followersInputRef.current?.click()}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      followersFile
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/10 bg-neutral-950/50 hover:border-white/20'
                    }`}
                  >
                    <input
                      ref={followersInputRef}
                      type="file"
                      accept=".html,.htm,.json"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setFollowersFile(e.target.files[0]);
                      }}
                    />
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          followersFile
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {followersFile ? <CheckCircle2 className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-neutral-200">2. File Followers</p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {followersFile ? followersFile.name : 'Pilih followers_1.html atau .json'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-rose-400 font-semibold shrink-0 ml-2">
                      {followersFile ? 'Ganti' : 'Pilih File'}
                    </span>
                  </div>

                  <button
                    onClick={handleProcessFiles}
                    disabled={!followingFile || !followersFile}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      followingFile && followersFile
                        ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95 text-white shadow-lg shadow-rose-600/30 active:scale-[0.99]'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Mulai Analisis Unfollowers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Visual Step-by-Step Guide Accordion */}
      <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 backdrop-blur-md overflow-hidden text-xs">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full p-4 flex items-center justify-between text-left text-neutral-300 font-semibold hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>Panduan Cara Download Data Instagram </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
              showGuide ? 'rotate-180 text-rose-400' : ''
            }`}
          />
        </button>

        {showGuide && (
          <div className="px-5 pb-5 space-y-3 text-neutral-400 border-t border-white/[0.06] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider">Langkah 1</span>
                <p className="text-xs text-neutral-200 font-medium">Buka Pusat Akun</p>
                <p className="text-[11px] text-neutral-400">Instagram &gt; Profil &gt; Garis 3 di pojok &gt; Pusat Akun (Accounts Center).</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider">Langkah 2</span>
                <p className="text-xs text-neutral-200 font-medium">Unduh Informasi Anda</p>
                <p className="text-[11px] text-neutral-400">Pilih 'Informasi dan izin Anda' &gt; lalu 'Unduh informasi Anda'.</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider">Langkah 3</span>
                <p className="text-xs text-neutral-200 font-medium">Pilih Followers & Following</p>
                <p className="text-[11px] text-neutral-400">Pilih 'Pilih jenis informasi' &gt; Centang hanya <strong>'Pengikut dan yang diikuti'</strong>.</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono tracking-wider">Langkah 4</span>
                <p className="text-xs text-neutral-200 font-medium">Download & Masukkan File</p>
                <p className="text-[11px] text-neutral-400">Format: HTML/JSON. Tunggu email notifikasi Meta lalu upload file ZIP ke sini!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
