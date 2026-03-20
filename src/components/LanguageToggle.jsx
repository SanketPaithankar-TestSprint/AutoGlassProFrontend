import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Button } from 'antd';
import { DownOutlined, GlobalOutlined } from '@ant-design/icons';

export const LANGUAGE_OPTIONS = [
    { key: 'en', short: 'EN', long: 'English (EN)' },
    { key: 'es', short: 'ES', long: 'Español (ES)' },
];

const LanguageToggle = ({ compact = false, dark = false, sidebarMode = false, mobileMenu = false }) => {
    const { t, i18n } = useTranslation();

    const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';
    const activeOption = LANGUAGE_OPTIONS.find(opt => opt.key === currentLang);

    const handleMenuClick = (e) => {
        i18n.changeLanguage(e.key);
    };

    const items = LANGUAGE_OPTIONS.map(opt => ({
        key: opt.key,
        label: <div className="whitespace-nowrap px-1 min-w-[120px]">{opt.long}</div>,
    }));

    const btnClasses = dark
        ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-500 hover:text-white"
        : "border-slate-200 text-violet-700 hover:border-violet-400 hover:text-violet-600";

    const dropdownMenu = { items, onClick: handleMenuClick, selectedKeys: [currentLang] };

    // Mobile menu: full-width pill segmented toggle
    if (mobileMenu) {
        return (
            <div className="flex items-center gap-2 px-4 py-2">
                <GlobalOutlined className="text-violet-500 text-base shrink-0" />
                <span className="text-sm text-slate-500 font-medium mr-1">{t('nav.language')}</span>
                <div className="flex flex-1 rounded-full border border-violet-200 overflow-hidden bg-slate-100 p-0.5 gap-0.5">
                    {LANGUAGE_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => i18n.changeLanguage(opt.key)}
                            className={`flex-1 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 border-0 cursor-pointer
                                ${currentLang === opt.key
                                    ? 'bg-violet-600 text-white shadow-sm'
                                    : 'bg-transparent text-slate-500 hover:text-violet-600'
                                }`}
                        >
                            {opt.short}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {sidebarMode ? (
                <Dropdown 
                    menu={dropdownMenu} 
                    placement={compact ? "right" : "topRight"} 
                    trigger={['click']}
                    getPopupContainer={() => document.body}
                    overlayStyle={{ minWidth: '150px' }}
                >
                    <div className={`flex items-center ${compact ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group w-full mb-1`}>
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 w-10 h-10 rounded-full border-2 border-slate-600 group-hover:border-violet-400 transition-colors flex items-center justify-center font-bold text-slate-300 group-hover:text-white text-xs">
                                {activeOption?.short}
                            </div>
                            {!compact && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                                        {t('nav.myLanguage')}
                                    </span>
                                </div>
                            )}
                        </div>
                        {!compact && <DownOutlined className="text-xs !text-white group-hover:text-white transition-colors ml-2" />}
                    </div>
                </Dropdown>
            ) : (
                <Dropdown overlayClassName="language-action-menu" menu={dropdownMenu} placement="bottomRight" trigger={['click']}>
                    <Button
                        shape="circle"
                        className={`shrink-0 flex items-center justify-center font-bold shadow-sm transition-colors ${btnClasses} ${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}`}
                    >
                        {activeOption?.short}
                    </Button>
                </Dropdown>
            )}
        </>
    );
};

export default LanguageToggle;
