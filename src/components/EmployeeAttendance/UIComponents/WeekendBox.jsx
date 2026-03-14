import React from 'react';

const WeekendBox = () => {
  return (
    <div 
      className="flex items-center justify-center rounded-md mx-auto"
      style={{ 
        backgroundColor: '#dbeafe',
        width: '18px',
        height: '18px',
      }}
    >
      <span className="font-bold" style={{ fontSize: '10px', color: '#1e40af' }}>-</span>
    </div>
  );
};

export default WeekendBox;
