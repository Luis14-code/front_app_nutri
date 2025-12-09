// Código limpo e corrigido para o Nutri App
const apiKey = "AIzaSyCxNCq74W9Pulf_Z011tbQ13vvxQ02sqn4"; 

export const generateAIResponse = async (messages, userContext, availableRecipes) => {
  const recipesContext = availableRecipes.map(r =>
    `- ${r.title} (Ingredientes: ${r.ingredients?.join(', ') || 'Variados'})`
  ).join('\n');

  let systemInstruction = `Atue como um Nutricionista Esportivo de Elite, Especialista em Fisiologia e Analista de Comportamento Alimentar.

Sua Missão Principal: Você é a autoridade máxima em recomposição corporal. Além de criar planos, sua função crítica é auditar o desempenho do aluno. Você não aceita desculpas, você analisa dados. Seu objetivo é identificar gargalos na execução, corrigir rotas e garantir que a meta (hipertrofia ou perda de gordura) seja atingida através da constância e ajuste fino.

Módulo 1: Criação de Protocolo (Setup Inicial)
(Mantenha a abordagem baseada em evidências: TMB, Macros, Anamnese obrigatória antes de começar).

Módulo 2: Auditoria de Desempenho e Comportamento (O Diferencial) Ao receber os dados do aluno (logs de refeições, registros de treino, relatórios de app), você deve processar as seguintes análises:

Análise de Aderência e Padrão de Erro:
- Calcule a % de refeições completas vs. perdidas.
- Identifique o "Ponto de Falha": Onde o aluno erra mais? (Ex: Fim de semana? Lanche da tarde por ansiedade? Pular o café da manhã?).
- Cruze os dias de erro na dieta com os dias de treino. (Ele come pior nos dias de descanso? Ele treina mal quando come pouco carboidrato?).

Você é um nutricionista especialista e chef de cozinha renomado do app NutriLife.

  DADOS DO USUÁRIO:
  - Nome: ${userContext.name}
  - Objetivo: ${userContext.goal}
  - Metas: ${userContext.caloriesTarget}kcal, Proteína ${userContext.proteinTarget}g, Carbo ${userContext.carbsTarget}g.
  - Restrições: ${userContext.restrictions}

  RECEITAS NO BANCO DE DADOS:
  ${recipesContext}

  SUAS FUNÇÕES:
  1. Adaptar receitas: Se o usuário disser "Tenho frango e batata", procure uma receita parecida no banco e sugira adaptações.
  2. Imagens: Quando sugerir uma receita, inclua sempre a tag [Imagem: Nome da Receita] para que o app mostre a foto.
  3. Seja prático: Dê as quantidades exatas baseadas nos macros do usuário.
  `;

  const formattedContents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error("Erro AI:", error);
    return "Estou tendo dificuldades técnicas no momento.";
  }
};

// Função mock para análise de texto de alimentos
export const analyzeFoodText = async (text) => {
    // Simulação de chamada à API Gemini para análise de alimentos
    // Retorna um objeto com nutrientes
    
    // Lógica de simulação simples
    if (text.toLowerCase().includes('maçã') || text.toLowerCase().includes('fruta')) {
        return { food_name: 'Maçã', calories: 95, protein: 0, carbs: 25 };
    }
    if (text.toLowerCase().includes('barra de chocolate')) {
        return { food_name: 'Barra de Chocolate', calories: 250, protein: 5, carbs: 30 };
    }
    if (text.toLowerCase().includes('refrigerante')) {
        return { food_name: 'Refrigerante', calories: 150, protein: 0, carbs: 40 };
    }
    if (text.toLowerCase().includes('pizza')) {
        return { food_name: 'Pizza (fatia)', calories: 400, protein: 20, carbs: 40 };
    }
    
    // Retorno padrão para outros alimentos
    return { food_name: text, calories: 100, protein: 10, carbs: 10 };
};

// Nova função mock para gerar relatório de comportamento do aluno
export const generateStudentReport = async (student) => {
    // Simulação de chamada à API Gemini para análise de comportamento
    
    const dailySummary = student.history.dailySummary;
    const totalDays = dailySummary.length;
    const totalMeals = dailySummary.reduce((acc, day) => acc + day.totalMeals, 0);
    const completedMeals = dailySummary.reduce((acc, day) => acc + day.mealsCompleted, 0);
    const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

    // Análise de Ponto de Falha (Fim de Semana)
    const weekendDays = dailySummary.filter(day => new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6);
    const weekendMeals = weekendDays.reduce((acc, day) => acc + day.totalMeals, 0);
    const weekendCompleted = weekendDays.reduce((acc, day) => acc + day.mealsCompleted, 0);
    const weekendCompletionRate = weekendMeals > 0 ? Math.round((weekendCompleted / weekendMeals) * 100) : 100;

    // Análise de Ponto de Falha (Refeições Extras)
    const extraFoodCount = dailySummary.reduce((acc, day) => acc + day.extraFood.length, 0);
    const totalExtraFoodCals = dailySummary.reduce((acc, day) => {
        return acc + day.extraFood.reduce((sum, food) => sum + food.cals, 0);
    }, 0);

    // Análise de Cruzamento (Erro na Dieta vs. Treino) - Mock Simples
    const daysWithExtraFood = dailySummary.filter(day => day.extraFood.length > 0).map(day => day.date);
    const daysWithActivity = student.history.activities.map(act => act.date);
    const extraFoodOnTrainingDays = daysWithExtraFood.filter(date => daysWithActivity.includes(date)).length;
    
    // Análise de Tendência
    const calDifference = dailySummary.reduce((acc, day) => acc + (day.calsConsumed - day.calsTarget), 0);
    const isPositiveTrend = calDifference < 0; // Déficit calórico (bom para perda de peso)

    let report = `Análise de Desempenho para ${student.name} (Meta: ${student.nutrition.goal}):\n\n`;
    
    report += `1. Aderência Geral:\n`;
    report += `- Taxa de Conclusão de Refeições: ${completionRate}% (${completedMeals} de ${totalMeals})\n`;
    report += `- Balanço Calórico Total: ${calDifference > 0 ? '+' : ''}${calDifference} kcal (nos últimos ${totalDays} dias)\n`;
    report += `- Massa Magra Ganhada: ${student.nutrition.leanMass} kg\n`;
    report += `- Gordura Perdida: ${student.nutrition.fatLost} kg\n\n`;

    report += `2. Padrão de Erro (Auditoria):\n`;
    report += `- Aderência no Fim de Semana: ${weekendCompletionRate}% (Ponto de Falha? ${weekendCompletionRate < completionRate ? 'SIM' : 'NÃO'})\n`;
    report += `- Refeições Extras (Junk Food): ${extraFoodCount} registros (${totalExtraFoodCals} kcal)\n`;
    report += `- Erro vs. Treino: ${extraFoodOnTrainingDays} dias de "erro" coincidiram com dias de treino.\n\n`;

    report += `3. Análise e Ajuste Fino (Nutricionista Esportivo de Elite):\n`;

    if (student.nutrition.goal === 'Perda de Peso' && calDifference > 0) {
        report += "❌ **Alerta Vermelho:** A meta é Perda de Peso, mas o balanço calórico está positivo. O aluno está comendo mais do que o planejado.\n";
        report += `   - **Ajuste:** Focar na redução de ${totalExtraFoodCals} kcal de refeições extras. Sugerir substituições de lanches da tarde (ponto de falha comum) por opções de alto volume e baixa caloria.\n`;
    } else if (student.nutrition.goal === 'Hipertrofia' && calDifference < 0) {
        report += "❌ **Alerta Amarelo:** A meta é Hipertrofia, mas o balanço calórico está negativo. O aluno não está consumindo calorias suficientes para o ganho de massa.\n";
        report += `   - **Ajuste:** Aumentar a densidade calórica das refeições principais. Sugerir a inclusão de shakes calóricos (com carboidratos e proteínas) nos dias de treino para otimizar a recuperação.\n`;
    } else if (weekendCompletionRate < completionRate - 10) {
        report += "⚠️ **Ponto de Falha Identificado:** Aderência cai drasticamente no fim de semana. Isso sabota a constância.\n";
        report += `   - **Ajuste:** Implementar uma 'Refeição Livre Estratégica' no fim de semana, mantendo as outras refeições do plano. Focar em estratégias de controle de ansiedade/socialização.\n`;
    } else {
        report += "✅ **Constância e Execução:** O aluno está com boa aderência e no caminho certo para a meta. Manter o plano e monitorar os resultados de recomposição corporal (massa magra/gordura).\n";
    }

    return report;
};
