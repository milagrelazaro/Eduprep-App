
import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { User, Shield, CreditCard, Bell, Settings, LogOut, ChevronRight, Award, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { label: 'Dados Pessoais', icon: User, color: 'text-blue-500' },
    { label: 'Segurança e Palavra-passe', icon: Shield, color: 'text-green-500' },
    { label: 'Métodos de Pagamento', icon: CreditCard, color: 'text-indigo-500' },
    { label: 'Notificações', icon: Bell, color: 'text-orange-500' },
    { label: 'Preferências', icon: Settings, color: 'text-gray-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <img src={user?.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-gray-50" alt="" />
          <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center text-white text-[10px] font-bold">MUDAR</button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h1>
          <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full">{user?.role}</span>
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> Conta Verificada
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={logout} className="p-3 text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-all">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Wallet & Stats */}
        <section className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Carteira Virtual</p>
            <h2 className="text-4xl font-black mb-8">4.200 <span className="text-lg opacity-60">MT</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-sm transition-all">Recarregar</button>
              <button className="py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-sm transition-all">Histórico</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
             <div className="text-center p-4">
                <p className="text-gray-400 text-xs mb-1">Simulados</p>
                <p className="text-xl font-black">12</p>
             </div>
             <div className="text-center p-4 border-l border-gray-50">
                <p className="text-gray-400 text-xs mb-1">Aulas dadas</p>
                <p className="text-xl font-black">0</p>
             </div>
          </div>
        </section>

        {/* Settings List */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
           {menuItems.map((item, i) => (
             <button key={i} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
               <div className="flex items-center gap-4">
                 <div className={`p-3 bg-gray-50 rounded-xl ${item.color}`}>
                   <item.icon className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-gray-800">{item.label}</span>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-300" />
             </button>
           ))}
        </section>
      </div>
    </div>
  );
};

export default Profile;
