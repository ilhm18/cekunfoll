import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { DashboardView } from './components/DashboardView';
import { Footer } from './components/Footer';
import { AnalysisResult } from './types';
import { getSampleAnalysis } from './utils/sampleData';

export default function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  const handleLoadDemo = () => {
    const demo = getSampleAnalysis();
    setAnalysisData(demo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnalysisData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-rose-500/20 selection:text-rose-200">
      {/* Simple Header */}
      <Header
        hasData={!!analysisData}
        onReset={handleReset}
        onLoadDemo={handleLoadDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {analysisData ? (
          <DashboardView data={analysisData} onReset={handleReset} />
        ) : (
          <UploadSection
            onAnalysisComplete={(res) => setAnalysisData(res)}
          />
        )}
      </main>

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}
