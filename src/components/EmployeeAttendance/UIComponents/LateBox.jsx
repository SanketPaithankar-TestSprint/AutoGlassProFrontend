import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';

const LateBox = ({ count = 1, showIcon = true, showNumber = false }) => {
  // If explicitly showing numbers only (no icon)
  if (!showIcon && showNumber) {
    return <span className="text-yellow-700 font-bold text-xs">{count}</span>;
  }
  
  // Otherwise show the styled box (with or without number)
  return (
    <div 
      className="flex items-center justify-center rounded-md mx-auto"
      style={{ 
        backgroundColor: '#fef9c3',
        width: '18px',
        height: '18px',
      }}
    >
      <div className="flex items-center justify-center">
        {showIcon && <ClockCircleOutlined style={{ fontSize: '10px', color: '#854d0e' }} />}
        {showNumber && showIcon && <span className="font-bold" style={{ fontSize: '10px', marginLeft: '1px', color: '#854d0e' }}>{count}</span>}
      </div>
    </div>
  );
};

export default LateBox;
