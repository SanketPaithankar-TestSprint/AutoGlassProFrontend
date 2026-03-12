import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ value, onChange }) => {
    const { t } = useTranslation();
    return (
        <div className="max-w-md w-full">
            <Input
                size="large"
                placeholder={t('openRoute.search.placeholder')}
                prefix={<SearchOutlined className="text-slate-400" />}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-full shadow-sm hover:shadow transition-shadow border-slate-200"
                allowClear
            />
        </div>
    );
};

export default SearchBar;
