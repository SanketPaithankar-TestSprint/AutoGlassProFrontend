import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export const LANGUAGE_OPTIONS = [
    { key: 'en', short: 'EN', long: 'English (EN)' },
    { key: 'es', short: 'ES', long: 'Español (ES)' },
];

const LanguageToggle = ({ compact = false, dark = false, sidebarMode = false }) => {
    const { i18n } = useTranslation();

    const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';
    const activeOption = LANGUAGE_OPTIONS.find(opt => opt.key === currentLang);

    const handleMenuClick = (e) => {
        i18n.changeLanguage(e.key);
    };

    const items = LANGUAGE_OPTIONS.map(opt => ({
        key: opt.key,
        label: <div className="whitespace-nowrap px-1">{opt.long}</div>,
    }));

    // Styling based on dark mode prop
    const btnClasses = dark
        ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-violet-500 hover:text-white"
        : "border-slate-200 text-violet-700 hover:border-violet-400 hover:text-violet-600";

    const dropdownMenu = { items, onClick: handleMenuClick, selectedKeys: [currentLang] };

    return (
        <>
            <style>{`
                .language-action-menu .ant-dropdown-menu-item {
                    width: max-content;
                    min-width: 130px;
                }
            `}</style>

            {sidebarMode ? (
                <Dropdown overlayClassName="language-action-menu" menu={dropdownMenu} placement="topLeft" trigger={['click']}>
                    <div className={`flex items-center ${compact ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group w-full mb-2`}>
                        <div className="flex items-center gap-3">
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${dark ? 'bg-white text-violet-700' : 'bg-violet-100 text-violet-700'} ${compact ? 'w-8 h-8 text-xs' : 'text-sm'}`}>
                                {activeOption?.short}
                            </div>
                            {!compact && (<div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">My Language</span>
                            </div>
                            )}
                        </div>
                        {!compact && <DownOutlined className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors ml-2" />}
                    </div>
                </Dropdown>
            ) : (<Dropdown overlayClassName="language-action-menu" menu={dropdownMenu} placement="bottomRight" trigger={['click']}>
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
