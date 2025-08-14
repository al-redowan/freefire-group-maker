
import React from 'react';
import { Team, SortConfig, SortKey } from '../types';
import { SortIcon } from '../constants';

interface TeamTableProps {
  teams: Team[];
  sortConfig: SortConfig | null;
  requestSort: (key: SortKey) => void;
}

const TeamTable: React.FC<TeamTableProps> = ({ teams, sortConfig, requestSort }) => {
    const getSortDirectionFor = (key: SortKey) => {
        if (!sortConfig) {
          return;
        }
        return sortConfig.key === key ? sortConfig.direction : undefined;
    };

    const SortIndicator: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
        if (!direction) return <SortIcon className="w-4 h-4 text-slate-500" />;

        const iconClass = "w-4 h-4 text-white transition-transform duration-200";
        const transform = direction === 'ascending' ? 'rotate(180deg)' : '';

        return <SortIcon className={iconClass} style={{ transform }} />;
    };

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            <button onClick={() => requestSort('name')} className="flex items-center space-x-1 group">
                                <span>Team Name</span>
                                <SortIndicator direction={getSortDirectionFor('name')} />
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button onClick={() => requestSort('email')} className="flex items-center space-x-1 group">
                                <span>Email</span>
                                <SortIndicator direction={getSortDirectionFor('email')} />
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <button onClick={() => requestSort('leaderWhatsapp')} className="flex items-center space-x-1 group">
                                <span>Leader Whatsapp</span>
                                <SortIndicator direction={getSortDirectionFor('leaderWhatsapp')} />
                            </button>
                        </th>
                        <th scope="col" className="px-6 py-3 hidden sm:table-cell">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map((team) => (
                    <tr key={team.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            {team.name}
                        </td>
                         <td className="px-6 py-4">
                            {team.email}
                        </td>
                        <td className="px-6 py-4">
                            {team.leaderWhatsapp}
                        </td>
                        <td className="px-6 py-4 text-right hidden sm:table-cell">
                             <a href="#" className="font-medium text-indigo-400 hover:underline">Edit</a>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default TeamTable;
