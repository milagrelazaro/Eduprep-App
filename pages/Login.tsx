
import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const initialRole = (location.state as any)?.role || UserRole.STUDENT;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalRole = initialRole;
    if (email.toLowerCase() === 'admin@eduprep.com') {
      finalRole = UserRole.ADMIN;
    }

    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: name || (email ? email.split('@')[0] : (finalRole === UserRole.ADMIN ? 'Administrador' : 'Utilizador')),
      email: email || (finalRole === UserRole.ADMIN ? 'admin@eduprep.com' : 'teste@eduprep.com'),
      role: finalRole,
      status: 'active' as const,
      avatar: finalRole === UserRole.ADMIN 
        ? 'https://ui-avatars.com/api/?name=Admin&background=1f2937&color=fff' 
        : `https://picsum.photos/seed/${email || Math.random()}/200`
    };

    // Gestão da persistência de tutores
    const savedTutors = localStorage.getItem('eduprep_all_tutors');
    let allTutors = savedTutors ? JSON.parse(savedTutors) : [
      { id: '1', name: 'Pedro Sambo', subject: 'Matemática', status: 'pending', email: 'pedro@gmail.com', avatar: 'https://picsum.photos/seed/1/200' },
      { id: '2', name: 'Ana Vilanculos', subject: 'Português', status: 'pending', email: 'ana@gmail.com', avatar: 'https://picsum.photos/seed/2/200' },
      { id: '3', name: 'Mário Langa', subject: 'Física', status: 'active', email: 'mario@gmail.com', avatar: 'https://picsum.photos/seed/3/200' },
    ];

    // Se o utilizador é um TUTOR, garantimos que ele está na lista de pendentes do Admin
    if (finalRole === UserRole.TUTOR) {
      const existing = allTutors.find((t: any) => t.email.toLowerCase() === newUser.email.toLowerCase());
      if (!existing) {
        allTutors.push({
          id: newUser.id,
          name: newUser.name,
          subject: 'Nova Especialidade',
          status: 'pending',
          email: newUser.email,
          avatar: newUser.avatar,
          price: 450,
          rating: '0.0',
          reviews: 0
        });
      }
    }

    localStorage.setItem('eduprep_all_tutors', JSON.stringify(allTutors));
    setUser(newUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
           <div className={`p-3 rounded-2xl ${initialRole === UserRole.ADMIN ? 'bg-gray-800' : 'bg-indigo-600'}`}>
              <ShieldCheck className="text-white w-8 h-8" />
           </div>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900">
          {isLogin ? 'Bem-vindo de volta' : 'Crie a sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-bold uppercase tracking-widest">
          Acesso: {initialRole}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-gray-200/50 rounded-[32px] sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 bg-gray-50 border-gray-100 rounded-2xl h-14 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none border"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email ou Telefone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 bg-gray-50 border-gray-100 rounded-2xl h-14 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none border"
                  placeholder={initialRole === UserRole.ADMIN ? 'admin@eduprep.com' : 'exemplo@gmail.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Palavra-passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 bg-gray-50 border-gray-100 rounded-2xl h-14 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-black text-white transition-all active:scale-95 ${
                initialRole === UserRole.ADMIN ? 'bg-gray-800 hover:bg-black shadow-gray-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-xs">
             <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-black hover:underline transition-all">
                {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
             </button>
             <button className="text-gray-400 font-bold">Esqueceu a senha?</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
