import React, { useState, useMemo } from 'react';
import { TeamRegistration } from '../types';

interface DataTableProps {
    data: TeamRegistration[];
}

type SortKey = keyof TeamRegistration;
type SortOrder = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    order: SortOrder;
}

const SortableHeader: React.FC<{
    title: string;
    sortKey: SortKey;
    sortConfig: SortConfig | null;
    onSort: (key: SortKey) => void;
}> = ({ title, sortKey, sortConfig, onSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    const Icon = () => {
        if (!isSorted) return <span className="text-gray-500">↕</span>;
        return sortConfig.order === 'asc' ? <span className="text-white">↑</span> : <span className="text-white">↓</span>;
    };
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                {title}
                <span className="ml-2"><Icon /></span>
            </div>
        </th>
    );
};

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const handleSort = (key: SortKey) => {
        let order: SortOrder = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
            order = 'desc';
        }
        setSortConfig({ key, order });
    };

    const sortedAndFilteredData = useMemo(() => {
        let filteredData = data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        if (sortConfig !== null) {
            filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.order === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.order === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredData;
    }, [data, searchTerm, sortConfig]);

    return (
        <div className="bg-[#252836] p-4 sm:p-6 rounded-lg shadow-lg border border-slate-700">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search all fields..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <SortableHeader title="Team Name" sortKey="teamName" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader title="Leader WhatsApp" sortKey="leaderWhatsApp" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader title="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader title="Joined WA" sortKey="joinedWhatsApp" sortConfig={sortConfig} onSort={handleSort} />
                        </tr>
                    </thead>
                    <tbody className="bg-[#252836] divide-y divide-slate-700">
                        {sortedAndFilteredData.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-700/50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.teamName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.leaderWhatsApp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.joinedWhatsApp === 'Yes' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                                    }`}>
                                        {item.joinedWhatsApp}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredData.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No results found for "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;