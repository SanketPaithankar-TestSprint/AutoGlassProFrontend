import React from 'react';
import { Flex, Tabs, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const DocumentEditorHeader = ({
  activeTab,
  setActiveTab,
  manualDocType,
  setManualDocType,
  handleGlobalClear
}) => {
  // Style configuration for transparent tabs
  const stylesObject = {
    root: { 
      backgroundColor: 'transparent',
      borderBottom: 'none'
    },
    header: { 
      backgroundColor: 'transparent',
      margin: 0
    },
    nav: {
      backgroundColor: 'transparent'
    },
    navList: {
      backgroundColor: 'transparent'
    },
    navOperationContainer: {
      backgroundColor: 'transparent'
    }
  };

  // Create tab items
  const tabItems = [
    {
      key: 'quote',
      label: manualDocType || 'Quote',
      children: null,
    },
    {
      key: 'customer',
      label: 'Customer Information',
      children: null,
    },
    {
      key: 'scheduling',
      label: 'Appointment',
      children: null,
    },
    {
      key: 'insurance',
      label: 'Insurance',
      children: null,
    },
    {
      key: 'attachment',
      label: 'Attachment',
      children: null,
    },
    {
      key: 'payment',
      label: 'Payment',
      children: null,
    },
    {
      key: 'notes',
      label: 'Notes',
      children: null,
    },
  ];

  return (
    <div className="w-full bg-[#E2E8F0] backdrop-blur-sm border-b border-transparent overflow-hidden">
      {/* Tabs Container */}
      <div className="w-full px-2 lg:px-4 overflow-x-auto py-0">
        <div className="flex justify-between items-center min-w-fit">
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            styles={stylesObject}
            className="flex-1"
            tabBarStyle={{
              margin: 0,
              padding: 0,
              backgroundColor: 'transparent',
              borderBottom: 'none',
              minWidth: 'fit-content'
            }}
          />

          {/* Clear Button - Hidden on small screens */}
          <div className="hidden md:block flex-shrink-0 ml-4">
            <Button
              onClick={handleGlobalClear}
              icon={<DeleteOutlined />}
              type="text"
              danger
              className="font-medium text-sm"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Clear Button - Shown on small screens below tabs */}
      <div className="md:hidden px-2 lg:px-4 py-2 flex justify-end">
        <Button
          onClick={handleGlobalClear}
          icon={<DeleteOutlined />}
          type="text"
          danger
          className="font-medium text-sm"
          size="small"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default DocumentEditorHeader;
