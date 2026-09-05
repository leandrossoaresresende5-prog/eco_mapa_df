import React, { useState } from 'react';
import { MobileSimulator } from './components/MobileSimulator';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { Smartphone, Code2, Download, ExternalLink, Leaf } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'simulator' | 'code' | 'split'>('split');

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Top Application Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-white tracking-wide">EcoMapa DF</h1>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                Flutter 3.44+ & Android
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Ciência Cidadã & Engenharia de Materiais • Riacho Fundo I
            </p>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">App</span> Mobile
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`hidden lg:flex px-3 py-1.5 rounded-lg font-semibold items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lado a Lado
            </button>

            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'code'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Código Flutter
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'simulator' && (
          <div className="flex-1 h-full overflow-hidden flex items-center justify-center bg-slate-900/60">
            <MobileSimulator />
          </div>
        )}

        {viewMode === 'code' && (
          <div className="flex-1 h-full overflow-hidden">
            <FlutterCodeViewer />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Left/Top: Mobile Simulator */}
            <div className="w-full lg:w-[480px] xl:w-[520px] h-full overflow-hidden shrink-0 border-r border-slate-800 flex items-center justify-center bg-slate-900/40">
              <MobileSimulator />
            </div>

            {/* Right/Bottom: Code & Guide */}
            <div className="flex-1 h-full overflow-hidden">
              <FlutterCodeViewer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
