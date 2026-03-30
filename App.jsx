import React, { useState, useEffect, useCallback } from 'react';

// --- ÍCONES SVG INTERNOS (Elimina erros de dependências externas como lucide-react) ---
const IconZap = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const IconLoader = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
);
const IconFiles = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"/><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"/><path d="M15 2v5h5"/></svg>
);
const IconTrash = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const IconCheck = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);
const IconDownload = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const IconExternal = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);
const IconWhatsApp = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
);
const IconArrowRight = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IconClock = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

// --- CONFIGURAÇÕES DO APP ---
const apiKey = ""; // Chave fornecida automaticamente pelo ambiente de execução
const appId = typeof __app_id !== 'undefined' ? __app_id : 'gobots-data-converter';

const App = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [libReady, setLibReady] = useState(false);

  // Carrega a biblioteca XLSX via CDN de forma segura
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.async = true;
    script.onload = () => setLibReady(true);
    document.head.appendChild(script);
  }, []);

  const COLUMNS = ["EAN", "SKU", "MLB", "O QUE ACOMPANHA O PRODUTO", "MEDIDAS", "COMPATIBILIDADE"];

  const handleFileSelection = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 200) {
      setError("O limite máximo permitido é de 200 ficheiros por lote.");
      return;
    }
    setError(null);
    setFiles(prev => [...prev, ...selected]);
    if (step === 1) setStep(2);
    e.target.value = null; 
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    if (updated.length === 0) setStep(1);
  };

  const processFileWithAI = async (file) => {
    const reader = new FileReader();
    const base64Data = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    const payload = {
      contents: [{
        parts: [
          { text: "Converta os dados desta ficha técnica para o padrão estruturado da Gobots." },
          { inlineData: { mimeType: file.type || 'application/octet-stream', data: base64Data } }
        ]
      }],
      systemInstruction: { 
        parts: [{ 
          text: `Você é a inteligência Gobots. Extraia obrigatoriamente: 
          1. EAN
          2. SKU
          3. MLB
          4. O QUE ACOMPANHA O PRODUTO: Detalhe rigorosamente peso, gramagem e composição completa para o cliente.
          5. MEDIDAS
          6. COMPATIBILIDADE. 
          Retorne apenas JSON. Ignore o campo 'IMPLEMENTADO'.` 
        }] 
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            EAN: { type: "STRING" }, SKU: { type: "STRING" }, MLB: { type: "STRING" },
            "O QUE ACOMPANHA O PRODUTO": { type: "STRING" }, MEDIDAS: { type: "STRING" }, COMPATIBILIDADE: { type: "STRING" }
          }
        }
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error("Erro na comunicação com a IA");
    const result = await response.json();
    return JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
  };

  const runParallelConversion = async () => {
    setIsProcessing(true);
    setProgress(0);
    const finalResults = [];
    const batchSize = 4; // Processamento paralelo de 4 em 4 ficheiros

    for (let i = 0; i < files.length; i += batchSize) {
      const currentBatch = files.slice(i, i + batchSize);
      setStatusText(`Processando lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(files.length/batchSize)}...`);
      
      const batchPromises = currentBatch.map(async (file) => {
        try {
          const data = await processFileWithAI(file);
          return { fileName: file.name, ...data };
        } catch {
          return { fileName: file.name, EAN: "Erro na extração" };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      finalResults.push(...batchResults);
      setProgress(Math.round(((i + currentBatch.length) / files.length) * 100));
    }

    setResults(finalResults);
    setIsProcessing(false);
    setStep(3);
  };

  const exportExcelFile = () => {
    if (!window.XLSX) return;
    const sheetData = results.map(r => ({ ...r, "IMPLEMENTADO": "" }));
    const worksheet = window.XLSX.utils.json_to_sheet(sheetData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Dados Gobots");
    window.XLSX.writeFile(workbook, "Gobots_Dados_Convertidos.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 rotate-3 transition-transform">
              <IconZap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tighter">Gobots</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Conversão de dados para IA mais inteligente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {step === 1 && (
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 mb-10 shadow-sm animate-in fade-in duration-700">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 italic">
              <IconZap className="text-blue-600" /> Fluxo de Trabalho Gobots
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-3xl font-black text-blue-200 mb-2">01</div>
                <p className="font-bold text-slate-700">Importação Ágil</p>
                <p className="text-xs text-slate-500 mt-2">Arraste até 200 documentos de uma só vez (PDF, Imagens, Word).</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-3xl font-black text-blue-200 mb-2">02</div>
                <p className="font-bold text-slate-700">Extração via IA</p>
                <p className="text-xs text-slate-500 mt-2">Leitura técnica detalhada de pesos, gramagens e compatibilidades.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="text-3xl font-black text-blue-200 mb-2">03</div>
                <p className="font-bold text-slate-700">Suporte CX</p>
                <p className="text-xs text-slate-500 mt-2">Gere o Excel revisado e envie para o time de Sucesso do Cliente.</p>
              </div>
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className={`relative group border-2 border-dashed rounded-[56px] p-20 bg-white shadow-2xl shadow-slate-200/50 transition-all ${files.length > 0 ? 'border-blue-400 bg-blue-50/5' : 'border-slate-200 hover:border-blue-300'}`}>
                <input type="file" multiple onChange={handleFileSelection} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isProcessing} />
                <IconFiles size={48} className="text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight italic">Incluir Fichas Técnicas</h3>
                <p className="text-slate-400 text-sm mb-10 max-w-xs mx-auto">Suporte para ficheiros individuais ou em massa.</p>
                
                {files.length > 0 && !isProcessing && (
                  <button onClick={(e) => { e.stopPropagation(); runParallelConversion(); }} className="bg-blue-600 text-white font-black py-5 px-16 rounded-[28px] shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all relative z-20">
                    Iniciar Conversão Inteligente ({files.length})
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 h-[580px] flex flex-col shadow-lg overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <IconClock size={18} className="text-blue-600" />
                  <span className="font-black text-slate-800 text-xs uppercase tracking-widest">Fila de Espera</span>
                </div>
                <span className="bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm">{files.length} Itens</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {files.length === 0 ? <div className="h-full flex items-center justify-center opacity-20"><IconZap size={64} /></div> : 
                  files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[24px] group hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <IconFileText size={18} className="text-blue-500" />
                        <span className="text-[11px] font-black text-slate-700 truncate max-w-[130px]">{f.name}</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><IconTrash size={16} /></button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center text-center">
            <div className="space-y-10 max-w-sm w-full animate-in zoom-in-95">
              <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                <IconLoader className="text-blue-500 absolute" size={220} />
                <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{progress}%</span>
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter italic">Extração Ágil</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4">{statusText}</p>
                <div className="flex justify-center gap-2 mt-6">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-10 space-y-12 pb-24">
            <div className="bg-slate-900 p-12 rounded-[64px] text-white flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
              <div className="relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
                  <IconCheck size={14} /> Conversão Concluída
                </div>
                <h2 className="text-5xl font-black tracking-tighter italic leading-none">Dados Estruturados</h2>
                <p className="text-slate-400 font-medium mt-4 max-w-md">Fichas técnicas processadas com sucesso. Verifique a pré-visualização abaixo.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-5 relative z-10">
                <button onClick={() => { setFiles([]); setResults([]); setStep(1); }} className="bg-white/5 hover:bg-white/10 text-white font-bold py-5 px-10 rounded-[28px] transition-all border border-white/10 backdrop-blur-lg">Novo Lote</button>
                <button onClick={exportExcelFile} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-[28px] shadow-3xl shadow-blue-600/30 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all">
                  <IconDownload size={24} /> Baixar Excel
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-12 rounded-[56px] flex flex-col lg:flex-row items-center gap-12 shadow-sm">
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl font-black text-blue-900 mb-3 tracking-tight">Envio para Implementação</h3>
                <p className="text-blue-700 text-sm font-medium leading-relaxed max-w-2xl italic">
                  Envie o ficheiro final revisado para o seu Gerente de Sucesso ou time de <strong>Customer Experience (CX)</strong> através de nossos canais oficiais:
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 shrink-0">
                <a href="https://gobots.atlassian.net/servicedesk/customer/portal/7/group/29/create/10461" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white text-blue-900 font-bold px-10 py-5 rounded-[28px] border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"><IconExternal size={22} /> Ticket CX</a>
                <a href="https://api.whatsapp.com/send/?phone=551145024714" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#25D366] text-white font-black px-12 py-5 rounded-[28px] hover:bg-[#1ebd57] transition-all shadow-2xl shadow-green-100"><IconWhatsApp size={24} /> WhatsApp CX</a>
              </div>
            </div>

            <div className="bg-white rounded-[64px] shadow-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-12 py-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Origem</th>
                      {COLUMNS.map(c => <th key={c} className="px-6 py-8 font-black text-slate-900 uppercase text-[10px] tracking-tight whitespace-nowrap">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all group">
                        <td className="px-12 py-6 italic text-slate-400 text-xs font-medium truncate max-w-[180px]">{row.fileName}</td>
                        <td className="px-6 py-6 font-black font-mono text-blue-600 text-[13px] tracking-tighter">{row.EAN || '-'}</td>
                        <td className="px-6 py-6 font-black font-mono text-[13px] tracking-tighter">{row.SKU || '-'}</td>
                        <td className="px-6 py-6 font-mono text-slate-400 text-[12px]">{row.MLB || '-'}</td>
                        <td className="px-6 py-6 text-xs italic leading-relaxed max-w-[320px] text-slate-600 bg-slate-50/30 group-hover:bg-white">{row["O QUE ACOMPANHA O PRODUTO"]}</td>
                        <td className="px-6 py-6 text-xs font-semibold text-slate-500">{row.MEDIDAS}</td>
                        <td className="px-6 py-6 text-[11px] font-medium text-slate-500 max-w-[220px] leading-snug">{row.COMPATIBILIDADE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-10 bg-red-50 border border-red-100 rounded-[40px] text-red-600 flex items-center gap-6 shadow-xl animate-in slide-in-from-top-4">
            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg"><IconZap size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Ocorreu um erro</p>
              <span className="font-bold text-lg leading-tight">{error}</span>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 py-16 border-t border-slate-200 text-center opacity-30">
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.6em] italic">Gobots Inteligência &copy; 2026</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default App;
