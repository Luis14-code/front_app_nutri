import React, { useState } from 'react';
import { AuthContext, DataContext } from './utils/contexts';
import AppLayout from './components/ui/AppLayout';
import StudentDashboard from './pages/StudentDashboard';
import RecipesFeed from './pages/RecipesFeed';
import ChatPage from './pages/ChatPage';
import Profile from './pages/Profile';
import StudentsPage from './pages/StudentsPage';
import AuthPage from './pages/AuthPage';
import { MOCK_RECIPES, DEFAULT_USER, NUTRITIONIST_USER, MOCK_STUDENTS } from './utils/mockData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('student_dashboard');
  const [recipes, setRecipes] = useState(MOCK_RECIPES);
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage(userData.role === 'nutritionist' ? 'students' : 'student_dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('student_dashboard');
  };

  // Funções de manipulação de dados
  const addRecipe = (newRecipe) => {
    setRecipes(prev => [...prev, newRecipe]);
  };

  const likeRecipe = (id) => {
    if (user.likedRecipes.includes(id)) {
        return; // Já curtiu, não faz nada
    }

    // 1. Atualizar a lista de receitas
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));

    // 2. Atualizar o usuário (adicionar a receita curtida)
    setUser(prevUser => ({
        ...prevUser,
        likedRecipes: [...prevUser.likedRecipes, id]
    }));
  };

  const updateStudentMeta = (studentId, newMeta) => {
    setStudents(prev => prev.map(s => s.uid === studentId ? { ...s, nutrition: { ...s.nutrition, ...newMeta } } : s));
  };

  const updateStudentMealPlan = (studentId, newMealPlan) => {
    setStudents(prev => prev.map(s => s.uid === studentId ? { ...s, mealPlan: newMealPlan } : s));
  };

  const addStudentToNutritionist = (studentEmail) => {
    // Buscar aluno por email
    const mockAllStudents = MOCK_STUDENTS;
    const student = mockAllStudents.find(s => s.email === studentEmail);
    
    if (student && !students.find(s => s.uid === student.uid)) {
      setStudents(prev => [...prev, student]);
      return student;
    }
    return null;
  };

  // Contextos
  const authContextValue = { 
    user, 
    role: user?.role, 
    logout: handleLogout, 
    login: handleLogin, 
    register: () => {}, 
    updateStudentMeta,
    updateStudentMealPlan, // Adicionado
    addStudentToNutritionist
  };
  const dataContextValue = { recipes, addRecipe, likeRecipe, students };

  const renderPage = () => {
    if (!user) return null;
    
    switch (currentPage) {
      case 'student_dashboard':
        return <StudentDashboard />;
      case 'recipes':
        return <RecipesFeed role={user?.role} />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <Profile />;
      case 'students':
        return <StudentsPage />;
      default:
        return <Profile />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <DataContext.Provider value={dataContextValue}>
        <AppLayout role={user?.role} currentPage={currentPage} setPage={setCurrentPage}>
          {renderPage()}
        </AppLayout>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}
