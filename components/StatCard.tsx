
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center space-x-4">
      <div className="bg-indigo-600/20 text-indigo-400 rounded-lg p-3">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
