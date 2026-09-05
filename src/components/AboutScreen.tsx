import React from 'react';
import { ArrowLeft, BookOpen, GraduationCap, MapPin, Sparkles, CheckCircle2, Shield, Heart } from 'lucide-react';

interface AboutScreenProps {
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const objetivos = [
    'Contribuir para a educação ambiental e conscientização urbana comunitária.',
    'Gerar dados georreferenciados para planejamento de políticas públicas no DF.',
    'Identificar padrões de descarte irregular e pontos críticos de reincidência.',
    'Estudar a ocorrência, persistência e degradação de diferentes materiais.',
    'Apoiar ações ambientais e cooperativas de reciclagem locais.',
    'Aproximar tecnologia móvel, pesquisa acadêmica e a comunidade cidadã.',
  ];

  return (
    <div id="about-screen-container" className="h-full overflow-y-auto bg-slate-50 pb-24">
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
          <h2 className="text-base font-bold text-slate-900 leading-none">Sobre o projeto</h2>
          <p className="text-[11px] text-slate-500 font-medium">EcoMapa DF • Ciência Cidadã</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner de Apresentação */}
        <div className="bg-emerald-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-emerald-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold leading-snug">
            EcoMapa DF: Ciência Cidadã & Engenharia de Materiais
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed">
            O <strong>EcoMapa DF</strong> é uma iniciativa de ciência cidadã voltada ao registro e monitoramento de pontos de descarte de resíduos no Distrito Federal.
          </p>
        </div>

        {/* Primeira Área de Atuação: Riacho Fundo I */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Primeira Região de Atuação: Riacho Fundo I</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A primeira fase do projeto é concentrada na <strong>Região Administrativa do Riacho Fundo I</strong>, estabelecendo uma malha piloto para testagem metodológica, mapeamento participativo dos moradores e correlação com a infraestrutura pública do Serviço de Limpeza Urbana (SLU DF).
          </p>
        </div>

        {/* Conexão com Ciência e Engenharia de Materiais */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Relação com a Ciência dos Materiais</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Diferente de sistemas meramente censitários, o EcoMapa DF investiga o ciclo de vida dos materiais descartados. A classificação entre <strong>polímeros, metais, cerâmicos de construção, vidro, celulose e resíduos mistos</strong> viabiliza futuros estudos sobre degradabilidade, toxicidade no solo e viabilidade técnica de recuperação energética e circularidade de materiais.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700">
            <strong>Nota de Rigor Metodológico:</strong> Nesta versão, a classificação é realizada pelo olhar atento do usuário cidadão em campo, gerando um conjunto de dados empírico e transparente sem simulações artificiais.
          </div>
        </div>

        {/* Objetivos do Projeto */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Objetivos da Plataforma</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            {objetivos.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacidade e Ética */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Privacidade & Dados Livres</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            O aplicativo não solicita cadastro de usuário, não exige login nem armazena identificadores civis (como CPF ou nome). O sensor de geolocalização é ativado exclusivamente durante o registro para georreferenciar o resíduo na via pública.
          </p>
        </div>

        <div className="text-center pt-2 pb-4 text-[11px] text-slate-400">
          EcoMapa DF • Versão 1.0.0 (Piloto Riacho Fundo I)
        </div>
      </div>
    </div>
  );
};
