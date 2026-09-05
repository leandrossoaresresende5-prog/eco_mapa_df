import React, { useState } from 'react';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES } from '../data/flutterFiles';
import { FlutterProjectFile } from '../types';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderTree,
  Terminal,
  Smartphone,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'tutorial'>('code');

  const currentFile: FlutterProjectFile = FLUTTER_PROJECT_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gera e baixa o arquivo .ZIP completo do projeto Flutter
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Adiciona todos os arquivos do EcoMapa DF na raiz do zip
      FLUTTER_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.code);
      });

      // Adiciona um README explicativo no ZIP
      zip.file(
        'LEIA-ME.txt',
        `==================================================
ECOMAPA DF - PROJETO FLUTTER COMPLETO
==================================================

Este arquivo compactado contém todos os códigos do EcoMapa DF prontos para execução no Flutter e geração do APK Android.

COMO EXECUTAR NO WINDOWS / ANDROID:
1. Extraia o conteúdo desta pasta.
2. Abra o terminal (Prompt de Comando ou PowerShell) nesta pasta extraída.
3. Execute o comando para instalar as dependências:
   flutter pub get
4. Conecte o seu celular Android via cabo USB (com Depuração USB ativada) ou abra o Emulador Android.
5. Execute o aplicativo:
   flutter run
6. Para gerar o arquivo APK de instalação:
   flutter build apk --release
   O APK gerado ficará em:
   build/app/outputs/flutter-apk/app-release.apk
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ecomapa_df_flutter_project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar arquivo ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div id="flutter-code-viewer-container" className="h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Top Bar with actions */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
            FL
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Código Fonte Flutter / Dart</h2>
            <p className="text-[11px] text-slate-400">EcoMapa DF • Compatível com Flutter 3.44+ e Android</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Alternador de visualização */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex text-xs">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Arquivos
            </button>
            <button
              onClick={() => setActiveTab('tutorial')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'tutorial' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Guia Passo a Passo
            </button>
          </div>

          {/* Botão Baixar ZIP */}
          <button
            id="btn-download-flutter-zip"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isZipping ? 'Compactando...' : 'Baixar Projeto (.ZIP)'}
          </button>
        </div>
      </div>

      {activeTab === 'code' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0 max-h-48 md:max-h-full">
            <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
              Estrutura de Arquivos ({FLUTTER_PROJECT_FILES.length})
            </div>

            <div className="p-1.5 space-y-0.5">
              {FLUTTER_PROJECT_FILES.map((file, idx) => {
                const isSelected = idx === selectedFileIndex;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIndex(idx)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                    <ChevronRight className={`w-3 h-3 ml-1 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Area */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File info header */}
            <div className="bg-slate-850 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400">{currentFile.path}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{currentFile.description}</p>
              </div>

              <button
                id="btn-copy-file-code"
                onClick={handleCopyCode}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-900/90 leading-relaxed selection:bg-emerald-900 selection:text-white">
              <pre className="whitespace-pre">{currentFile.code}</pre>
            </div>
          </div>
        </div>
      ) : (
        /* Guia Passo a Passo para Iniciantes */
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto text-slate-200">
          <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-4 text-xs space-y-2">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Instruções para Construir o EcoMapa DF do Zero no Windows
            </h3>
            <p className="text-slate-300">
              Siga rigorosamente cada etapa abaixo no seu computador com Flutter instalado. Todos os códigos necessários estão disponíveis na aba <strong>Arquivos</strong> e podem ser baixados em um arquivo ZIP completo.
            </p>
          </div>

          {/* Passo 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="font-bold text-white text-sm">Criar o Projeto Flutter</h4>
            </div>
            <p className="text-xs text-slate-400">
              Abra o Prompt de Comando (CMD) ou PowerShell na pasta onde deseja guardar o projeto (ex: <code className="text-emerald-400 font-mono">C:\Projetos</code>) e execute:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
              flutter create --org com.ecomapa ecomapa_df
            </div>
            <p className="text-xs text-slate-400">
              Em seguida, entre na pasta do projeto:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
              cd ecomapa_df
            </div>
          </div>

          {/* Passo 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="font-bold text-white text-sm">Configurar as Dependências (pubspec.yaml)</h4>
            </div>
            <p className="text-xs text-slate-400">
              Abra o arquivo <code className="text-emerald-400 font-mono">pubspec.yaml</code> na raiz do projeto, apague o conteúdo e cole o código completo do <code className="text-emerald-400 font-mono">pubspec.yaml</code>. Depois execute no terminal:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
              flutter pub get
            </div>
          </div>

          {/* Passo 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="font-bold text-white text-sm">Configurar Permissões do Android (AndroidManifest.xml)</h4>
            </div>
            <p className="text-xs text-slate-400">
              Abra o arquivo <code className="text-emerald-400 font-mono">android/app/src/main/AndroidManifest.xml</code>, apague o conteúdo e cole o código fornecido, que inclui as permissões de GPS (Localização precisa e aproximada), Câmera e Galeria.
            </p>
          </div>

          {/* Passo 4 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="font-bold text-white text-sm">Criar as Pastas e Arquivos Dart em lib/</h4>
            </div>
            <p className="text-xs text-slate-400">
              Crie as seguintes pastas dentro de <code className="text-emerald-400 font-mono">lib/</code>:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-300 font-mono pl-2 space-y-1">
              <li>lib/models/</li>
              <li>lib/data/</li>
              <li>lib/services/</li>
              <li>lib/widgets/</li>
              <li>lib/screens/</li>
            </ul>
            <p className="text-xs text-slate-400">
              Cole o código de cada arquivo correspondente da aba <strong>Arquivos</strong>.
            </p>
          </div>

          {/* Passo 5 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">5</span>
              <h4 className="font-bold text-white text-sm">Executar o Aplicativo no Celular Android</h4>
            </div>
            <p className="text-xs text-slate-400">
              Conecte o seu smartphone Android ao computador via cabo USB, ative a <strong>Depuração USB</strong> nas opções do desenvolvedor do Android e execute:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
              flutter run
            </div>
          </div>

          {/* Passo 6 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">6</span>
              <h4 className="font-bold text-white text-sm">Como Gerar o Arquivo APK no Computador</h4>
            </div>
            <p className="text-xs text-slate-400">
              Para gerar o instalador APK no seu computador com Flutter instalado:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
              flutter build apk --release
            </div>
            <p className="text-xs text-slate-400">
              O arquivo APK gerado estará em: <code className="text-emerald-400 font-mono">build\app\outputs\flutter-apk\app-release.apk</code>.
            </p>
          </div>

          {/* Método GitHub Actions */}
          <div className="bg-gradient-to-br from-slate-950 to-emerald-950/40 border border-emerald-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">Nuvem</span>
              <h4 className="font-bold text-white text-sm">Opção Sem Instalar Nada: Gerar o APK Direto pelo GitHub</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O arquivo de automação <code className="text-emerald-400 font-mono">.github/workflows/build_apk.yml</code> já está incluído no projeto baixado (.ZIP). O GitHub compila o APK gratuitamente para você na nuvem!
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-1">
              <li>Acesse <strong className="text-white">github.com</strong> e crie uma conta gratuita.</li>
              <li>Clique em <strong className="text-white">New Repository</strong> (Novo Repositório), dê o nome de <code className="text-emerald-400 font-mono">ecomapa-df</code> e clique em <em>Create repository</em>.</li>
              <li>Faça o upload dos arquivos do projeto (ou use Git para enviar a pasta extraída).</li>
              <li>O GitHub detectará a automação automaticamente e iniciará a compilação na aba <strong className="text-emerald-400">Actions</strong>.</li>
              <li>Após ~3 minutos, clique no fluxo concluído e baixe o artefato <strong className="text-emerald-400">EcoMapa-DF-Instalador</strong> com o arquivo <code className="text-white font-mono">.apk</code> pronto!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
