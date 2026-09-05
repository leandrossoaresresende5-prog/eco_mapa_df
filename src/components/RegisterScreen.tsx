import React, { useState, useRef } from 'react';
import { WastePoint, WastePointType, MaterialCategory, MixedWasteOption } from '../types';
import { MATERIAL_OPTIONS, POINT_TYPE_OPTIONS } from '../data/demoData';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Layers,
  FileText,
} from 'lucide-react';

interface RegisterScreenProps {
  onPointRegistered: (newPoint: WastePoint) => void;
  onNavigateToMap: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onPointRegistered,
  onNavigateToMap,
}) => {
  const [tipoPonto, setTipoPonto] = useState<WastePointType>('Descarte irregular');
  const [categoriaResiduo, setCategoriaResiduo] = useState<MaterialCategory>('Plástico');
  const [materialPredominante, setMaterialPredominante] = useState<MaterialCategory>('Plástico');
  const [residuoMisto, setResiduoMisto] = useState<MixedWasteOption>('Não identificado');
  const [observacao, setObservacao] = useState<string>('');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Manipulação de seleção de imagem (galeria ou câmera)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('A imagem selecionada é muito grande. Escolha uma foto de até 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormError(null);
      };
      reader.onerror = () => {
        setFormError('Ocorreu um erro ao carregar o arquivo de imagem.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Obter localização GPS do dispositivo
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationMessage('Acessando sensores de GPS do dispositivo...');
    setLocationError(false);

    if (!navigator.geolocation) {
      setIsLocating(false);
      setLocationError(true);
      setLocationMessage('Geolocalização não é suportada por este dispositivo.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationError(false);
        setLocationMessage(
          `Localização obtida: Lat ${position.coords.latitude.toFixed(5)}, Lng ${position.coords.longitude.toFixed(5)}`
        );
      },
      (error) => {
        setIsLocating(false);
        setLocationError(true);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Permissão de localização necessária. Autorize o acesso ao GPS.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationMessage('GPS indisplicente ou sinal indisponível. Usando referência de Riacho Fundo I.');
          // Fallback gracioso com coordenadas de Riacho Fundo I
          setLatitude(-15.8824 + (Math.random() - 0.5) * 0.008);
          setLongitude(-47.9942 + (Math.random() - 0.5) * 0.008);
        } else {
          setLocationMessage('Tempo limite excedido ao buscar GPS. Usando referência local de Riacho Fundo I.');
          setLatitude(-15.8824 + (Math.random() - 0.5) * 0.008);
          setLongitude(-47.9942 + (Math.random() - 0.5) * 0.008);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSimulateLocation = () => {
    // Opção para ambiente de teste em Riacho Fundo I
    const simulatedLat = -15.8824 + (Math.random() - 0.5) * 0.006;
    const simulatedLng = -47.9942 + (Math.random() - 0.5) * 0.006;
    setLatitude(simulatedLat);
    setLongitude(simulatedLng);
    setLocationError(false);
    setLocationMessage(
      `Coordenada fixada em Riacho Fundo I: ${simulatedLat.toFixed(5)}, ${simulatedLng.toFixed(5)}`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validação dos campos obrigatórios
    if (latitude === null || longitude === null) {
      setFormError('É obrigatório obter a localização GPS antes de salvar o ponto.');
      return;
    }

    const newPoint: WastePoint = {
      id: `point-${Date.now()}`,
      latitude,
      longitude,
      tipoPonto,
      categoriaResiduo,
      materialPredominante,
      residuoMisto,
      imagem: imagePreview || undefined,
      observacao: observacao.trim(),
      dataHora: new Date().toISOString(),
      status: 'pendente',
      isDemo: false,
    };

    onPointRegistered(newPoint);
    setIsSuccess(true);
  };

  const handleResetForm = () => {
    setTipoPonto('Descarte irregular');
    setCategoriaResiduo('Plástico');
    setMaterialPredominante('Plástico');
    setResiduoMisto('Não identificado');
    setObservacao('');
    setImagePreview(null);
    setLatitude(null);
    setLongitude(null);
    setLocationMessage(null);
    setFormError(null);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div id="register-success-view" className="h-full bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ponto Salvo com Sucesso!</h2>
        <p className="text-sm text-slate-600 max-w-sm mb-6">
          O registro foi georreferenciado e salvo no banco de dados local do EcoMapa DF.
        </p>

        <div className="space-y-3 w-full max-w-xs">
          <button
            id="btn-ver-no-mapa"
            onClick={onNavigateToMap}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
          >
            Ver ponto no mapa
          </button>
          <button
            id="btn-cadastrar-outro"
            onClick={handleResetForm}
            className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Cadastrar outro ponto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="register-screen-container" className="h-full overflow-y-auto bg-slate-50 pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-none">Registrar ponto</h2>
          <p className="text-[11px] text-slate-500 font-medium">Novo registro de ciência cidadã</p>
        </div>
        <div className="flex items-center text-xs text-slate-500 gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Auto</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Tipo do Ponto */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Tipo do Ponto *
          </label>
          <select
            id="select-tipo-ponto"
            value={tipoPonto}
            onChange={(e) => setTipoPonto(e.target.value as WastePointType)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            {POINT_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Categoria do Resíduo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Categoria do Resíduo *
          </label>
          <select
            id="select-categoria-residuo"
            value={categoriaResiduo}
            onChange={(e) => {
              const val = e.target.value as MaterialCategory;
              setCategoriaResiduo(val);
              setMaterialPredominante(val);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            {MATERIAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Material Predominante (Ciência dos Materiais) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Material Predominante *
            </label>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
              Ciência dos Materiais
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Qual material compõe a maior fração da amostra de descarte encontrada?
          </p>
          <select
            id="select-material-predominante"
            value={materialPredominante}
            onChange={(e) => setMaterialPredominante(e.target.value as MaterialCategory)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            {MATERIAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 4. É resíduo misto? */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            4. É resíduo misto? *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Sim', 'Não', 'Não identificado'] as MixedWasteOption[]).map((opt) => (
              <button
                type="button"
                key={opt}
                id={`btn-misto-${opt.toLowerCase().replace(' ', '-')}`}
                onClick={() => setResiduoMisto(opt)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                  residuoMisto === opt
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Fotografia */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            5. Fotografia
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-52">
              <img
                src={imagePreview}
                alt="Prévia da fotografia"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-slate-900 transition-colors"
                title="Remover fotografia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {/* Opção Câmera */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors text-slate-600"
              >
                <Camera className="w-6 h-6 text-emerald-700 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Tirar foto</span>
                <span className="text-[10px] text-slate-400">Pela câmera</span>
              </button>

              {/* Opção Galeria */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors text-slate-600"
              >
                <ImageIcon className="w-6 h-6 text-emerald-700 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Galeria</span>
                <span className="text-[10px] text-slate-400">Escolher arquivo</span>
              </button>
            </div>
          )}

          {/* Inputs invisíveis para acionar câmera e arquivo nativos */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* 6. Localização GPS */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            6. Localização GPS *
          </label>

          {latitude !== null && longitude !== null && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="text-xs text-emerald-950 font-medium">
                <strong>Coordenadas obtidas:</strong>
                <div className="font-mono text-[11px] mt-0.5 text-emerald-800">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)} (Riacho Fundo I)
                </div>
              </div>
            </div>
          )}

          {locationMessage && latitude === null && (
            <p className={`text-xs ${locationError ? 'text-amber-700' : 'text-slate-600'}`}>
              {locationMessage}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              id="btn-obter-localizacao"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <MapPin className={`w-4 h-4 ${isLocating ? 'animate-pulse text-emerald-400' : ''}`} />
              {isLocating ? 'Obtendo GPS...' : latitude ? 'Atualizar localização' : 'Obter minha localização'}
            </button>

            <button
              type="button"
              onClick={handleSimulateLocation}
              className="px-3 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Fixar em Riacho Fundo I para teste"
            >
              Simular RF1
            </button>
          </div>
        </div>

        {/* 7. Observação */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            7. Observação Livre
          </label>
          <textarea
            id="input-observacao"
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Entulho de demolição com sacolas plásticas na beira da via, volume aproximado de 2 carrinhos de mão..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* 8. Data e Hora */}
        <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Data e hora do registro:</span>
          </div>
          <span className="font-semibold text-slate-800">{new Date().toLocaleString('pt-BR')}</span>
        </div>

        {/* Botão Salvar Ponto */}
        <button
          type="submit"
          id="btn-salvar-ponto"
          className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Salvar ponto
        </button>
      </form>
    </div>
  );
};
