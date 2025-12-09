import React from 'react';

const ProgressBar = ({ current, max, color = "bg-green-500", label, unit = "g" }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isOverTarget = current > max;
  const excess = isOverTarget ? current - max : 0;
  const remaining = Math.max(max - current, 0);
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        {isOverTarget ? (
          <span className="text-red-500 font-semibold">+{excess}{unit} acima</span>
        ) : (
          <span className="text-gray-500">{remaining}{unit} restantes</span>
        )}
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isOverTarget ? 'bg-red-500' : color} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-[10px] text-gray-400 text-right mt-0.5">
        {current} / {max}{unit}
        {isOverTarget && <span className="text-red-500 ml-1">(Meta ultrapassada)</span>}
      </div>
    </div>
  );
};

export default ProgressBar;
