import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchBar = ({ value, onChange }) => {
    return (
        <div className="max-w-md w-full">
            <Input
                size="large"
                placeholder="Search by Document #, Customer, or Vehicle..."
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
