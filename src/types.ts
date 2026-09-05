export type WastePointType = 'Descarte irregular' | 'Ponto adequado' | 'Ecoponto' | 'Outro';

export type MaterialCategory =
  | 'Plástico'
  | 'Vidro'
  | 'Metal'
  | 'Papel/Papelão'
  | 'Madeira'
  | 'Resíduo de construção'
  | 'Resíduo eletrônico'
  | 'Resíduo orgânico'
  | 'Têxtil'
  | 'Borracha'
  | 'Resíduo misto'
  | 'Outro';

export type MixedWasteOption = 'Sim' | 'Não' | 'Não identificado';

export type WastePointStatus = 'pendente' | 'validado' | 'rejeitado';

export interface WastePoint {
  id: string;
  latitude: number;
  longitude: number;
  tipoPonto: WastePointType;
  categoriaResiduo: MaterialCategory;
  materialPredominante: MaterialCategory;
  residuoMisto: MixedWasteOption;
  imagem?: string; // base64 or URL
  observacao: string;
  dataHora: string; // ISO string or formatted
  status: WastePointStatus;
  isDemo?: boolean;
}

export interface EcopointInfo {
  id: string;
  nome: string;
  endereco: string;
  regiao: string;
  latitude: number;
  longitude: number;
  materiaisAceitos: string[];
  horarioFuncionamento: string;
  distanciaKm?: number;
  telefone?: string;
}

export interface FlutterProjectFile {
  path: string;
  language: string;
  description: string;
  code: string;
}
