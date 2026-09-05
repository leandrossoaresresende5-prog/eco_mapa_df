import React, { useState } from 'react';
import { WastePoint } from '../types';
import { INITIAL_DEMO_POINTS } from '../data/demoData';
import { HomeScreen } from './HomeScreen';
import { MapScreen } from './MapScreen';
import { RegisterScreen } from './RegisterScreen';
import { StatisticsScreen } from './StatisticsScreen';
import { EcopointsScreen } from './EcopointsScreen';
import { AboutScreen } from './AboutScreen';
import { Home, MapPin, PlusCircle, BarChart3, Wifi, Battery, Signal, RotateCcw } from 'lucide-react';

export const MobileSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Inicio, 1: Mapa, 2: Registrar, 3: Estatísticas
  const [subView, setSubView] = useState<'none' | 'about' | 'ecopoints'>('none');
  const [points, setPoints] = useState<WastePoint[]>(() => {
    // Tenta carregar do localStorage ou usa demo points
    const saved = localStorage.getItem('ecomapa_df_points');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_POINTS;
      }
    }
    return INITIAL_DEMO_POINTS;
  });

  const handlePointRegistered = (newPoint: WastePoint) => {
    const updated = [newPoint, ...points];
    setPoints(updated);
    localStorage.setItem('ecomapa_df_points', JSON.stringify(updated));
  };

  const handleResetToDemo = () => {
    setPoints(INITIAL_DEMO_POINTS);
    localStorage.setItem('ecomapa_df_points', JSON.stringify(INITIAL_DEMO_POINTS));
  };

  const currentTimeString = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full h-full bg-slate-900/40">
      {/* Device frame */}
      <div className="relative w-full max-w-[420px] h-[780px] max-h-[92vh] bg-slate-950 rounded-[40px] shadow-2xl p-3 border-4 border-slate-800 flex flex-col">
        {/* Device camera notch & speaker */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded-full ml-3" />
        </div>

        {/* Screen container */}
        <div className="relative flex-1 bg-white rounded-[32px] overflow-hidden flex flex-col shadow-inner">
          {/* Android Status Bar */}
          <div className="bg-white/95 px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-800 z-40 border-b border-slate-100">
            <span>{currentTimeString}</span>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 relative overflow-hidden">
            {subView === 'about' ? (
              <AboutScreen onBack={() => setSubView('none')} />
            ) : subView === 'ecopoints' ? (
              <EcopointsScreen onBack={() => setSubView('none')} />
            ) : (
              <>
                {activeTab === 0 && (
                  <HomeScreen
                    onNavigateTab={(idx) => setActiveTab(idx)}
                    onOpenAbout={() => setSubView('about')}
                    onOpenEcopoints={() => setSubView('ecopoints')}
                  />
                )}
                {activeTab === 1 && <MapScreen points={points} />}
                {activeTab === 2 && (
                  <RegisterScreen
                    onPointRegistered={handlePointRegistered}
                    onNavigateToMap={() => setActiveTab(1)}
                  />
                )}
                {activeTab === 3 && <StatisticsScreen points={points} />}
              </>
            )}
          </div>

          {/* Android Material 3 Bottom Navigation Bar */}
          {subView === 'none' && (
            <div className="bg-white/98 border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-30 shadow-md">
              {/* Tab 0: Início */}
              <button
                id="nav-tab-inicio"
                onClick={() => setActiveTab(0)}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                  activeTab === 0
                    ? 'text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`px-4 py-1 rounded-full transition-colors ${
                    activeTab === 0 ? 'bg-emerald-100' : 'bg-transparent'
                  }`}
                >
                  <Home className={`w-5 h-5 ${activeTab === 0 ? 'text-emerald-800' : 'text-slate-600'}`} />
                </div>
                <span className="text-[11px] font-semibold mt-0.5">Início</span>
              </button>

              {/* Tab 1: Mapa */}
              <button
                id="nav-tab-mapa"
                onClick={() => setActiveTab(1)}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                  activeTab === 1
                    ? 'text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`px-4 py-1 rounded-full transition-colors ${
                    activeTab === 1 ? 'bg-emerald-100' : 'bg-transparent'
                  }`}
                >
                  <MapPin className={`w-5 h-5 ${activeTab === 1 ? 'text-emerald-800' : 'text-slate-600'}`} />
                </div>
                <span className="text-[11px] font-semibold mt-0.5">Mapa</span>
              </button>

              {/* Tab 2: Registrar */}
              <button
                id="nav-tab-registrar"
                onClick={() => setActiveTab(2)}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                  activeTab === 2
                    ? 'text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`px-4 py-1 rounded-full transition-colors ${
                    activeTab === 2 ? 'bg-emerald-100' : 'bg-transparent'
                  }`}
                >
                  <PlusCircle className={`w-5 h-5 ${activeTab === 2 ? 'text-emerald-800' : 'text-slate-600'}`} />
                </div>
                <span className="text-[11px] font-semibold mt-0.5">Registrar</span>
              </button>

              {/* Tab 3: Estatísticas */}
              <button
                id="nav-tab-estatisticas"
                onClick={() => setActiveTab(3)}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                  activeTab === 3
                    ? 'text-emerald-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`px-4 py-1 rounded-full transition-colors ${
                    activeTab === 3 ? 'bg-emerald-100' : 'bg-transparent'
                  }`}
                >
                  <BarChart3 className={`w-5 h-5 ${activeTab === 3 ? 'text-emerald-800' : 'text-slate-600'}`} />
                </div>
                <span className="text-[11px] font-semibold mt-0.5">Estatísticas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulator footer controls */}
      <div className="mt-2 text-xs text-slate-400 flex items-center gap-4">
        <span>Simulador Android Material 3</span>
        <button
          onClick={handleResetToDemo}
          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          title="Restaurar dados iniciais de demonstração"
        >
          <RotateCcw className="w-3 h-3" />
          Restaurar Demonstração ({points.length} pontos)
        </button>
      </div>
    </div>
  );
};
