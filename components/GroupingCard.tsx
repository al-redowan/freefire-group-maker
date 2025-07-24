import React, { useState } from 'react';
import { TeamRegistration } from '../types';

interface Group {
    name: string;
    teams: TeamRegistration[];
}

interface GroupingCardProps {
    registrations: TeamRegistration[];
}

type CopyFormat = 'list' | 'table' | 'emails' | 'usernames';

const GroupingCard: React.FC<GroupingCardProps> = ({ registrations }) => {
    const [teamsPerGroup, setTeamsPerGroup] = useState(12);
    const [groups, setGroups] = useState<Group[]>([]);
    const [copiedGroupIndex, setCopiedGroupIndex] = useState<number | null>(null);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const handleGenerateGroups = () => {
        if (registrations.length === 0 || teamsPerGroup <= 0) {
            setGroups([]);
            return;
        }

        // Fisher-Yates (aka Knuth) Shuffle
        const shuffledRegistrations = [...registrations];
        let currentIndex = shuffledRegistrations.length;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffledRegistrations[currentIndex], shuffledRegistrations[randomIndex]] = [
                shuffledRegistrations[randomIndex], shuffledRegistrations[currentIndex]
            ];
        }

        const newGroups: Group[] = [];
        for (let i = 0; i < shuffledRegistrations.length; i += teamsPerGroup) {
            const chunk = shuffledRegistrations.slice(i, i + teamsPerGroup);
            newGroups.push({
                name: `Group ${String.fromCharCode(65 + newGroups.length)}`, // A, B, C...
                teams: chunk
            });
        }
        setGroups(newGroups);
        setCopiedGroupIndex(null);
        setOpenDropdownIndex(null);
    };
    
    const handleCopy = (groupIndex: number, group: Group, format: CopyFormat) => {
        let textToCopy = '';
        const groupHeader = `☄ ${group.name.toUpperCase()} ☄`;

        switch (format) {
            case 'list': {
                const teamList = group.teams.map((team, i) => `${i + 1}. ${team.teamName}`).join('\n');
                textToCopy = `${groupHeader}\n${teamList}`;
                break;
            }
            case 'table': {
                const tableHeader = "Team Name\tEmail";
                const tableRows = group.teams.map(team => `${team.teamName}\t${team.email || ''}`).join('\n');
                textToCopy = `${groupHeader}\n${tableHeader}\n${tableRows}`;
                break;
            }
            case 'emails': {
                const emails = group.teams.map(team => team.email).filter(Boolean).join(', ');
                textToCopy = `Team Emails:\n\n${emails}`;
                break;
            }
            case 'usernames': {
                const usernames = group.teams.map(team => team.username).filter(Boolean).join(', ');
                textToCopy = `Team Usernames:\n\n${usernames}`;
                break;
            }
        }
    
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedGroupIndex(groupIndex);
            setOpenDropdownIndex(null); // Close dropdown
            setTimeout(() => {
                setCopiedGroupIndex(null);
            }, 2500);
        }).catch(err => {
            console.error(`Failed to copy ${format}: `, err);
            alert(`Failed to copy data to clipboard.`);
        });
    };

    const toggleDropdown = (index: number) => {
        setOpenDropdownIndex(prev => (prev === index ? null : index));
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold text-white mb-3 sm:mb-0">
                    <span className="text-indigo-400">Tournament</span> Grouping
                </h2>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="flex-grow sm:flex-grow-0">
                        <label htmlFor="teams-per-group" className="sr-only">Teams per group</label>
                        <input
                            type="number"
                            id="teams-per-group"
                            value={teamsPerGroup}
                            onChange={(e) => setTeamsPerGroup(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 transition-colors text-center"
                            min="1"
                        />
                         <p className="text-xs text-gray-400 text-center mt-1">Teams/Group</p>
                    </div>
                    <button
                        onClick={handleGenerateGroups}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                        aria-label="Generate random tournament groups"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        Generate Groups
                    </button>
                </div>
            </div>

            {groups.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-t border-gray-700">
                    Set teams per group and click "Generate Groups" to create random tournament brackets.
                </div>
            )}

            {groups.length > 0 && (
                <div className="border-t border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map((group, index) => (
                        <div key={group.name} className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-indigo-300">{group.name}</h3>
                                <div className="relative inline-block text-left">
                                    <button
                                        type="button"
                                        onClick={() => toggleDropdown(index)}
                                        aria-haspopup="true"
                                        aria-expanded={openDropdownIndex === index}
                                        className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                                            copiedGroupIndex === index
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                    >
                                        {copiedGroupIndex === index ? (
                                            <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                             Copied!
                                            </>
                                        ) : (
                                            <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                            </svg>
                                            Copy
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </>
                                        )}
                                    </button>
                                    {openDropdownIndex === index && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-20 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                                            <div className="py-1" role="none">
                                                <button onClick={() => handleCopy(index, group, 'list')} className="text-gray-200 hover:bg-gray-600 block w-full text-left px-4 py-2 text-sm" role="menuitem">Copy Team List</button>
                                                <button onClick={() => handleCopy(index, group, 'table')} className="text-gray-200 hover:bg-gray-600 block w-full text-left px-4 py-2 text-sm" role="menuitem">Copy Details (Table)</button>
                                                <button onClick={() => handleCopy(index, group, 'emails')} className="text-gray-200 hover:bg-gray-600 block w-full text-left px-4 py-2 text-sm" role="menuitem">Copy Emails</button>
                                                <button onClick={() => handleCopy(index, group, 'usernames')} className="text-gray-200 hover:bg-gray-600 block w-full text-left px-4 py-2 text-sm" role="menuitem">Copy Usernames</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2 -mr-2" style={{maxHeight: '250px'}}>
                                <ul className="space-y-2">
                                    {group.teams.map((team, teamIndex) => (
                                        <li key={teamIndex} className="text-sm bg-gray-800/60 p-2 rounded-md">
                                            <p className="font-semibold text-gray-200 truncate" title={team.teamName}>{team.teamName}</p>
                                            <p className="text-gray-400 truncate" title={team.email}>{team.email}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupingCard;