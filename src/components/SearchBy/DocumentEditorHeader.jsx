import React from 'react';
import { Tabs, Button, Dropdown } from 'antd';
import { DeleteOutlined, DownOutlined, IdcardOutlined, CalendarOutlined, SafetyCertificateOutlined, PaperClipOutlined, CreditCardOutlined, FileDoneOutlined, FileTextOutlined } from '@ant-design/icons';

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

  const docTypeItems = [
    {
      key: 'Quote',
      label: 'Quote',
      onClick: () => setManualDocType('Quote'),
    },
    {
      key: 'Work Order',
      label: 'Work Order',
      onClick: () => setManualDocType('Work Order'),
    },
    {
      key: 'Invoice',
      label: 'Invoice',
      onClick: () => setManualDocType('Invoice'),
    },
  ];

  // Create tab items
  const tabItems = [
    {
      key: 'quote',
      label: (
        <div className="flex items-center">
          {manualDocType || 'Quote'}
          <Dropdown menu={{ items: docTypeItems }} trigger={['click']} placement="bottomLeft">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-0 cursor-pointer transition !bg-transparent border-none flex items-center justify-center ml-1"
              title="Change document type"
            >
              <DownOutlined className="text-[10px] text-slate-600" />
            </button>
          </Dropdown>
        </div>
      ),
      children: null,
    },
    {
      key: 'customer',
      label: (
        <span>Customer Information</span>
      ),
      children: null,
    },
    {
      key: 'scheduling',
      label: (
        <span>Appointment</span>
      ),
      children: null,
    },
    {
      key: 'insurance',
      label: (
        <span>Insurance</span>
      ),
      children: null,
    },
    {
      key: 'attachment',
      label: (
        <span>Attachment</span>
      ),
      children: null,
    },
    {
      key: 'payment',
      label: (
        <span>Payment</span>
      ),
      children: null,
    },
    {
      key: 'notes',
      label: (
        <span>Notes</span>
      ),
      children: null,
    },
  ];

  // Tab button grid items for mobile/tablet
  const gridTabItems = [
    { key: 'quote', icon: FileTextOutlined, label: manualDocType || 'Quote', title: manualDocType || 'Quote' },
    { key: 'customer', icon: IdcardOutlined, label: 'Customer', title: 'Customer Information' },
    { key: 'scheduling', icon: CalendarOutlined, label: 'Appointment', title: 'Appointment' },
    { key: 'insurance', icon: SafetyCertificateOutlined, label: 'Insurance', title: 'Insurance' },
    { key: 'attachment', icon: PaperClipOutlined, label: 'Attachment', title: 'Attachment' },
    { key: 'payment', icon: CreditCardOutlined, label: 'Payment', title: 'Payment' },
    { key: 'notes', icon: FileDoneOutlined, label: 'Notes', title: 'Notes' },
  ];

  return (
    <div className="w-full bg-white backdrop-blur-sm border-b border-slate-200 relative rounded-lg">
      {/* Medium/Large Screen - Horizontal Tabs */}
      <div className="hidden md:block w-full px-2 md:px-4 py-0 overflow-hidden">
        <div className="flex justify-between items-center gap-1 md:gap-2 min-w-0">
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            styles={stylesObject}
            className="flex-1 min-w-0"
            tabBarStyle={{
              margin: 0,
              padding: 0,
              backgroundColor: 'transparent',
              borderBottom: 'none',
              minWidth: 'fit-content'
            }}
          />

          {/* Clear Button - Shown on Medium and Large */}
          <div className="flex-shrink-0 ml-1 md:ml-4">
            <Button
              onClick={handleGlobalClear}
              icon={<DeleteOutlined />}
              type="text"
              danger
              size="small"
              className="font-medium text-xs md:text-sm whitespace-nowrap"
            >
              <span className="hidden md:inline">Clear All</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Small Screen - Grid Layout (4 columns x 2 rows + dropdown row) */}
      <div className="md:hidden w-full px-3 py-3">
        <div className="grid grid-cols-4 gap-2">
          {/* Tab buttons in grid */}
          {gridTabItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-md transition-all text-[10px] font-medium ${isActive
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-white/50'
                  }`}
                title={item.title}
              >
                <IconComponent className="text-base" />
                <span className="text-[9px] text-center line-clamp-1">{item.label}</span>
              </button>
            );
          })}

          {/* Clear All button in grid */}
          <button
            onClick={handleGlobalClear}
            className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-md transition-all text-[10px] font-medium bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Clear All"
          >
            <DeleteOutlined className="text-base text-red-600" />
            <span className="text-[9px] text-center line-clamp-1 text-red-600">Clear All</span>
          </button>
        </div>

        {/* Third Row - Document Type Dropdown */}
        <div className="mt-2 flex items-center gap-2">
          {/* Document Type Dropdown */}
          <Dropdown menu={{ items: docTypeItems }} trigger={['click']} placement="bottomLeft">
            <button className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <span>{manualDocType || 'Quote'}</span>
              <DownOutlined className="text-xs ml-2" />
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorHeader;
