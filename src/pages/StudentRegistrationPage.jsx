import React, { useState, useContext } from 'react';
import { Mail, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthContext, DataContext } from '../utils/contexts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const StudentRegistrationPage = ({ onBack }) => {
  const { addStudentToNutritionist } = useContext(AuthContext);
  const { students } = useContext(DataContext);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock de alunos disponíveis no sistema
  const mockAvailableStudents = [
    { email: 'ana@test.com', name: 'Ana Silva', goal: 'Hipertrofia' },
    { email: 'bruno@test.com', name: 'Bruno Costa', goal: 'Perda de Peso' },
    { email: 'carla@test.com', name: 'Carla Mendes', goal: 'Manutenção' },
    { email: 'daniel@test.com', name: 'Daniel Pereira', goal: 'Hipertrofia' },
  ];

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Por favor, insira um email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email inválido');
      return;
    }

    // Verificar se o aluno já está registrado
    if (students.some(s => s.email === email)) {
      setError('Este aluno já está registrado com você');
      return;
    }

    setLoading(true);

    // Simular busca no banco de dados
    setTimeout(() => {
      const student = mockAvailableStudents.find(s => s.email === email);

      if (student) {
        // Aqui você chamaria a função addStudentToNutritionist
        // Por enquanto, apenas mostramos sucesso
        setSuccess(`Aluno ${student.name} adicionado com sucesso!`);
        setEmail('');
      } else {
        setError('Aluno não encontrado no sistema. Verifique o email.');
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="mb-4">
        ← Voltar para Meus Alunos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Registro */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-green-600" /> Registrar Novo Aluno
          </h2>

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email do Aluno
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="aluno@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Digite o email do aluno que você deseja acompanhar
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? 'Buscando...' : 'Adicionar Aluno'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 font-semibold">Emails de teste disponíveis:</p>
            <div className="space-y-2">
              {mockAvailableStudents.map(student => (
                <button
                  key={student.email}
                  onClick={() => setEmail(student.email)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                  <p className="text-xs text-gray-600 mt-1">Meta: {student.goal}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Alunos Registrados */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Meus Alunos ({students.length})</h2>

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-semibold">Nenhum aluno registrado ainda</p>
              <p className="text-sm text-gray-500 mt-1">Adicione alunos usando o formulário ao lado</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div 
                  key={student.uid}
                  className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email || 'Email não informado'}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        <span className="font-semibold">Meta:</span> {student.nutrition?.goal}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Calorias:</span> {student.nutrition?.caloriesTarget} kcal
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentRegistrationPage;
