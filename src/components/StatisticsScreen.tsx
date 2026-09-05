import React from 'react';
import { WastePoint } from '../types';
import { BarChart3, AlertTriangle, CheckCircle, Layers, FileSpreadsheet, PieChart, Sparkles } from 'lucide-react';

interface StatisticsScreenProps {
  points: WastePoint[];
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ points }) => {
  const totalRegistros = points.length;
  const descartesIrregulares = points.filter((p) => p.tipoPonto === 'Descarte irregular').length;
  const pontosAdequados = points.filter(
    (p) => p.tipoPonto === 'Ponto adequado' || p.tipoPonto === 'Ecoponto'
  ).length;
  const resíduosMistos = points.filter((p) => p.residuoMisto === 'Sim').length;
  const resíduosNaoMistos = points.filter((p) => p.residuoMisto === 'Não').length;
  const resíduosNaoIdentificados = points.filter((p) => p.residuoMisto === 'Não identificado').length;

  // Agrupamento por material predominante
  const contagemMateriais: Record<string, number> = {};
  points.forEach((p) => {
    const mat = p.materialPredominante;
    contagemMateriais[mat] = (contagemMateriais[mat] || 0) + 1;
  });

  const listaMateriais = Object.entries(contagemMateriais).sort((a, b) => b[1] - a[1]);

  const corPorMaterial: Record<string, string> = {
    'Plástico': 'bg-blue-600',
    'Resíduo de construção': 'bg-amber-800',
    'Vidro': 'bg-teal-600',
    'Metal': 'bg-slate-600',
    'Papel/Papelão': 'bg-amber-600',
    'Madeira': 'bg-yellow-800',
    'Resíduo eletrônico': 'bg-purple-600',
    'Resíduo orgânico': 'bg-emerald-600',
    'Têxtil': 'bg-rose-600',
    'Borracha': 'bg-zinc-700',
    'Resíduo misto': 'bg-indigo-600',
    'Outro': 'bg-gray-500',
  };

  return (
    <div id="statistics-screen-container" className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-none">Estatísticas</h2>
          <p className="text-[11px] text-slate-500 font-medium">Análise de resíduos e ciência dos materiais</p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Riacho Fundo I
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Total */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-semibold text-slate-500">Total de Registros</span>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalRegistros}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Pontos catalogados</p>
          </div>

          {/* Card 2: Descartes Irregulares */}
          <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-200 shadow-2xs">
            <div className="flex items-center justify-between text-red-700 mb-1">
              <span className="text-xs font-semibold text-red-900">Descarte Irregular</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-red-700">{descartesIrregulares}</div>
            <p className="text-[10px] text-red-600/80 mt-0.5">
              {totalRegistros > 0 ? `${((descartesIrregulares / totalRegistros) * 100).toFixed(0)}% do total` : '0%'}
            </p>
          </div>

          {/* Card 3: Pontos Adequados */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-semibold text-emerald-900">Pontos Adequados</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{pontosAdequados}</div>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Ecopontos e PEVs</p>
          </div>

          {/* Card 4: Resíduos Mistos */}
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-xs font-semibold text-amber-900">Resíduos Mistos</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-700">{resíduosMistos}</div>
            <p className="text-[10px] text-amber-700/80 mt-0.5">
              {totalRegistros > 0 ? `${((resíduosMistos / totalRegistros) * 100).toFixed(0)}% do total` : '0%'}
            </p>
          </div>
        </div>

        {/* Gráfico de Frequência de Materiais */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Materiais Predominantes Encontrados</h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-sm">
              Frequência
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Identificação quantitativa para suporte a pesquisas de Ciência e Engenharia de Materiais no DF.
          </p>

          {listaMateriais.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Nenhum dado registrado até o momento.</div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {listaMateriais.map(([material, count]) => {
                const percent = totalRegistros > 0 ? Math.round((count / totalRegistros) * 100) : 0;
                const barColor = corPorMaterial[material] || 'bg-emerald-600';

                return (
                  <div key={material} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{material}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {count} {count === 1 ? 'registro' : 'registros'} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(percent, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proporção de Resíduos Mistos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Caracterização de Resíduo Misto</h3>
          </div>
          <p className="text-xs text-slate-500">
            Resíduos mistos exigem etapas adicionais de triagem e encarecem os processos industriais de reciclagem.
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sim (Misturado)
              </span>
              <span className="font-bold text-slate-900">{resíduosMistos}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Não (Monofluxo / Isolado)
              </span>
              <span className="font-bold text-slate-900">{resíduosNaoMistos}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Não identificado
              </span>
              <span className="font-bold text-slate-900">{resíduosNaoIdentificados}</span>
            </div>
          </div>
        </div>

        {/* Nota acadêmica */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 leading-relaxed">
            <strong>Ciência Cidadã em Riacho Fundo I:</strong> Os dados gerados pelos usuários subsidiam a elaboração de matrizes de risco ambiental e caracterização físico-química de polímeros e cerâmicos abandonados no solo urbano.
          </div>
        </div>
      </div>
    </div>
  );
};
