import React, { useState, useContext, useMemo } from 'react';
import { subDays } from 'date-fns'; // Importando subDays para filtrar o histórico
import { User, Edit2, Save, X, TrendingUp, Calendar, AlertTriangle, MessageSquare, FileText, Utensils } from 'lucide-react';
import { AuthContext, DataContext } from '../utils/contexts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MealPlanEditor from '../components/ui/MealPlanEditor';
import ProgressBar from '../components/ui/ProgressBar';
import { generateStudentReport } from '../utils/gemini';

const GOAL_OPTIONS = [
  'Perda de Gordura',
  'Ganho de Massa Muscular',
  'Hipertrofia',
  'Ganho de Desempenho nos Estudos',
  'Manutenção',
  'Definição Muscular',
];

const StudentDetailPage = ({ student, onBack }) => {
  const { updateStudentMeta, updateStudentMealPlan } = useContext(AuthContext);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isEditingMealPlan, setIsEditingMealPlan] = useState(false);
  const [report, setReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [periodDays, setPeriodDays] = useState(30); // Estado para o período selecionado (padrão 30 dias)

  const PERIOD_OPTIONS = [
    { label: 'Últimos 7 dias', value: 7 },
    { label: 'Últimos 15 dias', value: 15 },
    { label: 'Últimos 30 dias', value: 30 },
    { label: 'Todo o Período', value: 365 },
  ];

  // Função auxiliar para filtrar os dados de histórico com base no período selecionado
  const filterHistoryByPeriod = (history, days) => {
    if (!history || !history.dailySummary) return { dailySummary: [], activities: [] };

    const startDate = subDays(new Date(), days - 1).toISOString().split('T')[0];

    const filteredSummary = history.dailySummary.filter(day => day.date >= startDate);
    const filteredActivities = history.activities.filter(activity => activity.date >= startDate);

    return { dailySummary: filteredSummary, activities: filteredActivities };
  };

  const filteredHistory = useMemo(() => filterHistoryByPeriod(student.history, periodDays), [student.history, periodDays]);
  const totalDays = filteredHistory.dailySummary.length;
  
  const [editedMeta, setEditedMeta] = useState({
    leanMass: student.nutrition?.leanMass || 0,
    fatLost: student.nutrition?.fatLost || 0,
    goal: student.nutrition?.goal || 'Manutenção',
    caloriesTarget: student.nutrition?.caloriesTarget || 2000,
    proteinTarget: student.nutrition?.proteinTarget || 150,
    carbsTarget: student.nutrition?.carbsTarget || 200,
  });

  const handleSaveMealPlan = (newMealPlan) => {
    updateStudentMealPlan(student.uid, newMealPlan);
    setIsEditingMealPlan(false);
  };

  // Cálculos de desempenho (usando dados filtrados)
  const totalMeals = filteredHistory.dailySummary.reduce((acc, day) => acc + day.totalMeals, 0) || 0;
  const completedMeals = filteredHistory.dailySummary.reduce((acc, day) => acc + day.mealsCompleted, 0) || 0;
  const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

  const totalCalsConsumed = filteredHistory.dailySummary.reduce((acc, day) => acc + day.calsConsumed, 0) || 0;
  const totalCalsBurned = filteredHistory.dailySummary.reduce((acc, day) => acc + day.calsBurned, 0) || 0;
  const netCals = totalCalsConsumed - totalCalsBurned;
  const targetCals = (student.nutrition?.caloriesTarget || 2000) * totalDays;
  const calDifference = netCals - targetCals;

  const daysOverTarget = filteredHistory.dailySummary.filter(day => day.calsConsumed > day.calsTarget).length || 0;
  
  const totalExtraFoodCals = filteredHistory.dailySummary.reduce((acc, day) => {
    return acc + (day.extraFood?.reduce((sum, food) => sum + food.cals, 0) || 0);
  }, 0) || 0;

  // Identificar refeições que mais erram
  const mealErrors = {};
  filteredHistory.dailySummary.forEach(day => {
    day.extraFood?.forEach(food => {
      mealErrors[food.food] = (mealErrors[food.food] || 0) + 1;
    });
  });

  const topErrors = Object.entries(mealErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleSaveMeta = () => {
    updateStudentMeta(student.uid, editedMeta);
    setIsEditingMeta(false);
  };

  const generateReport = async () => {
    setIsLoadingReport(true);
    const generatedReport = await generateStudentReport(student);
    setReport(generatedReport);
    setIsLoadingReport(false);
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="mb-4">
        ← Voltar para Meus Alunos
      </Button>

      {isEditingMealPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <MealPlanEditor 
              initialMealPlan={student.mealPlan}
              onSave={handleSaveMealPlan}
              onCancel={() => setIsEditingMealPlan(false)}
            />
          </div>
        </div>
      )}

      {/* Informações do Aluno */}
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              {student.name}
            </h2>
            <p className="text-sm text-gray-500 mt-2">UID: {student.uid}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsEditingMealPlan(true)}
              variant="outline"
              className="flex items-center gap-2 text-sm h-10"
            >
              <Utensils className="w-4 h-4" /> Plano Alimentar
            </Button>
            <Button 
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              variant={isEditingMeta ? 'outline' : 'default'}
              className="flex items-center gap-2 text-sm h-10"
            >
              {isEditingMeta ? (
                <>
                  <X className="w-4 h-4" /> Cancelar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" /> Editar Metas
                </>
              )}
            </Button>
          </div>
        </div>

        {isEditingMeta ? (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Objetivo</label>
              <select
                value={editedMeta.goal}
                onChange={(e) => setEditedMeta({ ...editedMeta, goal: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {GOAL_OPTIONS.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Massa Magra (kg)</label>
                <input
                  type="number"
                  value={editedMeta.leanMass}
                  onChange={(e) => setEditedMeta({ ...editedMeta, leanMass: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gordura Perdida (kg)</label>
                <input
                  type="number"
                  value={editedMeta.fatLost}
                  onChange={(e) => setEditedMeta({ ...editedMeta, fatLost: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Calorias (kcal)</label>
                <input
                  type="number"
                  value={editedMeta.caloriesTarget}
                  onChange={(e) => setEditedMeta({ ...editedMeta, caloriesTarget: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proteína (g)</label>
                <input
                  type="number"
                  value={editedMeta.proteinTarget}
                  onChange={(e) => setEditedMeta({ ...editedMeta, proteinTarget: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carboidratos (g)</label>
                <input
                  type="number"
                  value={editedMeta.carbsTarget}
                  onChange={(e) => setEditedMeta({ ...editedMeta, carbsTarget: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <Button onClick={handleSaveMeta} className="w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Salvar Alterações
            </Button>
	          </div>
	        ) : (
	          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
	            <div>
	              <p className="text-xs text-gray-500 uppercase font-semibold">Objetivo</p>
	              <p className="text-lg font-bold text-gray-900">{editedMeta.goal}</p>
	            </div>
	            <div>
	              <p className="text-xs text-gray-500 uppercase font-semibold">Massa Magra</p>
	              <p className="text-lg font-bold text-gray-900">{editedMeta.leanMass} kg</p>
	            </div>
	            <div>
	              <p className="text-xs text-gray-500 uppercase font-semibold">Gordura Perdida</p>
	              <p className="text-lg font-bold text-gray-900">{editedMeta.fatLost} kg</p>
	            </div>
	            <div>
	              <p className="text-xs text-gray-500 uppercase font-semibold">Calorias</p>
	              <p className="text-lg font-bold text-gray-900">{editedMeta.caloriesTarget} kcal</p>
	            </div>
	            <div>
	              <p className="text-xs text-gray-500 uppercase font-semibold">Proteína</p>
	              <p className="text-lg font-bold text-gray-900">{editedMeta.proteinTarget}g</p>
	            </div>
	            <div>
	              <p className="text-xs text-gray-500 uppercase font-semibold">Carboidratos</p>
	              <p className="text-lg font-bold text-gray-900">{editedMeta.carbsTarget}g</p>
	            </div>
	          </div>
	        )}
      </Card>

	      {/* Desempenho */}
	      <Card>
	        <div className="flex justify-between items-center mb-4">
	          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
	            <TrendingUp className="w-6 h-6 text-blue-600" /> Desempenho
	          </h3>
	          <select
	            value={periodDays}
	            onChange={(e) => setPeriodDays(parseInt(e.target.value))}
	            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
	          >
	            {PERIOD_OPTIONS.map(option => (
	              <option key={option.value} value={option.value}>{option.label}</option>
	            ))}
	          </select>
	        </div>
	
	        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-semibold">Taxa de Conclusão</p>
            <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
            <p className="text-xs text-green-700 mt-1">{completedMeals}/{totalMeals} refeições</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold">Calorias Extras</p>
            <p className="text-3xl font-bold text-orange-600">{totalExtraFoodCals}</p>
            <p className="text-xs text-orange-700 mt-1">kcal consumidas</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-semibold">Dias Acima da Meta</p>
            <p className="text-3xl font-bold text-red-600">{daysOverTarget}</p>
            <p className="text-xs text-red-700 mt-1">de 30 dias</p>
          </div>

          <div className={`p-4 rounded-lg border ${calDifference < 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-sm font-semibold ${calDifference < 0 ? 'text-green-800' : 'text-red-800'}`}>
              Balanço Calórico
            </p>
            <p className={`text-3xl font-bold ${calDifference < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calDifference > 0 ? '+' : ''}{calDifference}
            </p>
            <p className={`text-xs mt-1 ${calDifference < 0 ? 'text-green-700' : 'text-red-700'}`}>
              kcal no mês
            </p>
          </div>
        </div>

        {/* Refeições que mais erram */}
        {topErrors.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Alimentos que Mais Erram
            </h4>
            <div className="space-y-2">
              {topErrors.map(([food, count]) => (
                <div key={food} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-gray-900 font-medium">{food}</span>
                  <span className="text-yellow-600 font-bold">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

	      {/* Histórico Diário */}
	      <Card>
		        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
		          <Calendar className="w-6 h-6 text-purple-600" /> Histórico Diário ({periodDays} dias)
		        </h3>
		
		        <div className="space-y-2 max-h-96 overflow-y-auto">
		          {filteredHistory.dailySummary.map(day => (
		            <div key={day.date} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
		              <div>
		                <p className="font-semibold text-gray-900">{new Date(day.date).toLocaleDateString('pt-BR')}</p>
		                <p className="text-xs text-gray-500">{day.mealsCompleted}/{day.totalMeals} refeições</p>
		              </div>
		              <div className="text-right">
		                <p className={`font-bold ${day.calsConsumed > day.calsTarget ? 'text-red-600' : 'text-green-600'}`}>
		                  {day.calsConsumed} / {day.calsTarget} kcal
		                </p>
		                <p className="text-xs text-gray-500">Queimado: {day.calsBurned} kcal</p>
		              </div>
		            </div>
		          ))}
		        </div>
	      </Card>

	      {/* Histórico de Atividades Físicas */}
	      <Card>
		        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
		          <TrendingUp className="w-6 h-6 text-orange-600" /> Atividades Físicas ({periodDays} dias)
		        </h3>
		        <div className="space-y-2 max-h-96 overflow-y-auto">
		          {filteredHistory.activities.length > 0 ? (
		            filteredHistory.activities.map((activity, index) => (
		              <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
		                <div>
		                  <p className="font-semibold text-gray-900">{activity.type}</p>
		                  <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString('pt-BR')} • {activity.duration} min</p>
		                </div>
		                <div className="text-right">
		                  <p className="font-bold text-orange-600">-{activity.calories} kcal</p>
		                </div>
		              </div>
		            ))
		          ) : (
		            <p className="text-gray-500">Nenhuma atividade física registrada neste período.</p>
		          )}
		        </div>
	      </Card>
	
	      {/* Análise de Comportamento com IA */}
      <Card>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" /> Análise de Comportamento (IA)
        </h3>

        <Button 
          onClick={generateReport} 
          disabled={isLoadingReport}
          className="w-full mb-4 flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {isLoadingReport ? 'Gerando Análise...' : 'Gerar Análise de Comportamento'}
        </Button>

        {report && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-bold text-indigo-800 mb-3">Relatório Gerado:</h4>
            <p className="text-sm text-indigo-700 whitespace-pre-wrap">{report}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDetailPage;
