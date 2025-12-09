import React, { useContext, useState } from 'react';
import { DataContext } from '../utils/contexts';
import { subDays, format } from 'date-fns'; // Importando funções de data para manipulação de período
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Activity, UtensilsCrossed, ChevronRight, Plus, Search } from 'lucide-react';
import StudentDetailPage from './StudentDetailPage';
import StudentRegistrationPage from './StudentRegistrationPage';

// Função auxiliar para filtrar os dados de histórico com base no período selecionado
const filterHistoryByPeriod = (history, periodDays) => {
    if (!history || !history.dailySummary) return { dailySummary: [], activities: [] };

    const startDate = subDays(new Date(), periodDays - 1).toISOString().split('T')[0];

    const filteredSummary = history.dailySummary.filter(day => day.date >= startDate);
    const filteredActivities = history.activities.filter(activity => activity.date >= startDate);

    return { dailySummary: filteredSummary, activities: filteredActivities };
};

const StudentCard = ({ student, onSelect, periodDays }) => {
    const filteredHistory = filterHistoryByPeriod(student.history, periodDays);
    const totalDays = filteredHistory.dailySummary.length;

    const totalMeals = filteredHistory.dailySummary.reduce((acc, day) => acc + day.totalMeals, 0) || 0;
    const completedMeals = filteredHistory.dailySummary.reduce((acc, day) => acc + day.mealsCompleted, 0) || 0;
    const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

    const totalCalsConsumed = filteredHistory.dailySummary.reduce((acc, day) => acc + day.calsConsumed, 0) || 0;
    const totalCalsBurned = filteredHistory.dailySummary.reduce((acc, day) => acc + day.calsBurned, 0) || 0;
    const netCals = totalCalsConsumed - totalCalsBurned;
    const targetCals = (student.nutrition?.caloriesTarget || 2000) * totalDays;
    const calDifference = netCals - targetCals;

    const isPositiveTrend = calDifference < 0; // Déficit é positivo para perda de peso, Superávit para ganho. Assumindo que a meta é geralmente um déficit ou superávit controlado.

    const totalActivities = filteredHistory.activities.length;

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(student)}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" /> {student.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Meta: {student.nutrition?.goal}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t border-b py-3 my-3">
                <div>
                    <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                    <p className="text-xs text-gray-500">Refeicoes Concluidas</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-orange-600">{totalCalsBurned} kcal</p>
                    <p className="text-xs text-gray-500">Total Queimado</p>
                </div>
                <div>
                    <p className={`text-2xl font-bold ${isPositiveTrend ? 'text-blue-600' : 'text-red-600'}`}>
                        {calDifference > 0 ? `+${calDifference}` : calDifference}
                    </p>
                    <p className="text-xs text-gray-500">Balanco Calorico</p>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <UtensilsCrossed className="w-4 h-4" /> {completedMeals}/{totalMeals} Refeicoes
                </span>
    <span className="flex items-center gap-1">
        <Activity className="w-4 h-4" /> {totalActivities} Atividades
    </span>
            </div>
        </Card>
    );
};

    const PERIOD_OPTIONS = [
        { label: 'Últimos 7 dias', value: 7 },
        { label: 'Últimos 15 dias', value: 15 },
        { label: 'Últimos 30 dias', value: 30 },
        { label: 'Todo o Período', value: 365 }, // Valor grande para simular "todo o período"
    ];

    const StudentsPage = () => {
    const { students } = useContext(DataContext);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showRegistration, setShowRegistration] = useState(false);
    const [periodDays, setPeriodDays] = useState(30); // Padrão: 30 dias
    const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showRegistration) {
        return <StudentRegistrationPage onBack={() => setShowRegistration(false)} />;
    }

    if (selectedStudent) {
        return <StudentDetailPage student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meus Alunos</h1>
                    <p className="text-gray-600 mt-1">Acompanhe o progresso e o comportamento alimentar de seus alunos.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar aluno por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-64"
                        />
                    </div>
                    <select
                        value={periodDays}
                        onChange={(e) => setPeriodDays(parseInt(e.target.value))}
                        className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                        {PERIOD_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <Button onClick={() => setShowRegistration(true)} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Registrar Aluno
                    </Button>
                </div>
            </div>
            
            {students.length === 0 ? (
                <Card className="text-center py-12">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">Nenhum aluno registrado</p>
                    <p className="text-sm text-gray-500 mt-1">Clique no botao acima para registrar seu primeiro aluno</p>
                </Card>
	            ) : (
	                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
	                    {filteredStudents.map(student => (
	                        <StudentCard key={student.uid} student={student} onSelect={setSelectedStudent} periodDays={periodDays} />
	                    ))}
	                    {filteredStudents.length === 0 && (
	                        <Card className="text-center py-12 lg:col-span-3">
	                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
	                            <p className="text-gray-600 font-semibold">Nenhum aluno encontrado com o nome "{searchTerm}"</p>
	                            <p className="text-sm text-gray-500 mt-1">Tente um termo de busca diferente.</p>
	                        </Card>
	                    )}
	                </div>
	            )}
        </div>
    );
};

export default StudentsPage;
