
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, Share, MessageSquare, Monitor, XCircle, Users, Layout as LayoutIcon, Send } from 'lucide-react';

const LessonRoom: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <div className="fixed inset-0 bg-gray-900 z-[100] flex flex-col md:flex-row">
      {/* Main Video/Whiteboard Area */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 relative bg-black rounded-3xl overflow-hidden shadow-2xl">
           <img src="https://picsum.photos/1280/720" className="w-full h-full object-cover opacity-60" alt="Teacher Feed" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center text-white">
                 <LayoutIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                 <h2 className="text-2xl font-bold">Quadro Branco</h2>
                 <p className="opacity-70">O Professor Silva está a partilhar o quadro.</p>
              </div>
           </div>

           {/* Small User Video */}
           <div className="absolute bottom-6 right-6 w-48 h-32 bg-gray-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl">
             <img src="https://picsum.photos/200/200" className="w-full h-full object-cover" alt="Student Feed" />
             <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-[10px] text-white">Tu</div>
           </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-4 bg-gray-800 p-4 rounded-3xl flex items-center justify-between gap-4">
           <div className="flex gap-2">
             <button
               onClick={() => setMicOn(!micOn)}
               className={`p-4 rounded-2xl transition-all ${micOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`}
             >
               <Mic className="w-6 h-6" />
             </button>
             <button
               onClick={() => setVideoOn(!videoOn)}
               className={`p-4 rounded-2xl transition-all ${videoOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`}
             >
               <Video className="w-6 h-6" />
             </button>
           </div>

           <div className="flex gap-2">
             <button className="p-4 bg-gray-700 text-white rounded-2xl hidden sm:block"><Monitor className="w-6 h-6" /></button>
             <button className="p-4 bg-gray-700 text-white rounded-2xl"><Users className="w-6 h-6" /></button>
             <button className="p-4 bg-indigo-600 text-white rounded-2xl font-bold px-6">Levantar Mão</button>
           </div>

           <button
             onClick={() => navigate('/dashboard')}
             className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
           >
             <XCircle className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full md:w-80 bg-white md:m-4 md:ml-0 md:rounded-3xl flex flex-col overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
               <MessageSquare className="w-5 h-5 text-indigo-600" />
               Chat da Aula
            </h3>
            <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Ativo</span>
         </div>
         
         <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
               <p className="text-xs font-bold text-gray-400 mb-1">Prof. Silva</p>
               <p className="text-sm">Olá João! Consegues ver bem o quadro?</p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none text-white self-end ml-8">
               <p className="text-sm">Sim professor, está perfeito. Podemos rever a parte da derivada?</p>
            </div>
         </div>

         <div className="p-4 border-t border-gray-100">
            <div className="relative">
               <input
                 type="text"
                 placeholder="Escrever mensagem..."
                 className="w-full p-4 pr-12 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500"
               />
               <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl">
                  <Send className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LessonRoom;
