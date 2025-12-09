// src/utils/mockData.js

// Estrutura de dados para um Aluno
const createStudentData = (id, name, email, goal, caloriesTarget, proteinTarget, carbsTarget) => ({
    uid: `student-${id}`,
    name: name,
    email: email,
    role: 'student',
    gamification: {
        totalPoints: Math.floor(Math.random() * 2000) + 500,
        streak: Math.floor(Math.random() * 20),
        bestStreak: Math.floor(Math.random() * 50)
    },
    nutrition: {
        goal: goal,
        caloriesTarget: caloriesTarget,
        proteinTarget: proteinTarget,
        carbsTarget: carbsTarget,
        leanMass: 0,
        fatLost: 0,
    },
    mealPlan: {
        'breakfast': { name: 'Café da Manhã', time: '08:00', items: [{ food: 'Ovos mexidos', weight: 100, cals: 150, prot: 12, carb: 1 }, { food: 'Tapioca', weight: 50, cals: 150, prot: 1, carb: 35 }], totalCals: 300, totalProt: 13, totalCarb: 36 },
        'lunch': { name: 'Almoço', time: '12:30', items: [{ food: 'Frango grelhado', weight: 150, cals: 250, prot: 40, carb: 0 }, { food: 'Arroz integral', weight: 100, cals: 120, prot: 2, carb: 25 }, { food: 'Brócolis', weight: 100, cals: 30, prot: 3, carb: 5 }], totalCals: 400, totalProt: 45, totalCarb: 30 },
        'afternoon_snack': { name: 'Lanche da Tarde', time: '16:00', items: [{ food: 'Iogurte natural', weight: 170, cals: 100, prot: 6, carb: 10 }, { food: 'Whey Protein', weight: 30, cals: 120, prot: 24, carb: 2 }], totalCals: 220, totalProt: 30, totalCarb: 12 },
        'dinner': { name: 'Jantar', time: '20:00', items: [{ food: 'Salada completa com Atum', weight: 300, cals: 300, prot: 28, carb: 10 }], totalCals: 300, totalProt: 28, totalCarb: 10 },
        'supper': { name: 'Ceia', time: '22:00', items: [{ food: 'Caseína', weight: 30, cals: 120, prot: 24, carb: 2 }], totalCals: 120, totalProt: 24, totalCarb: 2 },
    },
    // Dados históricos para o Dashboard do Nutricionista
    history: {
        // Dados de 30 dias (mock)
        dailySummary: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateString = date.toISOString().split('T')[0];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const mealsCompleted = isWeekend ? (Math.random() > 0.3 ? 4 : 2) : 4;
            const totalMeals = 4;
            const calsConsumed = mealsCompleted === 4 ? caloriesTarget + Math.floor(Math.random() * 200) : caloriesTarget - Math.floor(Math.random() * 300);
            const calsBurned = Math.floor(Math.random() * 500);
            const protConsumed = Math.floor(proteinTarget * (calsConsumed / caloriesTarget));
            const carbConsumed = Math.floor(carbsTarget * (calsConsumed / caloriesTarget));

            let extraFood = [];
            if (isWeekend && Math.random() > 0.5) {
                extraFood.push({ food: 'Pizza', cals: 400, prot: 20, carb: 40 });
            } else if (Math.random() > 0.8) {
                extraFood.push({ food: 'Barra de Chocolate', cals: 250, prot: 5, carb: 30 });
            }

            return { date: dateString, mealsCompleted, totalMeals, calsConsumed, calsBurned, calsTarget: caloriesTarget, protConsumed, carbConsumed, extraFood };
        }),
        // Dados de atividades físicas (mock)
        activities: [
            { date: '2025-11-23', type: 'Corrida', duration: 30, calories: 343 },
            { date: '2025-11-25', type: 'Musculação', duration: 60, calories: 420 },
            { date: '2025-11-27', type: 'Ciclismo', duration: 45, calories: 394 },
            { date: '2025-11-28', type: 'Natação', duration: 30, calories: 280 },
        ]
    }
});

// Lista de Alunos
export const MOCK_STUDENTS = [
    createStudentData(1, 'Ana Silva', 'ana@test.com', 'Hipertrofia', 2500, 180, 300),
    createStudentData(2, 'Bruno Costa', 'bruno@test.com', 'Perda de Peso', 1800, 120, 200),
    createStudentData(3, 'Carla Mendes', 'carla@test.com', 'Manutenção', 2200, 150, 250),
    createStudentData(4, 'Daniel Pereira', 'daniel@test.com', 'Hipertrofia', 3000, 220, 400),
];

// Estrutura de dados para o Nutricionista
export const MOCK_NUTRITIONIST = {
    uid: 'nutri-123',
    name: 'Dra. Ana',
    role: 'nutritionist',
    gamification: { totalPoints: 5000, streak: 50, bestStreak: 100 },
    students: [],
};

// Receitas
export const MOCK_RECIPES = [
    { id: 1, title: 'Omelete de Espinafre', description: 'Rica em proteína e ferro.', likes: 120, author: 'Chef IA ✨', category: 'lunch', ingredients: ['3 Ovos', '50g Espinafre', 'Sal'], instructions: ['Bata os ovos', 'Misture o espinafre', 'Frite'] },
    { id: 2, title: 'Shake Pós-Treino', description: 'Recuperação muscular rápida.', likes: 60, author: 'Eu', category: 'pre_workout', ingredients: ['Whey Protein', 'Banana', 'Água'], instructions: ['Bata tudo'] },
    { id: 3, title: 'Salada de Frango', description: 'Leve e refrescante.', likes: 30, author: 'Dra. Ana', category: 'dinner', ingredients: ['Frango desfiado', 'Alface', 'Tomate'], instructions: ['Misture tudo'] },
];

// Usuário Padrão (Aluno)
export const DEFAULT_USER = {
    ...MOCK_STUDENTS[0],
    likedRecipes: [1],
    email: 'aluno@test.com',
    password: '123456'
};

// Usuário Nutricionista
export const NUTRITIONIST_USER = {
    ...MOCK_NUTRITIONIST,
    email: 'nutri@test.com',
    password: '123456'
};

// Função para obter todos os alunos
export const getAllAvailableStudents = () => MOCK_STUDENTS;