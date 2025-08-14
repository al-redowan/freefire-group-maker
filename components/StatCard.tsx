import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-[#2A2D3A] p-6 rounded-xl shadow-lg flex items-center space-x-4 border border-slate-700/50">
            <div className="p-3 bg-indigo-600/20 rounded-lg text-indigo-300">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-100">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;