import React from 'react';
import { Lock } from 'lucide-react';

const Input = ({ label, readOnly, textarea, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
      {label}
      {readOnly && <Lock className="w-3 h-3 text-gray-400" />}
    </label>}
    {textarea ? (
        <textarea 
            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all min-h-[100px] ${
            readOnly 
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
            : 'border-gray-200 focus:ring-green-500 focus:border-transparent bg-white'
            }`}
            readOnly={readOnly}
            {...props} 
        />
    ) : (
        <input 
        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all ${
            readOnly 
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
            : 'border-gray-200 focus:ring-green-500 focus:border-transparent bg-white'
        }`}
        readOnly={readOnly}
        {...props} 
        />
    )}
  </div>
);

export default Input;
