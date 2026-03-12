
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, ShieldAlert } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-100">
        <GraduationCap className="text-white w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">EduPrep SaaS</h1>
      <p className="text-gray-500 max-w-sm mb-12">
        Aprenda, prepare-se e passe nos exames de admissão com os melhores tutores.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate('/login', { state: { role: 'student' } })}
          className="group p-6 bg-white border-2 border-gray-100 hover:border-indigo-600 rounded-2xl transition-all text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Sou Estudante</h3>
            <p className="text-sm text-gray-500">Quero aprender e passar nos exames.</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/login', { state: { role: 'tutor' } })}
          className="group p-6 bg-white border-2 border-gray-100 hover:border-indigo-600 rounded-2xl transition-all text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Sou Tutor</h3>
            <p className="text-sm text-gray-500">Quero dar explicações e ajudar alunos.</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/login', { state: { role: 'admin' } })}
          className="group p-4 bg-gray-50 border-2 border-transparent hover:border-gray-200 rounded-2xl transition-all text-left flex items-center gap-4 mt-4"
        >
          <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center group-hover:bg-gray-800 group-hover:text-white transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-700">Administração</h4>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Acesso Restrito</p>
          </div>
        </button>
      </div>

      <div className="mt-12 text-gray-400 text-sm">
        Já tem uma conta? <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold underline">Fazer Login</button>
      </div>
    </div>
  );
};

export default Onboarding;
