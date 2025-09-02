import React, { useState, useMemo, useCallback } from 'react';
import type { TeamRegistration, AnalysisResult, ExtractedTeamPreview, ExtractedTeam } from './types';
import { analyzeTeamNames, extractTeamsFromFileContent } from './services/geminiService';
import Header from './components/Header';
import StatCard from './components/StatCard';
import AnalysisCard from './components/AnalysisCard';
import DataTable from './components/DataTable';
import GroupingCard from './components/GroupingCard';
import ExtractionPreviewModal from './components/ExtractionPreviewModal';
import Footer from './components/Footer';

// Simple CSV parser
const parseCSV = (csv: string): TeamRegistration[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
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

    // Check if essential columns are present
    if (colMap.teamName === -1 || colMap.email === -1) {
        // Fallback for simple "Team Name,Email" CSV
        if (header.length === 2 && header[0].toLowerCase().includes('team') && header[1].toLowerCase().includes('email')) {
             colMap.teamName = 0;
             colMap.email = 1;
             colMap.timestamp = -1; // Mark others as not present
             colMap.username = -1;
             colMap.joinedWhatsApp = -1;
             colMap.leaderWhatsApp = -1;
        } else {
            throw new Error("CSV must contain 'TEAM NAME' and 'Email' columns.");
        }
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        if (values.length < 2) continue; // Skip malformed lines

        const entry: TeamRegistration = {
            timestamp: colMap.timestamp > -1 ? (values[colMap.timestamp] || '').replace(/"/g, '').trim() : 'N/A',
            username: colMap.username > -1 ? (values[colMap.username] || '').replace(/"/g, '').trim() : 'N/A',
            joinedWhatsApp: colMap.joinedWhatsApp > -1 ? (values[colMap.joinedWhatsApp] || '').replace(/"/g, '').trim() : 'No',
            teamName: (values[colMap.teamName] || '').replace(/"/g, '').trim(),
            leaderWhatsApp: colMap.leaderWhatsApp > -1 ? (values[colMap.leaderWhatsApp] || '').replace(/"/g, '').trim() : 'N/A',
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
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // State for AI extraction feature
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [extractedTeamsPreview, setExtractedTeamsPreview] = useState<ExtractedTeamPreview[]>([]);


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
                            throw new Error("CSV file is empty or could not be parsed correctly. Ensure it contains the required columns.");
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
        e.target.value = '';
    };

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
    
    const handleClearData = () => {
        setRegistrations([]);
        setAnalysisResult(null);
        setAnalysisError(null);
        setUploadError(null);
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    };
    
    const handleSmartFileAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!process.env.API_KEY) {
            setUploadError("Gemini API key is not configured. AI extraction is disabled.");
            return;
        }

        setIsExtracting(true);
        setUploadError(null);
        setExtractionError(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64String = (event.target?.result as string).split(',')[1];
                const extracted = await extractTeamsFromFileContent(base64String, file.type);
                
                // --- Validation Logic ---
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const existingTeamNames = new Set(registrations.map(r => r.teamName.toLowerCase()));
                const existingEmails = new Set(registrations.map(r => r.email.toLowerCase()));
                const seenInUpload = new Set<string>();

                // Fix: Explicitly type `validatedTeams` to prevent TypeScript from widening the `status` property to `string`.
                const validatedTeams: ExtractedTeamPreview[] = extracted.map(team => {
                    const lowerTeamName = team.teamName.toLowerCase();
                    const lowerEmail = team.email.toLowerCase();
                    
                    if (!emailRegex.test(team.email)) {
                        return { ...team, status: 'invalid' };
                    }
                    if (existingTeamNames.has(lowerTeamName) || existingEmails.has(lowerEmail) || seenInUpload.has(lowerTeamName) || seenInUpload.has(lowerEmail)) {
                        return { ...team, status: 'duplicate' };
                    }
                    seenInUpload.add(lowerTeamName);
                    seenInUpload.add(lowerEmail);
                    return { ...team, status: 'new' };
                });
                
                setExtractedTeamsPreview(validatedTeams);
                setIsPreviewModalOpen(true);

            } catch (err) {
                const message = err instanceof Error ? err.message : "An unknown error occurred during AI extraction.";
                setExtractionError(message);
                setUploadError(message); // Also show in the main card
            } finally {
                setIsExtracting(false);
            }
        };
        reader.onerror = () => {
             setUploadError("Failed to read the uploaded file.");
             setIsExtracting(false);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset file input
    };
    
    const handleConfirmAddTeams = () => {
        const newTeams = extractedTeamsPreview
            .filter(team => team.status === 'new')
            .map(team => ({
                teamName: team.teamName,
                email: team.email,
                timestamp: new Date().toISOString(),
                username: 'AI Extract',
                joinedWhatsApp: 'N/A',
                leaderWhatsApp: 'N/A'
            }));
            
        setRegistrations(prev => [...prev, ...newTeams]);
        handleClosePreviewModal();
    };

    const handleClosePreviewModal = () => {
        setIsPreviewModalOpen(false);
        setExtractedTeamsPreview([]);
    };


    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Header />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="space-y-8">
                     <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">Data Source</h2>
                                <p className="text-gray-400 mt-1">
                                    {registrations.length > 0 
                                        ? <>Loaded <span className="font-bold text-indigo-400">{registrations.length}</span> teams.</>
                                        : "No data loaded. Upload a file to begin."}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap justify-center gap-2">
                                <label htmlFor="csv-upload" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 cursor-pointer transition-colors whitespace-nowrap">
                                    {registrations.length > 0 ? 'Replace CSV' : 'Upload CSV'}
                                </label>
                                <input id="csv-upload" type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                                
                                <label htmlFor="smart-upload" className={`relative px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 cursor-pointer transition-colors whitespace-nowrap ${isExtracting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    {isExtracting ? 'Extracting...' : 'Add with AI'}
                                </label>
                                <input id="smart-upload" type="file" accept=".csv,.txt,.pdf,.doc,.docx" className="hidden" onChange={handleSmartFileAdd} disabled={isExtracting} />

                                {registrations.length > 0 && (
                                    <button 
                                        onClick={handleClearData}
                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
                                    >
                                        Clear Data
                                    </button>
                                )}
                            </div>
                        </div>
                        {uploadError && <p className="mt-4 text-sm text-red-400 text-center sm:text-left">{uploadError}</p>}
                    </div>

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

                    <AnalysisCard
                        analysis={analysisResult}
                        isLoading={isAnalyzing}
                        error={analysisError}
                        onAnalyze={handleAnalyze}
                        disabled={registrations.length === 0}
                    />

                    <GroupingCard registrations={registrations} />

                    <DataTable data={registrations} />
                </div>
            </main>
            <Footer />
            <ExtractionPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={handleClosePreviewModal}
                onConfirm={handleConfirmAddTeams}
                previewData={extractedTeamsPreview}
            />
        </div>
    );
};

export default App;