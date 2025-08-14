import React, { useState, useMemo, useCallback } from 'react';
import { TeamRegistration, AnalysisResult } from './types';
import { analyzeTeamNames } from './services/geminiService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import AnalysisCard from './components/AnalysisCard';
import DataTable from './components/DataTable';
import GroupingCard from './components/GroupingCard';

// Simple CSV parser
const parseCSV = (csv: string): TeamRegistration[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
        alert("The CSV file is empty or missing a header row.");
        return [];
    }

    const headerLine = lines[0].replace(/"/g, '').trim();
    const header = headerLine.split(',');
    const data: TeamRegistration[] = [];

    const colMap = {
        timestamp: header.indexOf('Timestamp'),
        username: header.indexOf('Username'),
        joinedWhatsApp: header.indexOf('Join করছেন হোয়াটসঅ্যাপ কমিউনিটি গ্রুপে'),
        teamName: header.indexOf('TEAM NAME'),
        leaderWhatsApp: header.indexOf('Leader WhatsApp numbers'),
        email: header.indexOf('Email')
    };
    
    if(colMap.teamName === -1 || colMap.email === -1) {
        alert("Invalid CSV format. Please ensure the file contains 'TEAM NAME' and 'Email' columns.");
        return [];
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        if (values.length < header.length) continue; // Skip malformed lines

        const entry: TeamRegistration = {
            timestamp: (values[colMap.timestamp] || '').replace(/"/g, '').trim(),
            username: (values[colMap.username] || '').replace(/"/g, '').trim(),
            joinedWhatsApp: (values[colMap.joinedWhatsApp] || '').replace(/"/g, '').trim(),
            teamName: (values[colMap.teamName] || '').replace(/"/g, '').trim(),
            leaderWhatsApp: (values[colMap.leaderWhatsApp] || '').replace(/"/g, '').trim(),
            email: (values[colMap.email] || '').replace(/"/g, '').trim()
        };
        if(entry.teamName && entry.email) { // Only add entries with a team name and email
            data.push(entry);
        }
    }
    return data;
};

const generateMockData = (): TeamRegistration[] => {
    const data: TeamRegistration[] = [];
    for (let i = 1; i <= 79; i++) {
        data.push({
            timestamp: '2023-10-27 10:00:00',
            username: `user_yes_${i}@gmail.com`,
            joinedWhatsApp: 'Yes',
            teamName: `Alpha Squad ${i}`,
            leaderWhatsApp: `+12345678${i}`,
            email: `leader_yes_${i}@example.com`
        });
    }
    for (let i = 1; i <= 13; i++) {
        data.push({
            timestamp: '2023-10-27 10:05:00',
            username: `user_no_${i}@gmail.com`,
            joinedWhatsApp: 'No',
            teamName: `Omega Force ${i}`,
            leaderWhatsApp: `+98765432${i}`,
            email: `leader_no_${i}@example.com`
        });
    }
    return data;
};


const App: React.FC = () => {
    const [registrations, setRegistrations] = useState<TeamRegistration[]>(generateMockData());
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const processFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                const parsedData = parseCSV(text);
                if (parsedData.length > 0) {
                    setRegistrations(parsedData);
                    setAnalysisResult(null); // Reset analysis on new file
                    setAnalysisError(null);
                }
            }
        };
        reader.onerror = () => {
            setAnalysisError("Could not read the selected file.");
        };
        reader.readAsText(file);
    }, []);

    const stats = useMemo(() => {
        const totalTeams = registrations.length;
        const joinedCount = registrations.filter(r => r.joinedWhatsApp === 'Yes').length;
        const didNotJoinCount = totalTeams - joinedCount;
        return { totalTeams, joinedCount, didNotJoinCount };
    }, [registrations]);

    const handleAnalyze = useCallback(async (instruction: string) => {
        if (registrations.length === 0) {
            setAnalysisError("No team names to analyze. Please load team data first.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        try {
            const teamNames = registrations.map(r => r.teamName);
            const result = await analyzeTeamNames(teamNames, instruction);
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            setAnalysisError("Failed to analyze team names. Check the console for more details and ensure your API key is configured correctly.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [registrations]);

    return (
        <div className="min-h-screen w-full">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Teams Registered"
                            value={stats.totalTeams}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Joined WhatsApp Group"
                            value={stats.joinedCount}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Did Not Join"
                            value={stats.didNotJoinCount}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    <AnalysisCard
                        analysis={analysisResult}
                        isLoading={isAnalyzing}
                        error={analysisError}
                        onAnalyze={handleAnalyze}
                    />

                    <div className="space-y-8">
                       <GroupingCard registrations={registrations} onFileLoad={processFile} />
                       <DataTable data={registrations} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
