import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ai: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90"
  };
  
  const isLoader = children?.type === Loader2;

  return (
    <button type={type} onClick={onClick} disabled={disabled || isLoader} className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
