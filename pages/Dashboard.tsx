
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { Calendar, TrendingUp, Award, Clock, ArrowRight, Star, Wallet, Play, Check, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Seg', score: 40 },
  { name: 'Ter', score: 60 },
  { name: 'Qua', score: 55 },
  { name: 'Qui', score: 85 },
  { name: 'Sex', score: 75 },
  { name: 'Sab', score: 90 },
  { name: 'Dom', score: 95 },
];

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isStudent = user?.role === UserRole.STUDENT;
  
  const [lessons, setLessons] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);

  useEffect(() => {
    const savedLessons = JSON.parse(localStorage.getItem('eduprep_lessons') || '[]');
    const savedExams = JSON.parse(localStorage.getItem('eduprep_exams') || '[]');
    setLessons(savedLessons);
    setExamResults(savedExams);
  }, []);

  const handleLessonAction = (id: string, action: 'confirmed' | 'cancelled') => {
    const updated = lessons.map(l => l.id === id ? { ...l, status: action } : l);
    setLessons(updated);
    localStorage.setItem('eduprep_lessons', JSON.stringify(updated));
  };

  const activeLessons = lessons.filter(l => l.status === 'confirmed');
  const pendingLessons = lessons.filter(l => l.status === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Olá, {user?.name}! 👋</h1>
          <p className="text-gray-500">
            {isStudent 
              ? 'Pronto para dominar os próximos exames?' 
              : 'Gerencie suas aulas e acompanhe seus ganhos.'}
          </p>
        </div>
        {!isStudent && (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border border-green-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Disponível
            </span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isStudent ? (
          <>
            <DashboardCard
              title="Próxima Aula"
              value={activeLessons.length > 0 ? activeLessons[0].subject : 'Sem aulas'}
              subtitle={activeLessons.length > 0 ? activeLessons[0].date : 'Agende hoje mesmo'}
              icon={Clock}
              color="blue"
              action={activeLessons.length > 0 ? "Entrar na Sala" : "Procurar Tutor"}
              onAction={() => navigate(activeLessons.length > 0 ? `/lessons/${activeLessons[0].id}` : '/marketplace')}
            />
            <DashboardCard
              title="Progresso"
              value={examResults.length > 0 ? `${Math.min(100, examResults.length * 20)}%` : '0%'}
              subtitle="Baseado em simulados"
              icon={TrendingUp}
              color="indigo"
              action="Novo Simulado"
              onAction={() => navigate('/exams')}
            />
            <DashboardCard
              title="Simulados"
              value={examResults.length.toString()}
              subtitle="Média 14.5/20"
              icon={Award}
              color="green"
              action="Ver Rankings"
              onAction={() => navigate('/exams')}
            />
          </>
        ) : (
          <>
            <DashboardCard
              title="Ganhos Totais"
              value="15.800 MT"
              subtitle="Ganhos este mês"
              icon={Wallet}
              color="green"
              action="Ver Carteira"
              onAction={() => navigate('/profile')}
            />
            <DashboardCard
              title="Aulas Pendentes"
              value={pendingLessons.length.toString()}
              subtitle="Aguardando confirmação"
              icon={Calendar}
              color="orange"
              action="Ver Pedidos"
              onAction={() => {}}
            />
            <DashboardCard
              title="Avaliação"
              value="4.9"
              subtitle="Top 5% da plataforma"
              icon={Star}
              color="yellow"
              action="Ver Reviews"
              onAction={() => {}}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Atividade Principal */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-lg text-gray-900">Atividade Recente</h3>
            <button className="text-xs font-bold text-indigo-600 hover:underline">Ver tudo</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Lado Direito: Aulas ou Pedidos */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg text-gray-900">{isStudent ? 'Próximas Sessões' : 'Pedidos de Aula'}</h3>
           </div>
           
           <div className="space-y-4">
             {(!isStudent ? pendingLessons : activeLessons).length > 0 ? (!isStudent ? pendingLessons : activeLessons).slice(0, 4).map((lesson, i) => (
               <div key={lesson.id} className="flex gap-4 items-center p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-50 transition-all group">
                 <img src={lesson.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                 <div className="flex-1">
                   <p className="text-sm font-bold text-gray-900">{lesson.subject}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lesson.tutorName || 'Estudante João'} • {lesson.date}</p>
                 </div>
                 {isStudent ? (
                    <button 
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                      className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                 ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLessonAction(lesson.id, 'confirmed')}
                        className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleLessonAction(lesson.id, 'cancelled')}
                        className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                 )}
               </div>
             )) : (
               <div className="text-center py-12">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Calendar className="w-8 h-8 text-gray-200" />
                 </div>
                 <p className="text-gray-400 text-sm font-medium">Tudo em dia! Sem pedidos no momento.</p>
               </div>
             )}
           </div>
        </section>
      </div>

      {isStudent && (
        <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Award className="w-40 h-40 -rotate-12" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black mb-4">Alcance a sua vaga na UEM!</h2>
            <p className="opacity-80 max-w-lg text-lg">
              Estudantes que fazem pelo menos 3 simulados por semana têm 85% mais chance de aprovação.
            </p>
          </div>
          <button 
            onClick={() => navigate('/exams')}
            className="relative z-10 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-lg hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
          >
            Treinar Agora
          </button>
        </div>
      )}
    </div>
  );
};

const DashboardCard = ({ title, value, subtitle, icon: Icon, color, action, onAction }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{title}</span>
      </div>
      <div className="mb-6">
        <h4 className="text-2xl font-black text-gray-900 truncate">{value}</h4>
        <p className="text-xs text-gray-400 font-bold mt-1">{subtitle}</p>
      </div>
      <button 
        onClick={onAction} 
        className="text-xs font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all flex items-center gap-2 group/btn"
      >
        {action} <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default Dashboard;
