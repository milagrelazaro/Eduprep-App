
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BookOpen, Clock, PlayCircle, Trophy, BarChart2, Sparkles, ArrowRight, X } from 'lucide-react';

const ExamCenter: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const startSimulado = () => {
    setIsSimulating(true);
  };

  const submitExam = async () => {
    const score = Math.floor(Math.random() * 11) + 10; // Mock score between 10-20
    const result = {
      id: Date.now().toString(),
      score,
      date: new Date().toLocaleDateString(),
      subject: 'Matemática'
    };

    // Save result to simulate progress
    const saved = JSON.parse(localStorage.getItem('eduprep_exams') || '[]');
    localStorage.setItem('eduprep_exams', JSON.stringify([result, ...saved]));

    setCurrentScore(score);
    setIsSimulating(false);
    
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{
            text: `Analise o seguinte resultado de exame de admissão de Matemática (score: ${score}/20) e recomende tópicos específicos de estudo e tipo de tutor ideal em Português de Moçambique. Seja motivador e conciso.`
          }]
        }
      });
      setAiAdvice(response.text || "Excelente esforço! Continue focado em trigonometria e funções.");
    } catch (e) {
      console.error(e);
      setAiAdvice("Não foi possível gerar recomendações personalizadas agora, mas recomendamos focar em funções logarítmicas e trigonometria avançada.");
    }
    setLoadingAI(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {!isSimulating ? (
        <>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Centro de Exames</h1>
              <p className="text-gray-500">Prepare-se para as melhores universidades.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              <BarChart2 className="w-5 h-5" />
              Ver Histórico Completo
            </button>
          </header>

          {currentScore !== null && (
            <div className="bg-white rounded-3xl p-8 border-2 border-indigo-600 relative overflow-hidden shadow-xl shadow-indigo-50/50 animate-in slide-in-from-top-4 duration-300">
               <div className="absolute top-0 right-0 p-4">
                  <Trophy className="w-16 h-16 text-indigo-100/50 -rotate-12" />
               </div>
               <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="text-center md:text-left">
                     <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Resultado Recente</span>
                     <div className="text-7xl font-black text-indigo-600 my-4 tabular-nums">{currentScore}<span className="text-2xl text-gray-300 font-normal">/20</span></div>
                     <p className={`font-bold text-lg ${currentScore >= 14 ? 'text-green-600' : 'text-orange-600'}`}>
                        {currentScore >= 14 ? 'Excelente progresso!' : 'Podes melhorar com estudo focado.'}
                     </p>
                  </div>
                  
                  <div className="flex-1 bg-indigo-50 rounded-2xl p-6 relative">
                     <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-indigo-900">IA Advisor</h4>
                     </div>
                     {loadingAI ? (
                       <div className="space-y-3">
                         <div className="h-4 bg-indigo-200/50 rounded-full w-full animate-pulse"></div>
                         <div className="h-4 bg-indigo-200/50 rounded-full w-5/6 animate-pulse"></div>
                         <div className="h-4 bg-indigo-200/50 rounded-full w-4/6 animate-pulse"></div>
                       </div>
                     ) : (
                       <div className="text-sm text-indigo-800 leading-relaxed font-medium italic">
                         "{aiAdvice}"
                       </div>
                     )}
                     <div className="mt-6 flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors">
                          Agendar com Especialista
                        </button>
                        <button className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                          Ver Erros Comuns <ArrowRight className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['UEM', 'UP', 'UCM', 'Unilúrio'].map((inst) => (
              <div key={inst} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                  <span className="font-black text-gray-300 group-hover:text-indigo-600 text-xl transition-colors">{inst[0]}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{inst}</h3>
                <p className="text-sm text-gray-400 mb-6">Exames atualizados 2024</p>
                <div className="space-y-2">
                  <ExamAction subject="Matemática" onStart={startSimulado} />
                  <ExamAction subject="Português" onStart={startSimulado} />
                  <ExamAction subject="Física" onStart={startSimulado} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="fixed inset-0 bg-gray-50 z-[100] overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
             <div className="flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur-md py-4 z-10 border-b border-gray-200 mb-8">
                <div className="flex items-center gap-4">
                   <button onClick={() => setIsSimulating(false)} className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-200 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                   <h2 className="font-bold text-xl">Simulado: Matemática 2024</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-mono font-bold">
                   <Clock className="w-5 h-5" />
                   119:45
                </div>
             </div>

             <div className="space-y-8 pb-32">
               {[1, 2, 3, 4, 5].map((q) => (
                 <div key={q} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold mb-6">Questão {q}</span>
                    <p className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">
                      Resolva a equação logarítmica log₂({q}x + 4) = 3. Qual o valor de x?
                    </p>
                    <div className="grid gap-4">
                      {['x = 1', 'x = 2', 'x = 3', 'x = 4'].map((opt, idx) => (
                        <button key={idx} className="w-full text-left p-5 rounded-2xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center group">
                          <span className="inline-block w-10 h-10 rounded-xl bg-gray-50 text-gray-400 font-black text-center leading-10 mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">{String.fromCharCode(65 + idx)}</span>
                          <span className="font-bold text-gray-700 group-hover:text-indigo-900">{opt}</span>
                        </button>
                      ))}
                    </div>
                 </div>
               ))}
             </div>

             <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-center z-20">
                <button
                  onClick={submitExam}
                  className="w-full max-w-sm py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Finalizar e Ver Resultado
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExamAction = ({ subject, onStart }: { subject: string; onStart: () => void }) => (
  <button onClick={onStart} className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group text-left">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
        <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
      </div>
      <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-900">{subject}</span>
    </div>
    <PlayCircle className="w-5 h-5 text-gray-200 group-hover:text-indigo-600 transition-colors" />
  </button>
);

export default ExamCenter;
