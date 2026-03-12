import React from 'react';
import { CheckOutlined } from '@ant-design/icons';

const PresentBox = ({ count = 1, showIcon = true, showNumber = false }) => {
  // If explicitly showing numbers only (no icon)
  if (!showIcon && showNumber) {
    return <span className="text-green-700 font-bold text-xs">{count}</span>;
  }
  
  // Otherwise show the styled box (with or without number)
  return (
    <div 
      className="flex items-center justify-center rounded-md mx-auto"
      style={{ 
        backgroundColor: '#dcfce7',
        width: '18px',
        height: '18px',
      }}
    >
      <div className="flex items-center justify-center">
        {showIcon && <CheckOutlined style={{ fontSize: '10px', color: '#166534' }} />}
        {showNumber && showIcon && <span className="font-bold" style={{ fontSize: '10px', marginLeft: '1px', color: '#166534' }}>{count}</span>}
      </div>
    </div>
  );
};

export default PresentBox;
