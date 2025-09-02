import React, { useState, useEffect } from 'react';
import type { TeamRegistration, Group } from '../types';

interface GroupingCardProps {
    registrations: TeamRegistration[];
}

const GroupingCard: React.FC<GroupingCardProps> = ({ registrations }) => {
    const STORAGE_KEY = 'tournamentGroups';
    const [teamsPerGroup, setTeamsPerGroup] = useState(12);
    const [groups, setGroups] = useState<Group[]>([]);
    const [copiedEmailStates, setCopiedEmailStates] = useState<{ [key: number]: boolean }>({});
    const [copiedTeamStates, setCopiedTeamStates] = useState<{ [key: number]: boolean }>({});
    const [savedGroupsExist, setSavedGroupsExist] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const isDisabled = registrations.length === 0;

    useEffect(() => {
        if (localStorage.getItem(STORAGE_KEY)) {
            setSavedGroupsExist(true);
        }
    }, []);

    const displayActionMessage = (message: string) => {
        setActionMessage(message);
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleGenerateGroups = () => {
        if (isDisabled || teamsPerGroup <= 0) {
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
                name: `☄ GROUP ${String.fromCharCode(65 + newGroups.length)} ☄`,
                teams: chunk
            });
        }
        setGroups(newGroups);
        setCopiedEmailStates({});
        setCopiedTeamStates({});
    };

    const handleCopyEmails = (groupIndex: number, teams: TeamRegistration[]) => {
        const emails = teams.map(team => team.email).filter(Boolean).join(', ');
        navigator.clipboard.writeText(emails).then(() => {
            setCopiedEmailStates(prev => ({ ...prev, [groupIndex]: true }));
            setTimeout(() => {
                setCopiedEmailStates(prev => ({ ...prev, [groupIndex]: false }));
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy emails: ', err);
            alert("Failed to copy emails to clipboard.");
        });
    };
    
    const handleCopyTeams = (groupIndex: number, teams: TeamRegistration[]) => {
        const teamList = teams.map((team, index) => `${index + 1}. ${team.teamName}`).join('\n');
        navigator.clipboard.writeText(teamList).then(() => {
            setCopiedTeamStates(prev => ({ ...prev, [groupIndex]: true }));
            setTimeout(() => {
                setCopiedTeamStates(prev => ({ ...prev, [groupIndex]: false }));
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy team names: ', err);
            alert("Failed to copy team names to clipboard.");
        });
    };

    const handleSaveGroups = () => {
        if (groups.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
            setSavedGroupsExist(true);
            displayActionMessage('Groups saved successfully!');
        }
    };

    const handleLoadGroups = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsedGroups = JSON.parse(savedData) as Group[];
                if (Array.isArray(parsedGroups)) {
                    setGroups(parsedGroups);
                    displayActionMessage('Saved groups loaded successfully!');
                } else {
                    throw new Error("Data format is incorrect.");
                }
            } catch (error) {
                console.error("Failed to load groups from localStorage:", error);
                displayActionMessage('Failed to load groups. Data might be corrupted.');
                localStorage.removeItem(STORAGE_KEY);
                setSavedGroupsExist(false);
            }
        }
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold text-white mb-3 sm:mb-0">
                    <span className="text-indigo-400">Tournament</span> Grouping
                </h2>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="flex-grow sm:flex-grow-0 w-24">
                        <label htmlFor="teams-per-group" className="sr-only">Teams per group</label>
                        <input
                            type="number"
                            id="teams-per-group"
                            aria-label="Number of teams per group"
                            value={teamsPerGroup}
                            onChange={(e) => setTeamsPerGroup(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 transition-colors text-center disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                            min="1"
                            disabled={isDisabled}
                        />
                         <p className="text-xs text-gray-400 text-center mt-1">Teams/Group</p>
                    </div>
                    <button
                        onClick={handleGenerateGroups}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-500/70 disabled:cursor-not-allowed"
                        aria-label="Generate random tournament groups with the specified number of teams per group"
                        disabled={isDisabled}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        <span className="hidden md:inline">Generate</span>
                    </button>
                    <button
                        onClick={handleLoadGroups}
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 disabled:bg-gray-500/70 disabled:cursor-not-allowed"
                        aria-label="Load previously saved tournament groups from local storage"
                        disabled={!savedGroupsExist || isDisabled}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M11 5a1 1 0 00-1 1v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L11 11.586V6a1 1 0 00-1-1z" /><path d="M4 8a2 2 0 012-2h2a1 1 0 100-2H6a4 4 0 00-4 4v6a4 4 0 004 4h8a4 4 0 004-4v-1a1 1 0 10-2 0v1a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                        </svg>
                        <span className="hidden md:inline">Load</span>
                    </button>
                </div>
            </div>

            {actionMessage && (
                <div className="mb-4 text-center text-sm text-green-300 bg-green-900/50 p-2.5 rounded-md border border-green-700 transition-opacity duration-300">
                    {actionMessage}
                </div>
            )}

            {groups.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-t border-gray-700">
                    {isDisabled
                        ? "Upload a CSV file with team data to generate groups."
                        : 'Set teams per group and click "Generate Groups" or "Load Groups" to begin.'}
                </div>
            )}

            {groups.length > 0 && (
                <div className="border-t border-gray-700 pt-6">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleSaveGroups}
                            className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-200"
                            aria-label="Save the current group configuration to local storage"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12l-5-3-5 3V4z" />
                            </svg>
                            Save Groups
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {groups.map((group, index) => (
                            <div key={group.name} className="bg-gray-900/40 border border-gray-700 rounded-lg p-4 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-indigo-300">{group.name}</h3>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleCopyTeams(index, group.teams)}
                                            aria-label={`Copy team names for ${group.name}`}
                                            className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                                                copiedTeamStates[index]
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            }`}
                                        >
                                            {copiedTeamStates[index] ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
                                                    Copy Teams
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleCopyEmails(index, group.teams)}
                                            aria-label={`Copy emails for ${group.name}`}
                                            className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                                                copiedEmailStates[index]
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            }`}
                                        >
                                            {copiedEmailStates[index] ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                                    Copy Emails
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-grow overflow-y-auto pr-2 -mr-2" style={{maxHeight: '250px'}}>
                                    <ol className="space-y-2 list-decimal list-inside">
                                        {group.teams.map((team, teamIndex) => (
                                            <li key={teamIndex} className="text-sm bg-gray-800/60 p-2 rounded-md marker:text-indigo-400 marker:font-semibold">
                                                <div className="inline-block ml-1 align-top">
                                                    <p className="font-semibold text-gray-200 truncate" title={team.teamName}>{team.teamName}</p>
                                                    <p className="text-gray-400 truncate" title={team.email}>{team.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupingCard;