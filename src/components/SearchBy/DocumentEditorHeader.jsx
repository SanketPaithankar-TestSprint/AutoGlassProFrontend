import React from 'react';
import { Tabs, Button, Dropdown } from 'antd';
import { DeleteOutlined, DownOutlined, IdcardOutlined, CalendarOutlined, SafetyCertificateOutlined, PaperClipOutlined, CreditCardOutlined, FileDoneOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const DocumentEditorHeader = ({
  activeTab,
  setActiveTab,
  manualDocType,
  setManualDocType,
  handleGlobalClear
}) => {
  const { t } = useTranslation();
  
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
      label: t('quoteDetails.docTypeQuote', 'Quote'),
      onClick: () => setManualDocType('Quote'),
    },
    {
      key: 'Work Order',
      label: t('quoteDetails.docTypeWorkOrder', 'Work Order'),
      onClick: () => setManualDocType('Work Order'),
    },
    {
      key: 'Invoice',
      label: t('quoteDetails.docTypeInvoice', 'Invoice'),
      onClick: () => setManualDocType('Invoice'),
    },
  ];

  // Create tab items
  const tabItems = [
    {
      key: 'quote',
      label: (
        <div className="flex items-center">
          {manualDocType === 'Quote' ? t('quoteDetails.docTypeQuote', 'Quote') : 
           manualDocType === 'Work Order' ? t('quoteDetails.docTypeWorkOrder', 'Work Order') : 
           manualDocType === 'Invoice' ? t('quoteDetails.docTypeInvoice', 'Invoice') : 
           (manualDocType || t('quoteDetails.docTypeQuote', 'Quote'))}
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
        <span>{t('quoteDetails.customerInformation', 'Customer Information')}</span>
      ),
      children: null,
    },
    {
      key: 'scheduling',
      label: (
        <span>{t('quoteDetails.appointment', 'Appointment')}</span>
      ),
      children: null,
    },
    {
      key: 'insurance',
      label: (
        <span>{t('quoteDetails.insurance', 'Insurance')}</span>
      ),
      children: null,
    },
    {
      key: 'attachment',
      label: (
        <span>{t('quoteDetails.attachments', 'Attachment')}</span>
      ),
      children: null,
    },
    {
      key: 'payment',
      label: (
        <span>{t('quoteDetails.payment', 'Payment')}</span>
      ),
      children: null,
    },
    {
      key: 'notes',
      label: (
        <span>{t('quoteDetails.notes', 'Notes')}</span>
      ),
      children: null,
    },
  ];

  // Tab button grid items for mobile/tablet
  const getGridDocTypeLabel = () => {
    if (manualDocType === 'Quote') return t('quoteDetails.docTypeQuote', 'Quote');
    if (manualDocType === 'Work Order') return t('quoteDetails.docTypeWorkOrder', 'Work Order');
    if (manualDocType === 'Invoice') return t('quoteDetails.docTypeInvoice', 'Invoice');
    return manualDocType || t('quoteDetails.docTypeQuote', 'Quote');
  };

  const gridTabItems = [
    { key: 'quote', icon: FileTextOutlined, label: getGridDocTypeLabel(), title: getGridDocTypeLabel() },
    { key: 'customer', icon: IdcardOutlined, label: t('quoteDetails.customerInformation', 'Customer'), title: t('quoteDetails.customerInformation', 'Customer Information') },
    { key: 'scheduling', icon: CalendarOutlined, label: t('quoteDetails.appointment', 'Appointment'), title: t('quoteDetails.appointment', 'Appointment') },
    { key: 'insurance', icon: SafetyCertificateOutlined, label: t('quoteDetails.insurance', 'Insurance'), title: t('quoteDetails.insurance', 'Insurance') },
    { key: 'attachment', icon: PaperClipOutlined, label: t('quoteDetails.attachments', 'Attachment'), title: t('quoteDetails.attachments', 'Attachment') },
    { key: 'payment', icon: CreditCardOutlined, label: t('quoteDetails.payment', 'Payment'), title: t('quoteDetails.payment', 'Payment') },
    { key: 'notes', icon: FileDoneOutlined, label: t('quoteDetails.notes', 'Notes'), title: t('quoteDetails.notes', 'Notes') },
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
              <span className="hidden md:inline">{t('quoteDetails.clearAll', 'Clear All')}</span>
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
            title={t('quoteDetails.clearAll', 'Clear All')}
          >
            <DeleteOutlined className="text-base text-red-600" />
            <span className="text-[9px] text-center line-clamp-1 text-red-600">{t('quoteDetails.clearAll', 'Clear All')}</span>
          </button>
        </div>

        {/* Third Row - Document Type Dropdown */}
        <div className="mt-2 flex items-center gap-2">
          {/* Document Type Dropdown */}
          <Dropdown menu={{ items: docTypeItems }} trigger={['click']} placement="bottomLeft">
            <button className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <span>{getGridDocTypeLabel()}</span>
              <DownOutlined className="text-xs ml-2" />
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorHeader;
