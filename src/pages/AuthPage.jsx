import React, { useState } from 'react';
import { ChefHat, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null); // null, 'student', 'nutritionist'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não conferem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      // Simulação de login
      const mockUsers = [
        { email: 'aluno@test.com', password: '123456', role: 'student', name: 'Ana Silva' },
        { email: 'nutri@test.com', password: '123456', role: 'nutritionist', name: 'Dra. Ana' },
      ];

      const user = mockUsers.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        onLogin(user);
      } else {
        setErrors({ email: 'Email ou senha incorretos' });
      }
    } else {
      // Simulação de registro
      if (!role) {
        setErrors({ role: 'Selecione seu papel' });
        return;
      }

      const newUser = {
        email: formData.email,
        password: formData.password,
        role: role,
        name: formData.name,
        uid: `${role}-${Date.now()}`,
        nutrition: {
          goal: 'Manutenção',
          caloriesTarget: 2000,
          proteinTarget: 150,
          carbsTarget: 200,
        },
        gamification: { totalPoints: 0, streak: 0, bestStreak: 0 },
        history: {
          dailySummary: [],
          activities: [],
        },
      };

      onLogin(newUser);
    }
  };

  // Tela de seleção de papel
  if (!isLogin && !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                <ChefHat className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NutriLife</h1>
            <p className="text-gray-600">Escolha seu papel para começar</p>
          </div>

          <div className="space-y-4">
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all border-2 border-gray-200"
              onClick={() => setRole('student')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Sou Aluno</h3>
                  <p className="text-sm text-gray-600 mt-1">Acompanhe suas metas nutricionais e progresso</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all border-2 border-gray-200"
              onClick={() => setRole('nutritionist')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Sou Nutricionista</h3>
                  <p className="text-sm text-gray-600 mt-1">Acompanhe seus alunos e forneça orientações</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />
              </div>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Já tem conta?{' '}
              <button 
                onClick={() => setIsLogin(true)}
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <ChefHat className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NutriLife</h1>
          <p className="text-gray-600">
            {isLogin ? 'Bem-vindo de volta!' : `Registre-se como ${role === 'student' ? 'Aluno' : 'Nutricionista'}`}
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirme sua senha"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button type="submit" className="w-full mt-6">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setRole(null);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  setErrors({});
                }}
                className="text-green-600 font-semibold hover:text-green-700"
              >
                {isLogin ? 'Registre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          Credenciais de teste: aluno@test.com / nutri@test.com (senha: 123456)
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
