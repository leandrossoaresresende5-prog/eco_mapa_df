import React, { useState } from 'react';
import { DEMO_ECOPOINTS } from '../data/demoData';
import { EcopointInfo } from '../types';
import { Recycle, MapPin, Clock, ArrowLeft, Phone, Search, ExternalLink } from 'lucide-react';

interface EcopointsScreenProps {
  onBack: () => void;
}

export const EcopointsScreen: React.FC<EcopointsScreenProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEcopoints = DEMO_ECOPOINTS.filter((eco) => {
    const term = searchTerm.toLowerCase();
    return (
      eco.nome.toLowerCase().includes(term) ||
      eco.regiao.toLowerCase().includes(term) ||
      eco.materiaisAceitos.some((m) => m.toLowerCase().includes(term))
    );
  });

  return (
    <div id="ecopoints-screen-container" className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-none">Ecopontos no DF</h2>
          <p className="text-[11px] text-slate-500 font-medium">Locais adequados de descarte (Papa-Entulho SLU)</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner informativo com aviso de dados de demonstração */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sky-900">
            <Recycle className="w-4 h-4 text-sky-700" />
            <span>Rede de Ecopontos do Distrito Federal</span>
          </div>
          <p className="text-slate-600">
            Apresentamos os pontos de entrega voluntária e Papa-Entulhos em Riacho Fundo I e proximidades.
            <span className="font-semibold text-sky-800 ml-1">
              [Dados de demonstração com base na malha do SLU DF].
            </span>
          </p>
        </div>

        {/* Search box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por região ou material (ex: entulho, vidro)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-hidden shadow-2xs"
          />
        </div>

        {/* Ecopoints List */}
        <div className="space-y-3">
          {filteredEcopoints.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Nenhum ecoponto encontrado para a busca informada.
            </div>
          ) : (
            filteredEcopoints.map((eco: EcopointInfo) => (
              <div
                key={eco.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Recycle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{eco.nome}</h3>
                      <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm mt-0.5">
                        {eco.regiao}
                      </span>
                    </div>
                  </div>
                  {eco.distanciaKm !== undefined && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                      ~ {eco.distanciaKm.toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{eco.endereco}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{eco.horarioFuncionamento}</span>
                  </div>

                  {eco.telefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{eco.telefone}</span>
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Materiais Aceitos:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {eco.materiaisAceitos.map((mat, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
