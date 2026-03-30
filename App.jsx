echo "# conversor-arquivo-ia" >> README.md
git init 
git add README.md 
git commit -m "primeiro commit" 
git branch -M main 
git remote add origin https://github.com/andressanobrepsi-spec/conversor-arquivo-ia.git
 git push -u origin main
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Download, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  ChevronRight,
  Plus,
  Zap,
  ExternalLink,
  MessageCircle,
  Files,
  ArrowRight,
  Clock,
  LayoutGrid
} from 'lucide-react';

// Configurações Globais
const apiKey = "";
const appId = typeof __app_id !== 'undefined' ? __app_id : 'gobots-data-converter';

const App = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [libLoaded, setLibLoaded] = useState(false);

  // Carregar biblioteca XLSX dinamicamente via CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.head.appendChild(script);
  }, []);

  const COLUMNS = [
    "EAN", 
    "SKU", 
    "MLB", 
    "O QUE ACOMPANHA O PRODUTO", 
    "MEDIDAS", 
    "COMPATIBILIDADE"
  ];

  const Instructions = () => (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Zap className="text-white" size={20} />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Gobots: Conversão Inteligente e Ágil
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="relative group">
          <div className="flex flex-col items-start p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-blue-50/50 hover:border-blue-100 h-full">
            <span className="text-4xl font-black text-blue-600/10 mb-2">01</span>
            <p className="text-sm font-bold text-slate-700 mb-1 tracking-tight">Importação em Massa</p>
            <p className="text-xs text-slate-500 leading-relaxed">Adicione até 200 arquivos. Aceitamos PDF, Word e Imagens de diversos formatos.</p>
          </div>
        </div>
        <div className="relative group">
          <div className="flex flex-col items-start p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-blue-50/50 hover:border-blue-100 h-full">
            <span className="text-4xl font-black text-blue-600/10 mb-2">02</span>
            <p className="text-sm font-bold text-slate-700 mb-1 tracking-tight">Conversão Gobots</p>
            <p className="text-xs text-slate-500 leading-relaxed">Nossa IA analisa e estrutura os dados técnicos de forma detalhada para o e-commerce.</p>
          </div>
        </div>
        <div className="relative group">
          <div className="flex flex-col items-start p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-blue-50/50 hover:border-blue-100 h-full">
            <span className="text-4xl font-black text-blue-600/10 mb-2">03</span>
            <p className="text-sm font-bold text-slate-700 mb-1 tracking-tight">Pronto para CX</p>
            <p className="text-xs text-slate-500 leading-relaxed">Baixe sua planilha revisada e envie para o time de Sucesso do Cliente Gobots.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const onFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 200) {
      setError("O limite máximo de processamento é de 200 arquivos.");
      return;
    }
    setError(null);
    setFiles(prev => [...prev, ...selectedFiles]);
    if (step === 1) setStep(2);
    e.target.value = null;
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (newFiles.length === 0) setStep(1);
  };

  const extractDataFromAI = async (file) => {
    const reader = new FileReader();
    const fileData = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    const mimeType = file.type || 'application/octet-stream';
    
    const systemPrompt = `Você é a inteligência Gobots. Sua tarefa é extrair e detalhar os campos desta ficha técnica:
    - EAN (Código de Barras)
    - SKU (Identificador Interno)
    - MLB (Código Mercado Livre)
    - O QUE ACOMPANHA O PRODUTO: Detalhe minuciosamente peso, gramagem, itens inclusos e composição para que o cliente entenda perfeitamente o que receberá.
    - MEDIDAS (Dimensões Técnicas)
    - COMPATIBILIDADE (Veículos ou modelos suportados)
    
    Não preencha "IMPLEMENTADO". Responda estritamente em JSON. Se não houver informação, use "".`;

    const payload = {
      contents: [{
        parts: [
          { text: "Converta os dados desta ficha técnica para o padrão Gobots." },
          { inlineData: { mimeType, data: fileData } }
        ]
      }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            EAN: { type: "STRING" },
            SKU: { type: "STRING" },
            MLB: { type: "STRING" },
            "O QUE ACOMPANHA O PRODUTO": { type: "STRING" },
            MEDIDAS: { type: "STRING" },
            COMPATIBILIDADE: { type: "STRING" }
          }
        }
      }
    };

    const fetchWithRetry = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
    };

    return fetchWithRetry();
  };

  const startProcessing = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    const allResults = [];
    const total = files.length;
    let completed = 0;

    // Processamento Paralelo Otimizado (Lotes de 4 arquivos por vez)
    const batchSize = 4;
    setProcessingStatus(`Iniciando conversão inteligente de ${total} documentos...`);

    for (let i = 0; i < total; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      setProcessingStatus(`Extraindo dados do lote ${Math.floor(i/batchSize) + 1}...`);
      
      const batchPromises = batch.map(async (file) => {
        try {
          const data = await extractDataFromAI(file);
          completed++;
          setProgress(Math.round((completed / total) * 100));
          return { fileName: file.name, ...data };
        } catch (err) {
          completed++;
          setProgress(Math.round((completed / total) * 100));
          return { 
            fileName: file.name, 
            EAN: "Não extraído", SKU: "-", MLB: "-", 
            "O QUE ACOMPANHA O PRODUTO": "Erro no processamento do arquivo", 
            MEDIDAS: "-", COMPATIBILIDADE: "-" 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);
    }

    setResults(allResults);
    setIsProcessing(false);
    setStep(3);
  };

  const downloadExcel = () => {
    if (!window.XLSX) return;
    const dataToExport = results.map(r => ({
      "EAN": r.EAN,
      "SKU": r.SKU,
      "MLB ": r.MLB,
      "O QUE ACOMPANHA O PRODUTO": r["O QUE ACOMPANHA O PRODUTO"],
      "MEDIDAS": r.MEDIDAS,
      "COMPATIBILIDADE ": r.COMPATIBILIDADE,
      "IMPLEMENTADO": "" 
    }));
    const ws = window.XLSX.utils.json_to_sheet(dataToExport);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Dados Gobots");
    window.XLSX.writeFile(wb, "Gobots_Dados_Convertidos.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 rotate-3 transition-transform">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tighter">Gobots</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Conversão de dados para IA mais inteligente</p>
            </div>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-4 px-6 py-2 bg-blue-50 border border-blue-100 rounded-full shadow-inner animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-600" size={16} />
                <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{progress}% Processado</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {step === 1 && <Instructions />}

        {step < 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div 
                className={`relative group border-2 border-dashed rounded-[48px] p-16 lg:p-24 transition-all bg-white shadow-xl shadow-slate-200/40 flex flex-col items-center justify-center text-center ${files.length > 0 ? 'border-blue-400 bg-blue-50/5' : 'border-slate-200 hover:border-blue-300'}`}
              >
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.gif,.png,.tiff,.bmp" 
                  onChange={onFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  disabled={isProcessing} 
                />
                
                <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                  <Files className="text-blue-600 group-hover:text-white transition-colors" size={40} />
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight italic">Incluir Fichas Técnicas</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-10 leading-relaxed font-medium">
                  Selecione seus arquivos individualmente ou em massa para iniciar a leitura inteligente.
                </p>

                {files.length > 0 && (
                  <div className="mb-10 animate-in zoom-in duration-500 flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl shadow-2xl">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-black text-xs uppercase tracking-widest">
                      {files.length} {files.length === 1 ? 'Arquivo Selecionado' : 'Arquivos Selecionados'}
                    </span>
                  </div>
                )}

                {files.length > 0 && !isProcessing && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); startProcessing(); }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-[28px] shadow-2xl shadow-blue-200 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 group/btn relative z-20"
                  >
                    Iniciar Conversão Ágil
                    <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Fila Lateral Dinâmica */}
            <div className="bg-white rounded-[40px] shadow-lg border border-slate-200 flex flex-col h-[580px] overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-blue-600" />
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">Fila de Processamento</h4>
                </div>
                <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-xl shadow-sm">
                  {files.length} Itens
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {files.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                    <LayoutGrid size={48} strokeWidth={1.5} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">Nenhum documento<br/>carregado na fila</p>
                  </div>
                ) : (
                  files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[24px] group hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                          <FileText size={18} className="text-blue-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-slate-800 truncate max-w-[120px]">{f.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Pendente</span>
                        </div>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay de Processamento Otimizado */}
        {isProcessing && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-8">
            <div className="text-center space-y-12 max-w-lg w-full animate-in zoom-in-95 duration-700">
              <div className="relative w-56 h-56 mx-auto group">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="112" cy="112" r="105" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                  <circle cx="112" cy="112" r="105" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={660} strokeDashoffset={660 - (660 * progress) / 100} className="text-blue-500 transition-all duration-700 ease-out" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{progress}%</span>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">IA em ação</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tighter italic leading-none">Processamento Paralelo</h2>
                <p className="text-slate-400 text-sm font-bold tracking-wide opacity-80">{processingStatus}</p>
                <div className="flex justify-center gap-3 pt-4">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900 p-12 rounded-[64px] text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
              <div className="space-y-4 text-center md:text-left relative z-10">
                <div className="inline-flex items-center gap-3 bg-blue-500/20 text-blue-400 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  <CheckCircle size={16} /> Leitura Otimizada
                </div>
                <h2 className="text-5xl font-black tracking-tighter italic leading-none">Dados Estruturados</h2>
                <p className="text-slate-400 font-medium text-lg max-w-md">Sua IA agora possui dados técnicos precisos. Baixe o arquivo pronto abaixo.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 relative z-10">
                <button onClick={() => { setFiles([]); setResults([]); setStep(1); }} className="bg-white/5 hover:bg-white/10 text-white font-black py-5 px-10 rounded-[28px] transition-all border border-white/10 backdrop-blur-lg active:scale-95">
                  Novo Lote
                </button>
                <button onClick={downloadExcel} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-[28px] shadow-3xl shadow-blue-600/30 transition-all flex items-center gap-4 hover:scale-105 active:scale-95">
                  <Download size={24} />
                  Baixar Excel
                </button>
              </div>
            </div>

            {/* Suporte CX Gobots */}
            <div className="bg-white p-12 rounded-[56px] border border-blue-100 shadow-xl shadow-blue-50/30 flex flex-col lg:flex-row items-center gap-12 group">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase mb-4 tracking-widest">Próximo Passo</div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter leading-none">Envio para Implementação</h3>
                <p className="text-slate-500 text-base leading-relaxed max-w-2xl font-medium italic">
                  Envie o arquivo final revisado para o seu Gerente de Sucesso ou para o time de <span className="text-blue-600 font-black not-italic">Customer Experience (CX)</span> através de nossos canais oficiais:
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 shrink-0">
                <a href="https://gobots.atlassian.net/servicedesk/customer/portal/7/group/29/create/10461" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-50 text-slate-900 font-black px-10 py-5 rounded-[28px] border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-xl hover:shadow-slate-200">
                  <ExternalLink size={22} />
                  Ticket CX
                </a>
                <a href="https://api.whatsapp.com/send/?phone=551145024714&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#25D366] text-white font-black px-12 py-5 rounded-[28px] hover:bg-[#1ebd57] transition-all shadow-2xl shadow-green-200/40 active:scale-95">
                  <MessageCircle size={24} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Tabela de Resultados Técnica */}
            <div className="bg-white rounded-[64px] shadow-2xl border border-slate-200 overflow-hidden mb-24">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-12 py-8 font-black text-slate-400 uppercase text-[10px] tracking-widest">Documento</th>
                      {COLUMNS.map(col => (
                        <th key={col} className="px-6 py-8 font-black text-slate-900 uppercase text-[10px] tracking-tight whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors group">
                        <td className="px-12 py-6 text-slate-400 text-xs italic font-medium truncate max-w-[200px]">{row.fileName}</td>
                        <td className="px-6 py-6 text-slate-900 font-black font-mono text-[13px] tracking-tighter">{row.EAN || '-'}</td>
                        <td className="px-6 py-6 text-slate-900 font-black font-mono text-[13px] tracking-tighter">{row.SKU || '-'}</td>
                        <td className="px-6 py-6 text-slate-600 font-mono text-[12px]">{row.MLB || '-'}</td>
                        <td className="px-6 py-6">
                          <div className="text-slate-600 text-xs italic leading-relaxed max-w-[320px] bg-slate-100/40 p-4 rounded-3xl border border-slate-200/40 group-hover:bg-white transition-all">
                            {row["O QUE ACOMPANHA O PRODUTO"]}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-slate-500 text-xs font-semibold">{row.MEDIDAS}</td>
                        <td className="px-6 py-6 text-slate-500 text-[11px] leading-snug max-w-[220px] font-medium">{row.COMPATIBILIDADE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-12 p-10 bg-red-50 border border-red-100 rounded-[40px] text-red-600 flex items-center gap-6 animate-in slide-in-from-top-4 shadow-xl shadow-red-50">
            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="font-black uppercase text-[10px] tracking-widest mb-1">Status: Erro de Leitura</p>
              <span className="font-bold text-lg leading-tight">{error}</span>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 py-16 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.6em] italic">
          Gobots Inteligência Artificial &copy; 2026
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default App;
