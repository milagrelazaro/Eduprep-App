
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ShieldCheck, DollarSign, Search, MoreHorizontal, Check, X, AlertTriangle } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [tutorApplications, setTutorApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const loadData = () => {
    const saved = localStorage.getItem('eduprep_all_tutors');
    if (saved) {
      setTutorApplications(JSON.parse(saved));
    } else {
      // Caso base se nada existir
      const initialTutors = [
        { id: '1', name: 'Pedro Sambo', subject: 'Matemática', status: 'pending', email: 'pedro@gmail.com', avatar: 'https://picsum.photos/seed/1/200' },
        { id: '2', name: 'Ana Vilanculos', subject: 'Português', status: 'pending', email: 'ana@gmail.com', avatar: 'https://picsum.photos/seed/2/200' },
        { id: '3', name: 'Mário Langa', subject: 'Física', status: 'active', email: 'mario@gmail.com', avatar: 'https://picsum.photos/seed/3/200' },
      ];
      localStorage.setItem('eduprep_all_tutors', JSON.stringify(initialTutors));
      setTutorApplications(initialTutors);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateTutorStatus = (id: string, status: 'active' | 'suspended' | 'pending') => {
    const updated = tutorApplications.map(t => t.id === id ? { ...t, status } : t);
    setTutorApplications(updated);
    localStorage.setItem('eduprep_all_tutors', JSON.stringify(updated));
    // Forçar atualização local para garantir sincronia imediata entre abas se necessário
    window.dispatchEvent(new Event('storage'));
  };

  const filteredTutors = tutorApplications.filter(t => 
    t.name.toLowerCase().includes(filter.toLowerCase()) || 
    t.subject.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500">Gestão global de utilizadores e aprovações.</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">Atualizar Dados</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Utilizadores" value={tutorApplications.length.toString()} trend="+2" icon={Users} color="blue" />
        <StatCard title="Pendentes" value={tutorApplications.filter(t => t.status === 'pending').length.toString()} trend="Ação Requerida" icon={ShieldCheck} color="orange" />
        <StatCard title="Receita (Sim)" value="245k MT" trend="+5.4%" icon={DollarSign} color="green" />
        <StatCard title="Aulas" value="856" trend="+20%" icon={BookOpen} color="indigo" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h3 className="font-bold text-lg">Aprovação de Tutores</h3>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar tutor..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                 <tr>
                    <th className="px-6 py-4">Nome / Info</th>
                    <th className="px-6 py-4">Especialidade</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredTutors.length > 0 ? filteredTutors.map((tutor) => (
                    <tr key={tutor.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <img src={tutor.avatar} className="w-10 h-10 rounded-xl bg-gray-100 object-cover" alt="" />
                             <div>
                                <p className="font-bold text-sm text-gray-900">{tutor.name}</p>
                                <p className="text-[10px] text-gray-400">{tutor.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{tutor.subject}</span>
                       </td>
                       <td className="px-6 py-4">
                          <StatusBadge status={tutor.status} />
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                             {tutor.status === 'pending' && (
                               <>
                                 <button 
                                   onClick={() => updateTutorStatus(tutor.id, 'active')}
                                   className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                   title="Aprovar"
                                 >
                                   <Check className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => updateTutorStatus(tutor.id, 'suspended')}
                                   className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                   title="Rejeitar"
                                 >
                                   <X className="w-4 h-4" />
                                 </button>
                               </>
                             )}
                             {tutor.status === 'active' && (
                               <button 
                                 onClick={() => updateTutorStatus(tutor.id, 'suspended')}
                                 className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                 title="Suspender"
                                >
                                 <AlertTriangle className="w-4 h-4" />
                               </button>
                             )}
                             {tutor.status === 'suspended' && (
                               <button 
                                 onClick={() => updateTutorStatus(tutor.id, 'active')}
                                 className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                 title="Reativar"
                                >
                                 <Check className="w-4 h-4" />
                               </button>
                             )}
                             <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100"><MoreHorizontal className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                 )) : (
                   <tr>
                     <td colSpan={4} className="text-center py-10 text-gray-400 text-sm italic">Nenhum tutor encontrado com este filtro.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    active: 'bg-green-50 text-green-700 border-green-100',
    suspended: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`px-2 py-1 border text-[10px] font-bold rounded-full uppercase tracking-tight ${styles[status]}`}>
      {status === 'active' ? 'Ativo' : status === 'pending' ? 'Pendente' : 'Suspenso'}
    </span>
  );
};

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
       <div className={`p-3 rounded-2xl w-fit ${colors[color]} mb-4`}>
          <Icon className="w-6 h-6" />
       </div>
       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
       <div className="flex items-end justify-between mt-2">
          <h4 className="text-2xl font-black text-gray-900">{value}</h4>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trend.startsWith('+') ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>{trend}</span>
       </div>
    </div>
  );
};

export default AdminPanel;
