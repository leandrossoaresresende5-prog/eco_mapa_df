import React from 'react';
import { MapPin, PlusCircle, BarChart3, Info, Recycle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeScreenProps {
  onNavigateTab: (tabIndex: number) => void;
  onOpenAbout: () => void;
  onOpenEcopoints: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenAbout,
  onOpenEcopoints,
}) => {
  return (
    <div id="home-screen-container" className="h-full overflow-y-auto bg-slate-50 pb-20">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">EcoMapa DF</h1>
            <p className="text-[11px] text-emerald-800 font-medium">Riacho Fundo I • Ciência Cidadã</p>
          </div>
        </div>
        <button
          id="btn-about-header"
          onClick={onOpenAbout}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          title="Sobre o projeto"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Banner */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold text-emerald-100 mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            CIÊNCIA & ENGENHARIA DE MATERIAIS
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            EcoMapa DF
          </h2>
          <p className="text-emerald-100 text-sm font-semibold mb-2">
            Mapeando resíduos. Construindo soluções.
          </p>
          <p className="text-emerald-50 text-xs leading-relaxed opacity-95">
            Ajude a identificar, registrar e monitorar pontos de descarte de resíduos no Distrito Federal.
          </p>
        </div>

        {/* Quick Access Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
            Acesso Rápido
          </h3>
          <div className="space-y-2.5">
            {/* 1. Ver mapa */}
            <button
              id="btn-ver-mapa"
              onClick={() => onNavigateTab(1)}
              className="w-full bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all rounded-xl p-3.5 flex items-center text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mr-3.5 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">Ver mapa</h4>
                <p className="text-xs text-slate-500 truncate">Visualize pontos de descarte e ecopontos no mapa</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors ml-2" />
            </button>

            {/* 2. Registrar ponto */}
            <button
              id="btn-registrar-ponto"
              onClick={() => onNavigateTab(2)}
              className="w-full bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all rounded-xl p-3.5 flex items-center text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mr-3.5 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">Registrar ponto</h4>
                <p className="text-xs text-slate-500 truncate">Georreferencie e classifique resíduos com fotos</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors ml-2" />
            </button>

            {/* 3. Ecopontos */}
            <button
              id="btn-ecopontos"
              onClick={onOpenEcopoints}
              className="w-full bg-white border border-slate-200/90 hover:border-sky-500 hover:shadow-md transition-all rounded-xl p-3.5 flex items-center text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mr-3.5 group-hover:scale-105 transition-transform">
                <Recycle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">Ecopontos</h4>
                <p className="text-xs text-slate-500 truncate">Locais adequados de descarte e Papa-Entulho no DF</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors ml-2" />
            </button>

            {/* 4. Estatísticas */}
            <button
              id="btn-estatisticas"
              onClick={() => onNavigateTab(3)}
              className="w-full bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all rounded-xl p-3.5 flex items-center text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mr-3.5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">Estatísticas</h4>
                <p className="text-xs text-slate-500 truncate">Gráficos por categoria de material e descarte</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors ml-2" />
            </button>

            {/* 5. Sobre o projeto */}
            <button
              id="btn-sobre-projeto"
              onClick={onOpenAbout}
              className="w-full bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-md transition-all rounded-xl p-3.5 flex items-center text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mr-3.5 group-hover:scale-105 transition-transform">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">Sobre o projeto</h4>
                <p className="text-xs text-slate-500 truncate">Iniciativa científica, Riacho Fundo I e comunidade</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-2" />
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900">
            <strong className="font-bold">Privacidade Garantida:</strong> Não coletamos CPF, telefone ou dados pessoais. O georreferenciamento é utilizado estritamente para o mapeamento ambiental de resíduos.
          </div>
        </div>
      </div>
    </div>
  );
};
