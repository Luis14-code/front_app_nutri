import React from 'react';

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
