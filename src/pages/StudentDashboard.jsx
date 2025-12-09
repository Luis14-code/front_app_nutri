import React, { useState, useContext, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChefHat, Trophy, Activity, Sparkles, Loader2, Clock, CheckCircle2, Flame, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../utils/contexts';
import { MOCK_STUDENTS } from '../utils/mockData'; // Importar MOCK_STUDENTS para obter o plano alimentar inicial, se necessário
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ActivityModal from '../components/ui/ActivityModal';
import { analyzeFoodText } from '../utils/gemini';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date()); // Data atual, vinculada ao dispositivo
  
  // Função para transformar o mealPlan em uma lista de refeições
  const getInitialMeals = (mealPlan) => {
    if (!mealPlan) {
      // Se não houver plano alimentar, retorna um mock simples ou vazio
      return [
        { id: 1, name: 'Café da Manhã', time: '08:00', food: 'Refeição Padrão', cals: 350, prot: 20, carb: 30, done: false, isPlan: false },
        { id: 2, name: 'Almoço', time: '12:30', food: 'Refeição Padrão', cals: 500, prot: 35, carb: 45, done: false, isPlan: false },
      ];
    }

    // Transforma o objeto mealPlan em um array de refeições
    return Object.keys(mealPlan)
      .filter(key => mealPlan[key].items && mealPlan[key].items.length > 0) // Filtra refeições vazias
      .map((key, index) => {
        const meal = mealPlan[key];
        const foodDescription = meal.items.map(item => `${item.food} (${item.weight}g)`).join(', ');
        return {
          id: index + 1,
          key: key,
          name: meal.name,
          time: meal.time,
          food: foodDescription,
          cals: meal.totalCals,
          prot: meal.totalProt,
          carb: meal.totalCarb,
          done: false, // Começa como não feito
          isPlan: true, // Indica que é do plano alimentar
          details: meal.items, // Detalhes para exibição (opcional)
        };
      });
  };

  // Encontra o aluno atual no mockData para obter o mealPlan (simulação de estado global)
  // Em uma aplicação real, o 'user' já teria o 'mealPlan' atualizado do estado global.
  // Como o 'user' no AuthContext é um mock, precisamos buscar o dado mais atualizado.
  const currentStudentData = MOCK_STUDENTS.find(s => s.uid === user.uid) || user;
  const initialMealPlan = currentStudentData.mealPlan;

  const [meals, setMeals] = useState(() => getInitialMeals(initialMealPlan));

  const [activities, setActivities] = useState(user.history?.activities || []); // Usando histórico do mockData
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const [quickLogText, setQuickLogText] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Cálculo dinâmico de totais (incluindo apenas refeições marcadas como "done")
  const totalCals = meals.filter(m => m.done).reduce((acc, m) => acc + m.cals, 0);
  const totalProt = meals.filter(m => m.done).reduce((acc, m) => acc + m.prot, 0);
  const totalCarb = meals.filter(m => m.done).reduce((acc, m) => acc + m.carb, 0);
  const totalCalsBurned = activities.reduce((acc, a) => acc + a.calories, 0);
  
  const goalCals = user?.nutrition?.caloriesTarget || 2000;

  // Cálculo do Déficit/Superávit Calórico
  const netCals = totalCals - totalCalsBurned;
  const deficit = goalCals - netCals;
  const isDeficit = deficit > 0;
  const deficitStatus = isDeficit 
    ? `Déficit de ${Math.abs(deficit)} kcal` 
    : `Superávit de ${Math.abs(deficit)} kcal`;

  const deficitGoal = user?.nutrition?.goal === 'Perda de Peso';
  const deficitMessage = deficitGoal 
    ? (isDeficit ? 'Parabéns! Você está no caminho certo para o déficit calórico.' : 'Atenção: Você ultrapassou o limite calórico para perda de peso.')
    : (isDeficit ? 'Atenção: Você está em déficit calórico, ajuste suas refeições.' : 'Parabéns! Você está no caminho certo para o superávit calórico.');
  const goalProt = user?.nutrition?.proteinTarget || 150;
  const goalCarb = user?.nutrition?.carbsTarget || 200;

  const completedCount = meals.filter(m => m.done).length;
  const dailyPoints = completedCount * 10;
  const allCompletedBonus = completedCount === meals.length ? 50 : 0;
  const totalDailyPoints = dailyPoints + allCompletedBonus;

  const toggleMeal = (id) => {
    setMeals(meals.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  const handleQuickLog = async () => {
    if (!quickLogText.trim()) return;
    setIsLogging(true);
    
    const result = await analyzeFoodText(quickLogText);
    
    if (result) {
      const newMeal = {
        id: Date.now(),
        name: 'Registro Extra',
        time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        food: result.food_name,
        cals: result.calories,
        prot: result.protein,
        carb: result.carbs,
        done: true, // Registros extras são sempre considerados "feitos"
        isExtra: true // Flag para identificar registros extras
      };
      setMeals([...meals, newMeal]);
      setQuickLogText('');
    } else {
      alert("Não foi possível analisar o alimento. Tente novamente.");
    }
    setIsLogging(false);
  };

  const handleSaveActivity = (activity) => {
    setActivities([...activities, activity]);
  };

  const nextMeal = meals.find(m => !m.done);

  // Lógica do Calendário
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });

  const dailySummaryMap = useMemo(() => {
    const map = new Map();
    user.history?.dailySummary?.forEach(day => {
      map.set(day.date, day);
    });
    return map;
  }, [user.history?.dailySummary]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getDayStatus = (day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const summary = dailySummaryMap.get(dateString);
    
    if (!summary) return 'empty'; // Sem dados
    if (summary.mealsCompleted === summary.totalMeals) return 'completed'; // Tudo feito
    if (summary.mealsCompleted > 0) return 'partial'; // Parcialmente feito
    return 'missed'; // Nada feito
  };
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Bom dia, {user?.name}! ☀️</h1>
            <p className="text-green-100 text-sm md:text-base">
              Você já garantiu <span className="font-bold text-white">{totalDailyPoints} pontos</span> hoje. 
              {allCompletedBonus > 0 ? ' Bônus diário ativado! 🎉' : ' Complete tudo para ganhar bônus!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-300 drop-shadow-sm" />
            <div>
              <p className="text-2xl font-bold leading-none">{(user?.gamification?.totalPoints || 0) + totalDailyPoints}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-80">Pontos Totais</p>
            </div>
          </div>
        </div>
        <ChefHat className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 rotate-12" />
      </div>

	      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
	        <div className="lg:col-span-1 space-y-6">
	          {/* Calendário de Desempenho */}
	          <Card>
	            <div className="flex justify-between items-center mb-4">
	              <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
	                <ChevronLeft className="w-5 h-5" />
	              </button>
	              <h3 className="text-lg font-bold text-gray-900">
	                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
	              </h3>
	              <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
	                <ChevronRight className="w-5 h-5" />
	              </button>
	            </div>
	
	            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 mb-2">
	              <span>Dom</span>
	              <span>Seg</span>
	              <span>Ter</span>
	              <span>Qua</span>
	              <span>Qui</span>
	              <span>Sex</span>
	              <span>Sáb</span>
	            </div>
	
	            <div className="grid grid-cols-7 gap-1">
	              {daysInMonth.map((day, index) => {
	                const status = getDayStatus(day);
	                const isCurrentDay = isToday(day);
	                const isFirstDay = isSameDay(day, start);
	
	                let dayClass = 'w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors';
	                let dotClass = 'absolute bottom-0 right-0 w-2 h-2 rounded-full';
	
	                switch (status) {
	                  case 'completed':
	                    dayClass += ' bg-green-500 text-white hover:bg-green-600';
	                    break;
	                  case 'partial':
	                    dayClass += ' bg-yellow-400 text-gray-900 hover:bg-yellow-500';
	                    break;
	                  case 'missed':
	                    dayClass += ' bg-red-500 text-white hover:bg-red-600';
	                    break;
	                  case 'empty':
	                    dayClass += ' text-gray-500 hover:bg-gray-100';
	                    break;
	                }
	
	                if (isCurrentDay) {
	                  dayClass += ' ring-2 ring-blue-500 ring-offset-2';
	                }
	
	                return (
	                  <div 
	                    key={index} 
	                    className={`relative ${isFirstDay ? `col-start-${day.getDay() + 1}` : ''}`}
	                    style={{ gridColumnStart: isFirstDay ? day.getDay() + 1 : 'auto' }}
	                  >
	                    <div className={dayClass}>
	                      {format(day, 'd')}
	                    </div>
	                  </div>
	                );
	              })}
	            </div>
	          </Card>
          <Card className="h-fit">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" /> Progresso Diário
            </h2>
            <ProgressBar label="Calorias" current={totalCals} max={goalCals} unit="kcal" color="bg-orange-400" />
            <ProgressBar label="Proteínas" current={totalProt} max={goalProt} unit="g" color="bg-blue-500" />
            <ProgressBar label="Carboidratos" current={totalCarb} max={goalCarb} unit="g" color="bg-green-500" />
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
               <span>Ferro: 8/18mg</span>
               <span>Vit C: 45/90mg</span>
            </div>
          </Card>

          <Card className="bg-orange-50 border-orange-100">
            <h2 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5" /> Balanço Calórico
            </h2>
            <div className="mb-3 border-b border-orange-200 pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">Consumido (Refeições)</span>
                <span className="text-lg font-bold text-gray-900">{totalCals} kcal</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">Queimado (Atividades)</span>
                <span className="text-lg font-bold text-orange-600">-{totalCalsBurned} kcal</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Balanço Líquido</span>
                <span className={`text-2xl font-bold ${netCals > goalCals ? 'text-red-500' : 'text-green-600'}`}>{netCals} kcal</span>
              </div>
              <p className="text-xs text-gray-500">Meta Diária: {goalCals} kcal</p>
            </div>
            <div className={`p-3 rounded-lg text-sm ${isDeficit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-bold">{deficitStatus}</p>
              <p className="text-xs mt-1">{deficitMessage}</p>
            </div>
            
            {activities.length > 0 && (
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg p-2 border border-orange-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activity.type}</p>
                    <p className="text-xs text-gray-500">{activity.duration} min • {activity.timestamp}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">-{activity.calories} kcal</span>
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-500 pt-2 border-t border-orange-100">
              <p>Total de Calorias Queimadas: <span className="font-bold text-orange-600">{totalCalsBurned} kcal</span></p>
            </div>
              </div>
            )}
            
            <Button 
              onClick={() => setIsActivityModalOpen(true)} 
              variant="outline" 
              className="w-full text-sm h-9 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar Atividade
            </Button>
          </Card>

          <Card className="bg-indigo-50 border-indigo-100">
             <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Registro Inteligente ✨
             </h3>
             <div className="flex gap-2 mb-2">
                <input 
                  value={quickLogText}
                  onChange={(e) => setQuickLogText(e.target.value)}
                  placeholder="Ex: Comi 1 maçã e 30g de nozes"
                  className="flex-1 text-sm p-2 rounded border border-indigo-200 focus:outline-none focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickLog()}
                />
             </div>
             <Button onClick={handleQuickLog} disabled={isLogging || !quickLogText} variant="ai" className="w-full text-xs h-8">
                {isLogging ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Analisar e Adicionar'}
             </Button>
          </Card>

          {nextMeal ? (
             <Card className="bg-blue-50 border-blue-100">
               <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                 <Clock className="w-4 h-4" /> Próxima Refeição ({nextMeal.time})
               </h3>
               <p className="font-bold text-gray-900 text-lg mb-1">{nextMeal.food}</p>
               <p className="text-sm text-gray-600 mb-3">{nextMeal.cals} kcal • Sugestão do Nutri</p>
               <Button onClick={() => toggleMeal(nextMeal.id)} className="w-full text-sm h-8">
                 Marcar como Feito Agora
               </Button>
             </Card>
          ) : (
            <Card className="bg-green-50 border-green-100 flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800">Tudo Pronto!</h3>
              <p className="text-sm text-green-600">Você finalizou todas as refeições de hoje.</p>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Refeições do Dia</h2>
	              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Hoje, {format(new Date(), 'dd/MM/yyyy')}</span>
           </div>
           
           <div className="space-y-3">
             {meals.map((meal) => (
               <div 
                 key={meal.id}
                 onClick={() => toggleMeal(meal.id)}
                 className={`group relative flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                   meal.done 
                   ? 'bg-green-50 border-green-200 opacity-75' 
                   : 'bg-white border-gray-100 hover:border-green-300 hover:shadow-md'
                 }`}
               >
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                   meal.done ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-green-400'
                 }`}>
                   {meal.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                 </div>
                 
                 <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <div>
	                       <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${meal.done ? 'text-green-700' : 'text-gray-500'}`}>
	                         {meal.name} • {meal.time}
	                         {meal.isPlan && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-200 text-green-800">Plano Nutri</span>}
	                       </p>
	                       <h3 className={`font-bold text-lg ${meal.done ? 'text-green-900 line-through decoration-green-900/30' : 'text-gray-900'}`}>
	                         {meal.food}
	                       </h3>
	                       {meal.isPlan && (
	                         <div className="mt-1 text-xs text-gray-500 space-y-0.5">
	                           {meal.details.map((item, i) => (
	                             <p key={i} className="flex justify-between">
	                               <span>{item.food}</span>
	                               <span className="font-semibold">{item.weight}g</span>
	                             </p>
	                           ))}
	                         </div>
	                       )}
                     </div>
	                     <span className={`text-sm font-bold ${meal.done ? 'text-green-600' : 'text-gray-400'}`}>
	                       {meal.cals} kcal
	                     </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <ActivityModal 
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={handleSaveActivity}
      />
    </div>
  );
};

export default StudentDashboard;
