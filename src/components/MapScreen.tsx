import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WastePoint } from '../types';
import { MapPin, Navigation, X, Calendar, Layers, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MapScreenProps {
  points: WastePoint[];
  onRefreshPoints?: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ points }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedPoint, setSelectedPoint] = useState<WastePoint | null>(null);
  const [filterType, setFilterType] = useState<string>('todos');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Coordenadas centrais de Riacho Fundo I, DF
  const RIACHO_FUNDO_COORDS: [number, number] = [-15.8824, -47.9942];

  // Helper para cor do marcador
  const getMarkerColor = (point: WastePoint): string => {
    if (point.tipoPonto === 'Ecoponto' || point.tipoPonto === 'Ponto adequado') {
      return '#16a34a'; // VERDE
    }
    if (point.tipoPonto === 'Descarte irregular') {
      return '#dc2626'; // VERMELHO
    }
    return '#d97706'; // AMARELO / LARANJA (Aguardando verificação)
  };

  // Inicializa mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: RIACHO_FUNDO_COORDS,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Timeout para recalcular tamanho caso o container anime
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Atualiza marcadores quando os pontos ou o filtro mudam
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredPoints = points.filter((p) => {
      if (filterType === 'todos') return true;
      if (filterType === 'irregular') return p.tipoPonto === 'Descarte irregular';
      if (filterType === 'adequado') return p.tipoPonto === 'Ecoponto' || p.tipoPonto === 'Ponto adequado';
      if (filterType === 'pendente') return p.status === 'pendente';
      return true;
    });

    filteredPoints.forEach((p) => {
      const color = getMarkerColor(p);

      // Ícone SVG customizado com estilo Android Material
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 2.5px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });
      marker.on('click', () => {
        setSelectedPoint(p);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [points, filterType]);

  // Função para obter localização GPS do usuário
  const handleGetLocation = () => {
    setIsLocating(true);
    setGpsStatus('Buscando sinal de satélite GPS...');

    if (!navigator.geolocation) {
      setIsLocating(false);
      setGpsStatus('Geolocalização não é suportada por este dispositivo.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setGpsStatus('Sua localização foi detectada com sucesso!');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  background-color: #2563eb;
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.35);
                "></div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(
              mapInstanceRef.current
            );
          }
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('Permissão de GPS negada. Ative a localização nas permissões do navegador.');
        } else {
          // Centraliza suavemente na área de estudo de Riacho Fundo I como fallback
          setGpsStatus('Sinal indisponível. Centralizado na área de estudo (Riacho Fundo I).');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(RIACHO_FUNDO_COORDS, 14.5);
          }
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div id="map-screen-container" className="h-full relative flex flex-col bg-slate-100">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            Mapa de Resíduos (DF)
          </h2>
          <p className="text-[11px] text-slate-500">Área Piloto: Riacho Fundo I • {points.length} pontos cadastrados</p>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          title="Minha posição GPS"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Obtendo...' : 'GPS'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/90 backdrop-blur-xs px-3 py-2 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto z-10 text-xs">
        <button
          onClick={() => setFilterType('todos')}
          className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
            filterType === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({points.length})
        </button>
        <button
          onClick={() => setFilterType('irregular')}
          className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            filterType === 'irregular' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Descarte irregular
        </button>
        <button
          onClick={() => setFilterType('adequado')}
          className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            filterType === 'adequado' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Ecoponto/Adequado
        </button>
        <button
          onClick={() => setFilterType('pendente')}
          className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
            filterType === 'pendente' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          Aguardando
        </button>
      </div>

      {/* Status banner when GPS message occurs */}
      {gpsStatus && (
        <div className="bg-slate-800 text-white text-xs px-3 py-2 flex items-center justify-between z-10 animate-fade-in">
          <span>{gpsStatus}</span>
          <button onClick={() => setGpsStatus(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Map Canvas */}
      <div className="flex-1 relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Legend */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-slate-200/80 z-[400] text-[11px] space-y-1.5 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="font-semibold text-slate-800">Adequado / Ecoponto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="font-semibold text-slate-800">Descarte irregular</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <span className="font-semibold text-slate-800">Aguardando verificação</span>
          </div>
        </div>

        {/* Floating Recenter / Riacho Fundo button */}
        <div className="absolute bottom-20 right-3 z-[400] flex flex-col space-y-2">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo(RIACHO_FUNDO_COORDS, 14.5);
              }
            }}
            className="p-3 bg-white text-slate-800 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Centralizar em Riacho Fundo I"
          >
            <MapPin className="w-5 h-5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet for Selected Point */}
      {selectedPoint && (
        <div className="absolute inset-x-0 bottom-16 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 p-4 z-[500] max-h-[70%] overflow-y-auto animate-slide-up">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

          <div className="flex items-start justify-between">
            <div>
              {selectedPoint.isDemo && (
                <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1">
                  DADOS DE DEMONSTRAÇÃO
                </span>
              )}
              <h3
                className="text-base font-bold flex items-center gap-1.5"
                style={{ color: getMarkerColor(selectedPoint) }}
              >
                {selectedPoint.tipoPonto === 'Descarte irregular' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {selectedPoint.tipoPonto}
              </h3>
              <p className="text-xs text-slate-500">
                Status: <span className="font-semibold uppercase">{selectedPoint.status}</span>
              </p>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <hr className="my-2.5 border-slate-100" />

          {/* Image if available */}
          {selectedPoint.imagem && (
            <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 max-h-40">
              <img
                src={selectedPoint.imagem}
                alt="Fotografia do descarte"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <div className="text-slate-500 text-[11px]">Material Predominante</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedPoint.materialPredominante}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
              <div className="text-slate-500 text-[11px]">Resíduo Misto?</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedPoint.residuoMisto}</div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 mb-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Categoria geral: <strong className="text-slate-800">{selectedPoint.categoriaResiduo}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Data e hora:{' '}
                <strong className="text-slate-800">
                  {new Date(selectedPoint.dataHora).toLocaleString('pt-BR')}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                GPS:{' '}
                <strong className="text-slate-800 font-mono">
                  {selectedPoint.latitude.toFixed(5)}, {selectedPoint.longitude.toFixed(5)}
                </strong>
              </span>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-xs text-slate-700">
            <div className="font-semibold text-emerald-900 mb-1">Observação do Usuário:</div>
            <p className="italic">{selectedPoint.observacao || 'Nenhuma observação informada.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
