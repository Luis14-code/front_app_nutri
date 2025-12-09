import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const ActivityModal = ({ isOpen, onClose, onSave }) => {
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [customActivity, setCustomActivity] = useState('');

  const activities = [
    { name: 'Corrida', metValue: 9.8 },
    { name: 'Caminhada', metValue: 3.5 },
    { name: 'Musculação', metValue: 6.0 },
    { name: 'Ciclismo', metValue: 7.5 },
    { name: 'Natação', metValue: 8.0 },
    { name: 'Yoga', metValue: 2.5 },
    { name: 'Futebol', metValue: 10.0 },
    { name: 'Dança', metValue: 5.0 },
    { name: 'Personalizado', metValue: 0 }
  ];

  const handleSave = () => {
    if (!activityType || !duration) {
      alert('Preencha todos os campos!');
      return;
    }

    const selectedActivity = activities.find(a => a.name === activityType);
    const durationInHours = parseInt(duration) / 60;
    
    // Fórmula: Calorias = MET × peso (kg) × tempo (horas)
    // Usando peso médio de 70kg como padrão
    const caloriesBurned = Math.round(selectedActivity.metValue * 70 * durationInHours);

    const activity = {
      id: Date.now(),
      type: activityType === 'Personalizado' ? customActivity : activityType,
      duration: parseInt(duration),
      calories: caloriesBurned,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    onSave(activity);
    setActivityType('');
    setDuration('');
    setCustomActivity('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Atividade Física">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Atividade
          </label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecione...</option>
            {activities.map((activity) => (
              <option key={activity.name} value={activity.name}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>

        {activityType === 'Personalizado' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Atividade
            </label>
            <Input
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="Ex: Pilates, Crossfit..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duração (minutos)
          </label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ex: 30"
            min="1"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityModal;
