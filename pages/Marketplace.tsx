
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, CheckCircle, Video, MapPin, X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'success'>('details');
  const [tutors, setTutors] = useState<any[]>([]);

  useEffect(() => {
    // Carregar tutores aprovados
    const loadTutors = () => {
      let saved = localStorage.getItem('eduprep_all_tutors');
      
      // Se não houver nada, inicializa com mocks básicos
      if (!saved) {
        const initial = [
          { id: '1', name: 'Pedro Sambo', subject: 'Matemática', status: 'pending', email: 'pedro@gmail.com', avatar: 'https://picsum.photos/seed/1/200' },
          { id: '2', name: 'Ana Vilanculos', subject: 'Português', status: 'pending', email: 'ana@gmail.com', avatar: 'https://picsum.photos/seed/2/200' },
          { id: '3', name: 'Mário Langa', subject: 'Física', status: 'active', email: 'mario@gmail.com', avatar: 'https://picsum.photos/seed/3/200' },
        ];
        localStorage.setItem('eduprep_all_tutors', JSON.stringify(initial));
        saved = JSON.stringify(initial);
      }

      const all = JSON.parse(saved);
      const marketplaceData = all
        .filter((t: any) => t.status === 'active')
        .map((t: any) => ({
          ...t,
          price: t.price || Math.floor(Math.random() * 500) + 500,
          rating: t.rating || (Math.random() * (5 - 4.5) + 4.5).toFixed(1),
          reviews: t.reviews || Math.floor(Math.random() * 100) + 10,
          verified: true
        }));
      setTutors(marketplaceData);
    };

    loadTutors();
  }, []);

  const handleBook = () => {
    const lessons = JSON.parse(localStorage.getItem('eduprep_lessons') || '[]');
    const newLesson = {
      id: Date.now().toString(),
      tutorName: selectedTutor.name,
      subject: selectedTutor.subject,
      date: 'Amanhã, 10:00',
      status: 'pending',
      avatar: selectedTutor.avatar
    };
    localStorage.setItem('eduprep_lessons', JSON.stringify([newLesson, ...lessons]));
    setBookingStep('success');
  };

  const filteredTutors = tutors.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Encontrar Explicações</h1>
          <p className="text-gray-500 text-lg">Tutores certificados para o seu sucesso académico.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Disciplina, nome ou nível..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        {['Todos', 'Matemática', 'Física', 'Química', 'Português', 'Biologia', 'Inglês', 'História'].map((f) => (
          <button key={f} className="px-6 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold whitespace-nowrap hover:border-indigo-600 hover:text-indigo-600 shadow-sm transition-all active:scale-95">
            {f}
          </button>
        ))}
      </div>

      {filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTutors.map((tutor) => (
            <div key={tutor.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <img src={tutor.avatar} alt={tutor.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 ring-4 ring-gray-50" />
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
                      <CheckCircle className="w-6 h-6 text-blue-500 fill-white" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-600 font-black text-2xl">{tutor.price}<span className="text-xs ml-1 opacity-60">MT</span></div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">por hora</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-black text-xl text-gray-900 mb-1">{tutor.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{tutor.subject}</span>
                    <span className="text-xs font-bold text-gray-400">• Preparação Exames</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex flex-col items-center gap-1 border-r border-gray-200 flex-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-black">{tutor.rating}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{tutor.reviews} Reviews</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                     <Video className="w-4 h-4 text-indigo-600" />
                     <span className="text-[9px] text-gray-400 font-bold uppercase">Aula Online</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-l border-gray-200 flex-1">
                     <MapPin className="w-4 h-4 text-gray-400" />
                     <span className="text-[9px] text-gray-400 font-bold uppercase">Maputo</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setSelectedTutor(tutor); setBookingStep('details'); }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Marcar Explicação
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-200" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">A aguardar aprovação de tutores</h3>
           <p className="text-gray-400 max-w-xs mx-auto">Neste momento não existem tutores ativos na sua área. Volte mais tarde ou aceda ao painel Admin para aprovar novos candidatos.</p>
           <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all">Recarregar Lista</button>
        </div>
      )}

      {selectedTutor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            {bookingStep === 'details' ? (
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Agendar Aula</h2>
                    <p className="text-gray-400 font-medium">Com {selectedTutor.name}</p>
                  </div>
                  <button onClick={() => setSelectedTutor(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="space-y-4 mb-10">
                  <div className="p-5 bg-gray-50 rounded-3xl flex items-center gap-5 border border-gray-100 shadow-inner">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sessão sugerida</p>
                      <p className="font-black text-gray-900">Amanhã, 22 de Outubro</p>
                    </div>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-3xl flex items-center gap-5 border border-gray-100 shadow-inner">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Horário fixo</p>
                      <p className="font-black text-gray-900">10:00 — 11:30</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 rounded-3xl p-6 mb-10 border border-indigo-100 border-dashed">
                  <div className="flex justify-between mb-3">
                    <span className="text-indigo-900/60 font-bold text-sm">Preço da sessão</span>
                    <span className="font-black text-indigo-900">{selectedTutor.price} MT</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-indigo-900/60 font-bold text-sm">Taxa EduPrep</span>
                    <span className="font-black text-indigo-900">50 MT</span>
                  </div>
                  <div className="h-px bg-indigo-100 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-900 font-black">Total a pagar</span>
                    <span className="text-2xl font-black text-indigo-600">{selectedTutor.price + 50} MT</span>
                  </div>
                </div>

                <button 
                  onClick={handleBook}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Confirmar Agendamento
                </button>
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">Pedido Enviado!</h2>
                <p className="text-gray-500 font-medium mb-10">O tutor foi notificado e deve aceitar a aula em breve. Fique atento às suas mensagens!</p>
                <button 
                  onClick={() => setSelectedTutor(null)}
                  className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-lg hover:bg-black transition-all"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
