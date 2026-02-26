import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'antd';

const LanguageToggle = ({ compact = false }) => {
    const { i18n } = useTranslation();

    const isSpanish = i18n.language?.startsWith('es');

    const toggleLanguage = (checked) => {
        i18n.changeLanguage(checked ? 'es' : 'en');
    };

    return (
        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
            <span
                className={`text-xs font-semibold transition-colors ${!isSpanish ? 'text-violet-600' : 'text-slate-400'}`}
            >
                EN
            </span>
            <Switch
                size="small"
                checked={isSpanish}
                onChange={toggleLanguage}
                className="!bg-slate-300"
                style={isSpanish ? { backgroundColor: '#7E5CFE' } : {}}
            />
            <span
                className={`text-xs font-semibold transition-colors ${isSpanish ? 'text-violet-600' : 'text-slate-400'}`}
            >
                ES
            </span>
        </div>
    );
};

export default LanguageToggle;
