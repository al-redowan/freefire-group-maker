
import React, { useState, useMemo, useCallback } from 'react';
import { TeamRegistration, AnalysisResult } from './types';
import { CSV_DATA } from './constants';
import { analyzeTeamNames } from './services/geminiService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import AnalysisCard from './components/AnalysisCard';
import DataTable from './components/DataTable';
import GroupingCard from './components/GroupingCard';

// Simple CSV parser
const parseCSV = (csv: string): TeamRegistration[] => {
    const lines = csv.trim().split('\n');
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

const App: React.FC = () => {
    const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const stats = useMemo(() => {
        const totalTeams = registrations.length;
        const whatsAppYes = registrations.filter(r => r.joinedWhatsApp === 'Yes').length;
        const whatsAppNo = totalTeams - whatsAppYes;
        return { totalTeams, whatsAppYes, whatsAppNo };
    }, [registrations]);

    const processFile = (file: File) => {
        if (file && file.type === "text/csv") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                if (text) {
                    try {
                        const parsedData = parseCSV(text);
                        if(parsedData.length === 0) {
                            throw new Error("CSV file is empty or could not be parsed correctly. Ensure it contains team data.");
                        }
                        setRegistrations(parsedData);
                        setAnalysisResult(null);
                        setAnalysisError(null);
                        setUploadError(null);
                    } catch (err) {
                        setUploadError(err instanceof Error ? err.message : "Failed to parse CSV file.");
                    }
                }
            };
            reader.readAsText(file);
        } else {
            setUploadError("Please upload a valid .csv file.");
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        e.target.value = ''; // Reset file input
    };

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
            processFile(file);
        }
    }, []);

    const handleAnalyze = useCallback(async (instruction: string) => {
        if (!process.env.API_KEY) {
            setAnalysisError("Gemini API key is not configured. Analysis is disabled.");
            return;
        }
        
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        try {
            const teamNames = registrations.map(r => r.teamName).filter(Boolean);
            const result = await analyzeTeamNames(teamNames, instruction);
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [registrations]);
    
    if (registrations.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div 
                        className={`relative w-full max-w-2xl p-10 text-center border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-indigo-400 bg-gray-800/50' : 'border-gray-600'}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-4 text-lg text-gray-300">Drag & drop your CSV file here</p>
                        <p className="mt-1 text-sm text-gray-500">or</p>
                        <label htmlFor="csv-upload" className="mt-4 inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 cursor-pointer transition-colors">
                            Browse Files
                        </label>
                        <input id="csv-upload" type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                        {uploadError && <p className="mt-4 text-sm text-red-400">{uploadError}</p>}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard 
                            title="Total Teams Registered" 
                            value={stats.totalTeams}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
                        />
                        <StatCard 
                            title="Joined WhatsApp Group" 
                            value={stats.whatsAppYes}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                         <StatCard 
                            title="Did Not Join" 
                            value={stats.whatsAppNo}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </div>

                    {/* Gemini Analysis Section */}
                    <AnalysisCard
                        analysis={analysisResult}
                        isLoading={isAnalyzing}
                        error={analysisError}
                        onAnalyze={handleAnalyze}
                    />

                    {/* Tournament Grouping Section */}
                    <GroupingCard registrations={registrations} />

                    {/* Data Table Section */}
                    <DataTable data={registrations} />
                </div>
            </main>
        </div>
    );
};

export default App;
