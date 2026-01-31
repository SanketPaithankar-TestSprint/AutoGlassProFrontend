import React from 'react';
import { Wallet } from 'lucide-react';

const OutstandingBalanceCard = ({ amount }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);

    const isHigh = amount > 1000;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Outstanding Balance</p>
                <h3 className={`text-3xl font-bold ${isHigh ? 'text-red-500' : 'text-slate-800'}`}>
                    {formattedAmount}
                </h3>
                {isHigh && (
                    <span className="text-xs text-red-500 mt-2 block">Action Required</span>
                )}
            </div>
            <div className={`p-4 rounded-full ${isHigh ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                <Wallet size={24} />
            </div>
        </div>
    );
};

export default OutstandingBalanceCard;
