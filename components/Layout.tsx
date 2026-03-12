
import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, MessageSquare, User as UserIcon, LogOut, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../App';
import { UserRole } from '../types';

const Layout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Início', icon: Home, path: '/dashboard' },
    { label: 'Explicações', icon: BookOpen, path: '/marketplace' },
    { label: 'Exames', icon: GraduationCap, path: '/exams' },
    { label: 'Mensagens', icon: MessageSquare, path: '/messages' },
    { label: 'Perfil', icon: UserIcon, path: '/profile' },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.splice(4, 0, { label: 'Admin', icon: ShieldAlert, path: '/admin' });
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen p-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">EduPrep</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-6 overflow-y-auto">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] text-white font-bold">EP</div>
            <span className="font-bold text-lg">EduPrep</span>
          </div>
          <img src={user?.avatar || 'https://picsum.photos/32'} className="w-8 h-8 rounded-full" alt="User" />
        </header>
        
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 transition-all ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
