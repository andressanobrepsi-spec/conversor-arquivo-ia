import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Download, 
  AlertCircle, 
  Trash2,
  Eye,
  FileSpreadsheet,
  Info
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Processamento, 3: Resultado
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILES = 200;
  
  /**
   * Extensão autorizada: Apenas PDF
   */
  const ALLOWED_EXTENSIONS = ['pdf'];

  // Cores da paleta Gobots (Azul, Cinza, Fundo Claro)
  const colors = {
    primary: '#0471b6', // Azul
    secondary: '#595758', // Cinza
    bgLight: '#f9f9f9'  // Fundo claro
  };

  // Carregamento dinâmico da biblioteca XLSX (SheetJS)
  useEffect(() => {
    if (typeof window.XLSX !== 'undefined') {
      setXlsxLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    script.onload = () => setXlsxLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    const currentFilesCount = files.length;
    if (currentFilesCount + newFiles.length > MAX_FILES) {
      alert(`O limite é de ${MAX_FILES} ficheiros técnicos por lote.`);
      newFiles = newFiles.slice(0, MAX_FILES - currentFilesCount);
    }

    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext);
    });

    if (validFiles.length < newFiles.length) {
      alert("Alguns ficheiros foram ignorados. Aceitamos apenas o formato PDF.");
    }

    setFiles(prev => [...prev, ...validFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      status: 'pending'
    }))]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateAIProcessing = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setStep(2);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      // Simulação do tempo de processamento inteligente por ficheiro
      await new Promise(resolve => setTimeout(resolve, 300));
      const fileName = files[i].file.name;
      const baseName = fileName.split('.')[0].toUpperCase();
      
      results.push({
        'EAN': (7890000000000 + Math.floor(Math.random() * 999999999)).toString(),
        'SKU': `SKU-${baseName.substring(0, 8)}`,
        'MLB ': `MLB${Math.floor(Math.random() * 999999999)}`, 
        'O QUE ACOMPANHA O PRODUTO': 'Componente principal, guia rápido, kit de instalação e certificado de garantia.',
        'MEDIDAS': `${Math.floor(Math.random() * 50 + 10)}x${Math.floor(Math.random() * 50 + 10)}x${Math.floor(Math.random() * 20 + 5)} cm`,
        'COMPATIBILIDADE ': 'Universal - Linha Gobots Performance 2024', 
        'IMPLEMENTADO': '' 
      });

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setProcessedData(results);
    setIsProcessing(false);
    setStep(3);
  };

  const downloadExcel = () => {
    if (!xlsxLoaded || !window.XLSX) {
      alert("Aguarde o carregamento do motor de folhas de cálculo...");
      return;
    }

    try {
      const XLSX = window.XLSX;
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dados Gobots");
      
      const wscols = [{wch: 18}, {wch: 15}, {wch: 15}, {wch: 50}, {wch: 20}, {wch: 40}, {wch: 15}];
      worksheet['!cols'] = wscols;

      XLSX.writeFile(workbook, "planilha_fichas_tecnicas_gobots.xlsx");
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao gerar o Excel.");
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ backgroundColor: colors.bgLight }}>
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* Header Gobots */}
        <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <div className="p-3 rounded-2xl text-white shadow-xl" style={{ backgroundColor: colors.primary, boxShadow: `0 10px 25px -5px ${colors.primary}40` }}>
                <FileSpreadsheet size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Go<span style={{ color: colors.primary }}>bots</span></h1>
                <p style={{ color: colors.secondary }} className="font-bold text-[10px] uppercase tracking-widest mt-1 italic opacity-70">Processamento Industrial</p>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-full transition-all duration-300 ${
                  step === s ? 'text-white shadow-lg' : 'text-slate-300'
                }`}
                style={step === s ? { backgroundColor: colors.primary, boxShadow: `0 4px 12px ${colors.primary}40` } : {}}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border ${step === s ? 'border-white/40 bg-white/20' : 'border-slate-200'}`}>
                  {s}
                </span>
                <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">
                  {s === 1 ? 'Importar' : s === 2 ? 'Análise' : 'Baixar'}
                </span>
              </div>
            ))}
          </nav>
        </header>

        {/* Passo 1: Upload */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h2 className="text-lg font-black mb-8 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                  <Info size={20} style={{ color: colors.primary }} /> Formatos Permitidos
                </h2>
                <div className="space-y-8">
                  {[
                    { id: '01', title: 'Documentos PDF', desc: 'Aceitamos apenas ficheiros em formato PDF para garantir a precisão dos dados.' },
                    { id: '02', title: 'Extração Inteligente', desc: 'A IA mapeia EAN, SKU e Medidas diretamente do documento PDF.' },
                    { id: '03', title: 'Lote de Ficheiros', desc: 'Arraste até 200 PDFs para processamento instantâneo em lote.' }
                  ].map(item => (
                    <div key={item.id} className="relative pl-10">
                      <span className="absolute left-0 top-0 font-black text-4xl leading-none select-none opacity-10" style={{ color: colors.secondary }}>{item.id}</span>
                      <h3 className="text-sm font-black text-slate-700 mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
                style={{ borderColor: '#e2e8f0' }}
              >
                <input 
                  type="file" 
                  multiple 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                />
                <div className="p-7 rounded-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>
                  <Upload size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Enviar Fichas Técnicas</h3>
                <p className="text-slate-400 mt-2 font-semibold">Aceitamos apenas PDF</p>
                
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {['PDF'].map(f => (
                    <span key={f} className="px-5 py-2 bg-slate-50 text-xs font-black text-slate-400 border border-slate-200 rounded-xl tracking-widest">
                      {f} ONLY
                    </span>
                  ))}
                </div>
              </div>

              {files.length > 0 && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="text-white px-3 py-1 rounded-full text-xs font-black" style={{ backgroundColor: colors.primary }}>{files.length}</div>
                      <h3 className="font-black text-slate-700 uppercase tracking-tight text-sm">Fila para Extração</h3>
                    </div>
                    <button onClick={() => setFiles([])} className="text-red-400 hover:text-red-600 text-xs font-black transition-colors">LIMPAR FILA</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[1.25rem]">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <FileText size={20} style={{ color: colors.primary }} className="shrink-0 opacity-60" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">{f.file.name}</p>
                            <p className="text-[10px] text-slate-400 font-black">{(f.file.size / 1024).toFixed(0)} KB • PDF</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(f.id)} className="text-slate-200 hover:text-red-500 transition-colors pl-2">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={simulateAIProcessing}
                      className="w-full text-white py-6 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.98]"
                      style={{ backgroundColor: colors.primary, boxShadow: `0 15px 30px -10px ${colors.primary}60` }}
                    >
                      <CheckCircle size={28} /> PROCESSAR COM GOBOTS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <div className="bg-white rounded-[4rem] p-24 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-12 animate-in zoom-in-95 duration-500">
            <div className="relative mb-12 scale-125">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: colors.primary }}></div>
              <div className="p-10 rounded-full relative shadow-inner" style={{ backgroundColor: `${colors.primary}08` }}>
                <Loader2 size={64} style={{ color: colors.primary }} className="animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: colors.primary }}>
                {progress}%
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Extraindo com Go<span style={{ color: colors.primary }}>bots</span></h2>
            <p className="text-slate-400 mb-12 max-w-sm font-bold leading-relaxed text-sm">
              A analisar os dados técnicos dos {files.length} ficheiros PDF importados...
            </p>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner mb-6 max-w-md">
              <div 
                className="h-full transition-all duration-500 shadow-lg rounded-full"
                style={{ width: `${progress}%`, backgroundColor: colors.primary }}
              ></div>
            </div>
          </div>
        )}

        {/* Step 3: Resultado */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden" style={{ backgroundColor: colors.secondary }}>
              <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12">
                <FileSpreadsheet size={300} style={{ color: colors.primary }} />
              </div>
              <div className="flex items-center gap-8 relative z-10">
                <div className="p-6 rounded-[2rem] backdrop-blur-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <CheckCircle size={48} style={{ color: colors.primary }} />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-1">Mapeamento Concluído</h2>
                  <p className="text-slate-300 font-bold text-sm">Pronto para exportar dados de {processedData.length} ficheiros PDF.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
                <button onClick={() => setStep(1)} className="px-10 py-5 rounded-2xl font-black bg-white/5 hover:bg-white/10 transition-all border border-white/10">Novo Lote</button>
                <button 
                  onClick={downloadExcel}
                  className="bg-white px-12 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                  style={{ color: colors.primary }}
                >
                  <Download size={24} /> DESCARREGAR EXCEL
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-4 text-xl">
                  <Eye size={24} style={{ color: colors.primary }} /> Visualização da Inteligência Gobots
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-6">EAN</th>
                      <th className="px-8 py-6">SKU</th>
                      <th className="px-8 py-6">MLB</th>
                      <th className="px-8 py-6">O que acompanha</th>
                      <th className="px-8 py-6">Medidas</th>
                      <th className="px-8 py-6">Compatibilidade</th>
                      <th className="px-8 py-6 text-slate-300 italic">Interno</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {processedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-bold text-slate-500">{row.EAN}</td>
                        <td className="px-8 py-6 font-black text-slate-800">{row.SKU}</td>
                        <td className="px-8 py-6 font-black" style={{ color: colors.primary }}>{row['MLB ']}</td>
                        <td className="px-8 py-6 text-slate-500 max-w-[220px] truncate font-medium">{row['O QUE ACOMPANHA O PRODUTO']}</td>
                        <td className="px-8 py-6 text-slate-700 font-bold">{row.MEDIDAS}</td>
                        <td className="px-8 py-6 text-slate-400 italic text-xs font-bold">{row['COMPATIBILIDADE ']}</td>
                        <td className="px-8 py-6 text-slate-200 text-center font-black">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">
          <p>© 2024 GOBOTS • PDF INDUSTRIAL AI</p>
          <div className="flex gap-12">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={18} style={{ color: colors.primary }} />
              <span>MAPEAMENTO PDF ATIVO</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
