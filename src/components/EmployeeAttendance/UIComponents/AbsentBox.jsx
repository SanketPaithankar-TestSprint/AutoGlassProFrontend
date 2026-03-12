import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

const AbsentBox = ({ count = 1, showIcon = true, showNumber = false }) => {
  // If explicitly showing numbers only (no icon)
  if (!showIcon && showNumber) {
    return <span className="text-red-700 font-bold text-xs">{count}</span>;
  }
  
  // Otherwise show the styled box (with or without number)
  return (
    <div 
      className="flex items-center justify-center rounded-md mx-auto"
      style={{ 
        backgroundColor: '#fee2e2',
        width: '18px',
        height: '18px',
      }}
    >
      <div className="flex items-center justify-center">
        {showIcon && <CloseOutlined style={{ fontSize: '10px', color: '#991b1b' }} />}
        {showNumber && showIcon && <span className="font-bold" style={{ fontSize: '10px', marginLeft: '1px', color: '#991b1b' }}>{count}</span>}
      </div>
    </div>
  );
};

export default AbsentBox;
