import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Clock, Utensils, Save, X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const MEAL_TYPES = [
  { key: 'breakfast', name: 'Café da Manhã' },
  { key: 'morning_snack', name: 'Lanche da Manhã' },
  { key: 'lunch', name: 'Almoço' },
  { key: 'afternoon_snack', name: 'Lanche da Tarde' },
  { key: 'dinner', name: 'Jantar' },
  { key: 'supper', name: 'Ceia' },
];

const MealPlanEditor = ({ initialMealPlan, onSave, onCancel }) => {
  const [mealPlan, setMealPlan] = useState(() => {
    // Inicializa o estado com o plano alimentar existente ou uma estrutura vazia
    const initial = initialMealPlan || {};
    const defaultPlan = {};
    MEAL_TYPES.forEach(meal => {
      defaultPlan[meal.key] = initial[meal.key] || {
        name: meal.name,
        time: initial[meal.key]?.time || '',
        items: initial[meal.key]?.items || [],
      };
    });
    return defaultPlan;
  });
  const [activeTab, setActiveTab] = useState(MEAL_TYPES[0].key);

  const calculateTotals = (items) => {
    return items.reduce((acc, item) => {
      acc.totalCals += item.cals || 0;
      acc.totalProt += item.prot || 0;
      acc.totalCarb += item.carb || 0;
      return acc;
    }, { totalCals: 0, totalProt: 0, totalCarb: 0 });
  };

  const handleAddItem = () => {
    const newMealPlan = { ...mealPlan };
    newMealPlan[activeTab].items.push({ food: '', weight: 0, cals: 0, prot: 0, carb: 0 });
    setMealPlan(newMealPlan);
  };

  const handleRemoveItem = (index) => {
    const newMealPlan = { ...mealPlan };
    newMealPlan[activeTab].items.splice(index, 1);
    setMealPlan(newMealPlan);
  };

  const handleItemChange = (index, field, value) => {
    const newMealPlan = { ...mealPlan };
    const item = newMealPlan[activeTab].items[index];
    
    if (['weight', 'cals', 'prot', 'carb'].includes(field)) {
      item[field] = parseFloat(value) || 0;
    } else {
      item[field] = value;
    }
    
    setMealPlan(newMealPlan);
  };

  const handleTimeChange = (time) => {
    const newMealPlan = { ...mealPlan };
    newMealPlan[activeTab].time = time;
    setMealPlan(newMealPlan);
  };

  const mealTotals = useMemo(() => {
    const totals = {};
    Object.keys(mealPlan).forEach(key => {
      totals[key] = calculateTotals(mealPlan[key].items);
    });
    return totals;
  }, [mealPlan]);

  const currentMeal = mealPlan[activeTab];
  const currentTotals = mealTotals[activeTab];

  const handleSave = () => {
    // Formata o plano alimentar para o formato final, incluindo os totais calculados
    const finalMealPlan = {};
    Object.keys(mealPlan).forEach(key => {
      const meal = mealPlan[key];
      finalMealPlan[key] = {
        ...meal,
        ...mealTotals[key],
      };
    });
    onSave(finalMealPlan);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-green-600" /> Projeto de Alimentação
      </h3>

      {/* Tabs de Refeições */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
        {MEAL_TYPES.map((meal) => (
          <button
            key={meal.key}
            onClick={() => setActiveTab(meal.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === meal.key
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {meal.name}
          </button>
        ))}
      </div>

      {/* Conteúdo da Tab Ativa */}
      <div className="space-y-4">
        {/* Horário da Refeição */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Clock className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Horário Sugerido:</label>
          <Input
            type="time"
            value={currentMeal.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-32 text-sm p-1 border-gray-300"
          />
        </div>

        {/* Itens da Refeição */}
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-2 text-xs font-bold text-gray-600 uppercase border-b pb-2">
            <span className="col-span-2">Alimento</span>
            <span className="text-center">Peso (g)</span>
            <span className="text-center">Calorias</span>
            <span className="text-center">Prot. (g)</span>
            <span className="text-center">Carb. (g)</span>
          </div>
          
          {currentMeal.items.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 items-center">
              <Input
                type="text"
                value={item.food}
                onChange={(e) => handleItemChange(index, 'food', e.target.value)}
                placeholder="Nome do Alimento"
                className="col-span-2 text-sm p-1"
              />
              <Input
                type="number"
                value={item.weight}
                onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                className="text-sm p-1 text-center"
              />
              <Input
                type="number"
                value={item.cals}
                onChange={(e) => handleItemChange(index, 'cals', e.target.value)}
                className="text-sm p-1 text-center"
              />
              <Input
                type="number"
                value={item.prot}
                onChange={(e) => handleItemChange(index, 'prot', e.target.value)}
                className="text-sm p-1 text-center"
              />
              <Input
                type="number"
                value={item.carb}
                onChange={(e) => handleItemChange(index, 'carb', e.target.value)}
                className="text-sm p-1 text-center"
              />
              <Button onClick={() => handleRemoveItem(index)} variant="ghost" className="p-1 h-auto w-full">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={handleAddItem} variant="outline" className="w-full text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Item
        </Button>

        {/* Totais da Refeição */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm font-bold">
          <span>Total da Refeição:</span>
          <div className="flex gap-4">
            <span className="text-orange-600">{currentTotals.totalCals} kcal</span>
            <span className="text-blue-600">{currentTotals.totalProt}g Prot.</span>
            <span className="text-green-600">{currentTotals.totalCarb}g Carb.</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button onClick={onCancel} variant="outline" className="flex items-center gap-2">
          <X className="w-4 h-4" /> Cancelar
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> Salvar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};

export default MealPlanEditor;
