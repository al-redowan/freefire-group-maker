import React, { useState, useCallback } from 'react';
import { TeamRegistration } from '../types';

interface Group {
    name: string;
    teams: TeamRegistration[];
}

interface GroupingCardProps {
    registrations: TeamRegistration[];
    onFileLoad: (file: File) => void;
}

const GroupingCard: React.FC<GroupingCardProps> = ({ registrations, onFileLoad }) => {
    const [teamsPerGroup, setTeamsPerGroup] = useState(12);
    const [groups, setGroups] = useState<Group[]>([]);
    const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
    const [quickGroupNames, setQuickGroupNames] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            onFileLoad(file);
        }
    }, [onFileLoad]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileLoad(file);
        }
        e.target.value = ''; // Reset file input
    };

    const handleGenerateGroups = () => {
        let teamsToGroup: TeamRegistration[];

        const quickNames = quickGroupNames.split('\n').map(name => name.trim()).filter(name => name.length > 0);

        if (quickNames.length > 0) {
            teamsToGroup = quickNames.map(name => ({
                teamName: name,
                timestamp: '',
                username: '',
                joinedWhatsApp: 'N/A',
                leaderWhatsApp: '',
                email: '',
            }));
        } else {
            teamsToGroup = [...registrations];
        }

        if (teamsToGroup.length === 0 || teamsPerGroup <= 0) {
            setGroups([]);
            return;
        }

        // Fisher-Yates (aka Knuth) Shuffle
        const shuffledTeams = [...teamsToGroup];
        let currentIndex = shuffledTeams.length;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffledTeams[currentIndex], shuffledTeams[randomIndex]] = [
                shuffledTeams[randomIndex], shuffledTeams[currentIndex]
            ];
        }

        const newGroups: Group[] = [];
        for (let i = 0; i < shuffledTeams.length; i += teamsPerGroup) {
            const chunk = shuffledTeams.slice(i, i + teamsPerGroup);
            newGroups.push({
                name: `Group ${newGroups.length + 1}`,
                teams: chunk
            });
        }
        setGroups(newGroups);
        setCopiedStates({});
    };

    const handleCopyEmails = (groupIndex: number, teams: TeamRegistration[]) => {
        const emails = teams.map(team => team.email).filter(Boolean).join(', ');
        if (!emails) {
            return; // No emails to copy
        }
        navigator.clipboard.writeText(emails).then(() => {
            setCopiedStates(prev => ({ ...prev, [groupIndex]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [groupIndex]: false }));
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy emails: ', err);
            alert("Failed to copy emails to clipboard.");
        });
    };

    return (
        <div className="bg-[#2A2D3A] p-6 sm:p-8 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Tournament Grouping</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Option 1: Load Teams from CSV File
                </label>
                 <div 
                    className={`relative w-full p-6 text-center border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-indigo-400 bg-indigo-900/20' : 'border-gray-600'}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <svg className="mx-auto h-12 w-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-400">Drag & drop your CSV file here</p>
                    <p className="mt-1 text-xs text-gray-500">or</p>
                    <label htmlFor="csv-upload-grouping" className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 cursor-pointer text-sm">
                        Browse Files
                    </label>
                    <input id="csv-upload-grouping" type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                </div>
            </div>

            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="quick-grouping" className="block text-sm font-medium text-white mb-2">
                        Quick Grouping (Names Only):
                    </label>
                    <textarea
                        id="quick-grouping"
                        rows={5}
                        className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 transition-all placeholder-gray-400"
                        placeholder="Paste one team name per line. If empty, the main list will be used."
                        value={quickGroupNames}
                        onChange={(e) => setQuickGroupNames(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="teams-per-group" className="block text-sm font-medium text-white mb-2">Teams per group</label>
                    <input
                        type="number"
                        id="teams-per-group"
                        value={teamsPerGroup}
                        onChange={(e) => setTeamsPerGroup(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3 bg-[#1E1F29] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
                        min="1"
                    />
                </div>
            </div>
            
            <button
                onClick={handleGenerateGroups}
                className="flex items-center justify-center w-full px-4 py-3 bg-[#5D5FEF] text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-200 mt-8"
                aria-label="Generate random tournament groups"
            >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.5 8C9.5 6.61929 8.38071 5.5 7 5.5C5.61929 5.5 4.5 6.61929 4.5 8C4.5 9.38071 5.61929 10.5 7 10.5C8.38071 10.5 9.5 9.38071 9.5 8ZM7 12.5C4.23858 12.5 2 14.7386 2 17.5V19.5H12V17.5C12 14.7386 9.76142 12.5 7 12.5Z" fill="currentColor" opacity="0.7"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.5 8C19.5 6.61929 18.3807 5.5 17 5.5C15.6193 5.5 14.5 6.61929 14.5 8C14.5 9.38071 15.6193 10.5 17 10.5C18.3807 10.5 19.5 9.38071 19.5 8ZM17 12.5C14.2386 12.5 12 14.7386 12 17.5V19.5H22V17.5C22 14.7386 19.7614 12.5 17 12.5Z" fill="currentColor"/>
                </svg>
                Generate Groups
            </button>

            {groups.length === 0 && (
                 <div className="text-center py-8 text-gray-500 border-t border-slate-700 mt-8">
                    Load teams via CSV or Quick Grouping, then click "Generate Groups".
                </div>
            )}

            {groups.length > 0 && (
                <div className="border-t border-slate-700 pt-6 mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map((group, index) => (
                        <div key={group.name} className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-indigo-300">{group.name}</h3>
                                <button
                                    onClick={() => handleCopyEmails(index, group.teams)}
                                    aria-label={`Copy emails for ${group.name}`}
                                    disabled={group.teams.every(t => !t.email)}
                                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                                        copiedStates[index]
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                                    } disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed`}
                                >
                                    {copiedStates[index] ? (
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
                                            Copy Emails
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2 -mr-2" style={{maxHeight: '250px'}}>
                                <ul className="space-y-2">
                                    {group.teams.map((team, teamIndex) => (
                                        <li key={teamIndex} className="text-sm bg-slate-700/60 p-2 rounded-md">
                                            <p className="font-semibold text-gray-200 truncate" title={team.teamName}>{team.teamName}</p>
                                            <p className="text-gray-400 truncate" title={team.email}>{team.email || ' '}</p>
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