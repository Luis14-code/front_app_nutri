import React, { useContext } from 'react';
import { ChefHat, User, MessageSquare, LogOut, LayoutDashboard, UtensilsCrossed, Users } from 'lucide-react';
import { AuthContext } from '../../utils/contexts';

const AppLayout = ({ children, role, currentPage, setPage }) => {
  const { logout, user } = useContext(AuthContext);

  const menuItems = role === 'nutritionist' ? [
    { id: 'students', label: 'Meus Alunos', icon: Users },
  ] : [
    { id: 'student_dashboard', label: 'Meu Dia', icon: LayoutDashboard }, 
    { id: 'recipes', label: 'Receitas', icon: UtensilsCrossed },
    { id: 'chat', label: 'Nutri AI', icon: MessageSquare },
    { id: 'profile', label: 'Perfil e Metas', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">NutriLife</h1>
            <p className="text-xs text-gray-500">{role === 'nutritionist' ? 'Pro' : 'App'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentPage === item.id 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" /> 
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
            <p className="font-semibold text-gray-700">{user?.name}</p>
            <p className="text-gray-500">{role === 'nutritionist' ? 'Nutricionista' : 'Aluno'}</p>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> 
            Sair
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 flex justify-between px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setPage(item.id)} 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === item.id 
                ? 'text-green-600' 
                : 'text-gray-400'
            }`}
          >
            <item.icon className="w-6 h-6" /> 
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <main className="flex-1 md:ml-72 p-4 md:p-8 pb-24 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
