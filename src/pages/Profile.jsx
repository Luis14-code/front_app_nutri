import React, { useContext, useState } from 'react';
import { AuthContext } from '../utils/contexts';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { ArrowDown, ArrowUp, HeartPulse, Droplet, Calendar as CalendarIcon, Trophy, AlertCircle, Lock } from 'lucide-react';

// Componente AdherenceCalendar (Será ajustado na próxima fase)
const AdherenceCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  // Dados mockados para simular o calendário
  const days = Array.from({ length: 30 }, (_, i) => {
    if (i > 25) return { day: i + 1, status: 'future' };
    if (i % 7 === 0) return { day: i + 1, status: 'none', missed: ['Café da Manhã', 'Almoço', 'Jantar'] }; // Errou muito
    if (i % 3 === 0) return { day: i + 1, status: 'partial', missed: ['Lanche da Tarde'] }; // Errou pouco
    return { day: i + 1, status: 'full', missed: [] };
  });

  const getColor = (status) => {
    switch(status) {
      case 'full': return 'bg-green-500 border-green-600 cursor-pointer hover:bg-green-600'; // Nada errado
      case 'partial': return 'bg-orange-400 border-orange-500 cursor-pointer hover:bg-orange-500'; // Pouco errado
      case 'none': return 'bg-red-400 border-red-500 cursor-pointer hover:bg-red-500'; // Muito errado
      default: return 'bg-gray-100 border-gray-200 text-gray-300 cursor-default';
    }
  };

  const handleDayClick = (dayData) => {
      if (dayData.status !== 'future') {
          setSelectedDay(dayData);
      }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> Aderência à Dieta</h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> 100%</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Pouco Erro</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> Muito Erro</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => (
           <div 
             key={idx} 
             onClick={() => handleDayClick(d)}
             className={`aspect-square rounded-lg border ${getColor(d.status)} flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all hover:scale-105`}
            >
             {d.day}
           </div>
        ))}
      </div>

      <Modal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} title={`Relatório do Dia ${selectedDay?.day}`}>
          <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  selectedDay?.status === 'full' ? 'bg-green-100 text-green-600' :
                  selectedDay?.status === 'partial' ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
              }`}>
                  {selectedDay?.status === 'full' ? <Trophy className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              
              <h3 className="text-lg font-bold mb-2">
                  {selectedDay?.status === 'full' ? 'Dia Perfeito!' : 
                   selectedDay?.status === 'partial' ? 'Quase lá!' : 'Dia Difícil'}
              </h3>
              
              {selectedDay?.status === 'full' ? (
                  <p className="text-gray-600">Parabéns! Você seguiu o plano alimentar à risca neste dia.</p>
              ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-left mt-4">
                      <p className="text-sm font-bold text-gray-700 mb-2">Refeições não marcadas:</p>
                      <ul className="list-disc pl-5 space-y-1 text-red-600">
                          {selectedDay?.missed.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                  </div>
              )}
          </div>
      </Modal>
    </Card>
  );
};

const Profile = () => {
    const { user, role } = useContext(AuthContext);
    const isStudent = role === 'student';

    return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                {user.name[0]}
            </div>
            <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">Objetivo: <span className="text-green-600 font-medium">{user.nutrition?.goal}</span></p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-xl border flex flex-col items-center shadow-sm">
                <ArrowDown className="w-5 h-5 text-red-500 mb-1" />
                <span className="text-xs text-gray-500 uppercase font-bold">Peso Perdido</span>
                <span className="font-bold text-gray-900 text-lg">-4.5kg</span>
            </div>
            <div className="bg-white p-3 rounded-xl border flex flex-col items-center shadow-sm">
                <ArrowUp className="w-5 h-5 text-green-500 mb-1" />
                <span className="text-xs text-gray-500 uppercase font-bold">Massa Magra</span>
                <span className="font-bold text-gray-900 text-lg">+1.2kg</span>
            </div>
            <div className="bg-white p-3 rounded-xl border flex flex-col items-center shadow-sm">
                <HeartPulse className="w-5 h-5 text-red-500 mb-1" />
                <span className="text-xs text-gray-500 uppercase font-bold">Colesterol</span>
                <span className="font-bold text-gray-900 text-lg">180mg/dL</span>
            </div>
            <div className="bg-white p-3 rounded-xl border flex flex-col items-center shadow-sm">
                <Droplet className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-xs text-gray-500 uppercase font-bold">Glicemia</span>
                <span className="font-bold text-gray-900 text-lg">92mg/dL</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6">
                <AdherenceCalendar />
                
                <Card>
                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 flex justify-between">
                        Conquistas
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center">
                            <Trophy className="w-3 h-3 mr-1" /> Master
                        </span>
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Sequência Atual</span>
                            <span className="font-bold text-xl text-green-600">12 dias 🔥</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Melhor Sequência</span>
                            <span className="font-bold text-gray-900">45 dias</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Total de Pontos</span>
                            <span className="font-bold text-yellow-600">1,250 XP</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="relative overflow-hidden">
                    {isStudent && (
                        <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                            <Lock className="w-3 h-3" /> Edição restrita ao Nutri
                        </div>
                    )}
                    <h3 className="font-bold text-gray-900 mb-1">Metas Nutricionais</h3>
                    <p className="text-xs text-gray-400 mb-4">Última alteração: 20/10/2023 por Dra. Ana</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Calorias (kcal)" defaultValue={user.nutrition?.caloriesTarget} type="number" readOnly={isStudent} />
                        <Input label="Proteína (g)" defaultValue={user.nutrition?.proteinTarget} type="number" readOnly={isStudent} />
                        <Input label="Carbo (g)" defaultValue={user.nutrition?.carbsTarget} type="number" readOnly={isStudent} />
                        <Input label="Gordura (g)" defaultValue="60" type="number" readOnly={isStudent} />
                    </div>
                    
                    <h4 className="font-bold text-gray-800 mb-2 text-sm">Micronutrientes</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Ferro (mg)" defaultValue="18" type="number" readOnly={isStudent} />
                        <Input label="Vitamina C (mg)" defaultValue="90" type="number" readOnly={isStudent} />
                    </div>
                </Card>
            </div>
        </div>
    </div>
    );
};

export default Profile;
