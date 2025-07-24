
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg flex items-center space-x-4 border border-gray-700">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
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
