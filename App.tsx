
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { TEAMS_DATA, GroupIcon, CheckCircleIcon, XCircleIcon, WandIcon, ListBulletIcon, DocumentArrowUpIcon, UserPlusIcon } from './constants';
import { Team, SortConfig, SortKey } from './types';
import StatCard from './components/StatCard';
import TeamTable from './components/TeamTable';
import AnalysisModal from './components/AnalysisModal';
import GroupDisplay from './components/GroupDisplay';
import { analyzeTeamNames } from './services/geminiService';
import Footer from './components/Footer';

interface ImportCardProps {
  onImport: (file: File) => Promise<void>;
}

const ImportCard: React.FC<ImportCardProps> = ({ onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setFeedback(null);
    }
  };

  const handleImportClick = async () => {
    if (!selectedFile) {
      setFeedback({ type: 'error', message: 'Please select a file first.' });
      return;
    }
    setIsImporting(true);
    setFeedback(null);
    try {
      await onImport(selectedFile);
      setFeedback({ type: 'success', message: `Successfully imported teams from ${selectedFile.name}.` });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setFeedback({ type: 'error', message: `Import failed: ${errorMessage}` });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4 flex flex-col">
      <h2 className="text-lg font-semibold text-indigo-400">Import Team List</h2>
      <div className="flex-grow space-y-4">
        <div>
          <label htmlFor="file-upload" className="sr-only">Team File Upload</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <div className="text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-slate-400">
                <p className="relative cursor-pointer rounded-md font-semibold text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 hover:text-indigo-500">
                  <span>{selectedFile ? selectedFile.name : 'Upload a file'}</span>
                  <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, .txt, text/plain, text/csv" />
                </p>
                {!selectedFile && <p className="pl-1">or drag and drop</p>}
              </div>
              <p className="text-xs leading-5 text-slate-500">CSV or TXT</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">CSV: Auto-detects 'Team Name', 'Email', & 'Whatsapp' columns. TXT: A list of team names. Group headers and list markers (e.g., "1.", "*") are automatically ignored.</p>
        </div>
        {feedback && (
          <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
            {feedback.message}
          </div>
        )}
      </div>
      <button
        onClick={handleImportClick}
        disabled={isImporting || !selectedFile}
        className="w-full mt-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
        aria-label="Import selected team list file"
      >
        <DocumentArrowUpIcon className="w-5 h-5" />
        <span>{isImporting ? 'Importing...' : 'Import Teams'}</span>
      </button>
    </div>
  );
};

const ManualAddCard: React.FC<{ onAddTeam: (team: Omit<Team, 'id'>) => void }> = ({ onAddTeam }) => {
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setFeedback({ type: 'error', message: 'Team Name is required.' });
      return;
    }

    onAddTeam({
      name: teamName.trim(),
      email: email.trim() || 'N/A',
      leaderWhatsapp: whatsapp.trim() || 'N/A',
    });

    setFeedback({ type: 'success', message: `Team "${teamName.trim()}" added successfully.` });
    setTeamName('');
    setEmail('');
    setWhatsapp('');

    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4 flex flex-col">
      <h2 className="text-lg font-semibold text-indigo-400">Add Team Manually</h2>
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-slate-300 mb-1">Team Name</label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Phantom Gamers"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email (Optional)</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="team.leader@example.com"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-300 mb-1">WhatsApp (Optional)</label>
          <input
            type="text"
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="01234567890"
          />
        </div>
        {feedback && (
          <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>
            {feedback.message}
          </div>
        )}
        <div className="flex-grow" />
        <button
          type="submit"
          className="w-full mt-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed"
          aria-label="Add new team"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Add Team</span>
        </button>
      </form>
    </div>
  );
};


const App: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>(TEAMS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });
  
  const [analysisInstruction, setAnalysisInstruction] = useState('Analyze this list of esports team names. Identify common themes, potential origins (e.g., pop culture, mythology), and overall sentiment (e.g., aggressive, cool, funny). Provide a summary of your findings.');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [teamsPerGroup, setTeamsPerGroup] = useState(12);
  const [generatedGroups, setGeneratedGroups] = useState<Team[][]>([]);
  const [quickGroupNames, setQuickGroupNames] = useState('');

  const teamsWithWhatsapp = useMemo(() => teams.filter(t => t.leaderWhatsapp && t.leaderWhatsapp !== 'N/A').length, [teams]);

  const filteredTeams = useMemo(() => {
    let sortableItems = [...teams];
    if (searchQuery) {
        sortableItems = sortableItems.filter(team =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.leaderWhatsapp.includes(searchQuery) ||
            team.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [teams, searchQuery, sortConfig]);

  const requestSort = useCallback((key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handleAnalyzeNames = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    setIsAnalysisModalOpen(true);
    const result = await analyzeTeamNames(teams, analysisInstruction);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };
  
  const handleGenerateGroups = () => {
    let sourceTeams: Team[];

    const quickGroupNamesTrimmed = quickGroupNames.trim();
    if (quickGroupNamesTrimmed !== '') {
        const names = quickGroupNamesTrimmed.split(/\r?\n/).filter(name => name.trim() !== '');
        sourceTeams = names.map((name, index) => ({ 
            id: index,
            name: name.trim(), 
            email: 'N/A', 
            leaderWhatsapp: 'N/A' 
        }));
    } else {
        sourceTeams = teams;
    }
    
    if (sourceTeams.length === 0) {
        setGeneratedGroups([]);
        return;
    }
    
    const shuffled = [...sourceTeams].sort(() => 0.5 - Math.random());
    
    const newGroups: Team[][] = [];
    if (teamsPerGroup > 0) {
      for (let i = 0; i < shuffled.length; i += teamsPerGroup) {
          const chunk = shuffled.slice(i, i + teamsPerGroup);
          newGroups.push(chunk);
      }
    }
    setGeneratedGroups(newGroups);
  };

  const handleImportTeams = useCallback(async (file: File) => {
    const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    };
      
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            throw new Error("File is empty.");
          }

          let newTeams: Team[] = [];
          
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length === 0) {
              throw new Error("CSV file is empty.");
            }
            
            const headerParts = parseCsvLine(lines[0].toLowerCase());
            
            const nameSynonyms = ['team name', 'name', 'team', 'teamname'];
            const whatsappSynonyms = ['leader whatsapp', 'whatsapp', 'phone', 'contact', 'whatsapp number'];
            const emailSynonyms = ['email', 'mail', 'email address'];

            let nameIndex = headerParts.findIndex(h => nameSynonyms.some(s => h.includes(s)));
            let whatsappIndex = headerParts.findIndex(h => whatsappSynonyms.some(s => h.includes(s)));
            let emailIndex = headerParts.findIndex(h => emailSynonyms.some(s => h.includes(s)));
            
            const hasHeader = nameIndex !== -1;
            const dataLines = hasHeader ? lines.slice(1) : lines;

            if (!hasHeader) {
                nameIndex = 0;
                emailIndex = 1;
                whatsappIndex = 2;
            }

            newTeams = dataLines
              .filter(line => line.trim() !== '')
              .map((line, index) => {
                const parts = parseCsvLine(line);
                
                const name = parts[nameIndex]?.trim() || `Unnamed Team ${index + 1}`;
                const email = (emailIndex !== -1 && parts[emailIndex]?.trim()) ? parts[emailIndex].trim() : 'N/A';
                const leaderWhatsapp = (whatsappIndex !== -1 && parts[whatsappIndex]?.trim()) ? parts[whatsappIndex].trim() : 'N/A';
                
                return { id: index + 1, name, leaderWhatsapp, email };
            });

          } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
              const lines = content.split(/\r?\n/);
              newTeams = lines
                .map(line => line.trim()) // Clean up whitespace
                .filter(line => line && !line.toLowerCase().startsWith('group ')) // Remove empty lines & group headers
                .map(line => line.replace(/^\s*\d+[\.\)]\s*/, '').replace(/^\s*[\*\-]\s*/, '').trim()) // Remove common list markers
                .filter(name => name) // Filter out lines that were only markers
                .map((name, index) => ({ // Convert to Team objects
                  id: index + 1,
                  name,
                  leaderWhatsapp: 'N/A',
                  email: 'N/A'
                }));
          } else {
            throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please use .csv or .txt.`);
          }

          if (newTeams.length === 0) {
            throw new Error("No teams could be parsed from the file.");
          }
          
          setTeams(newTeams);
          setGeneratedGroups([]);
          setSearchQuery('');
          resolve();
        } catch (error) {
          console.error("Error parsing file:", error);
          reject(error);
        }
      };

      reader.onerror = (e) => {
        console.error("Error reading file:", e);
        reject(new Error("Failed to read the file."));
      };

      reader.readAsText(file);
    });
  }, []);
  
  const handleAddTeam = useCallback((newTeamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
        id: Date.now(), // Simple unique ID
        ...newTeamData,
    };
    setTeams(prevTeams => [newTeam, ...prevTeams]);
  }, []);


  return (
    <div className="min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8 flex flex-col">
      <main className="max-w-7xl mx-auto flex-grow w-full">
        <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                Esports Team Analyzer
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                Manage your team lists, generate tournament groups, and use Gemini to get insights into team names.
            </p>
        </header>

        {/* Stats section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<ListBulletIcon className="w-6 h-6" />} title="Total Teams Registered" value={teams.length} />
            <StatCard icon={<CheckCircleIcon className="w-6 h-6" />} title="Joined WhatsApp Group" value={teamsWithWhatsapp} />
            <StatCard icon={<XCircleIcon className="w-6 h-6" />} title="Did Not Join" value={teams.length - teamsWithWhatsapp} />
        </section>
        
        {/* Tools section */}
        <section className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImportCard onImport={handleImportTeams} />
                <ManualAddCard onAddTeam={handleAddTeam} />

                {/* Gemini Analysis Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4 flex flex-col">
                  <h2 className="text-lg font-semibold text-indigo-400">Gemini Name Analysis</h2>
                  <div className="flex-grow">
                      <label htmlFor="analysis-instruction" className="block text-sm font-medium text-slate-300 mb-2">Analysis Instruction:</label>
                      <textarea
                          id="analysis-instruction"
                          rows={4}
                          value={analysisInstruction}
                          onChange={(e) => setAnalysisInstruction(e.target.value)}
                          className="w-full bg-slate-900 border-slate-600 rounded-md p-3 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Analyze for aggressive names..."
                      />
                  </div>
                  <button
                      onClick={handleAnalyzeNames}
                      disabled={isAnalyzing}
                      className="w-full mt-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
                  >
                      <WandIcon className="w-5 h-5" />
                      <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}</span>
                  </button>
                </div>

                {/* Group Generation Card */}
                 <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4 flex flex-col">
                    <h2 className="text-lg font-semibold text-indigo-400">Tournament Grouping</h2>
                    <div className="flex-grow space-y-4">
                      <div>
                        <label htmlFor="quick-group-names" className="block text-sm font-medium text-slate-300 mb-2">Quick Grouping (Names Only):</label>
                        <textarea
                          id="quick-group-names"
                          rows={4}
                          value={quickGroupNames}
                          onChange={(e) => setQuickGroupNames(e.target.value)}
                          className="w-full bg-slate-900 border-slate-600 rounded-md p-3 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Paste one team name per line. If empty, the main list below will be used."
                        />
                      </div>
                      <div>
                          <label htmlFor="teams-per-group" className="block text-sm font-medium text-slate-300">Teams per group</label>
                          <input
                              type="number"
                              id="teams-per-group"
                              value={teamsPerGroup}
                              onChange={(e) => setTeamsPerGroup(Math.max(1, parseInt(e.target.value) || 1))}
                              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white"
                          />
                      </div>
                    </div>
                    <button
                        onClick={handleGenerateGroups}
                        className="w-full mt-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                    >
                       <GroupIcon className="w-5 h-5" />
                        <span>Generate Groups</span>
                    </button>
                </div>
            </div>
        </section>

        {/* Search and Team List Section */}
        <section>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                  <h3 className="text-xl font-bold text-white">Team Roster</h3>
                  <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, email, or whatsapp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-500">
                              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                          </svg>
                      </div>
                </div>
            </div>
            
            <TeamTable teams={filteredTeams} sortConfig={sortConfig} requestSort={requestSort} />
        </section>

        {/* Generated Groups */}
        {generatedGroups.length > 0 && (
          <section className="mt-8">
            <GroupDisplay groups={generatedGroups} />
          </section>
        )}

        <AnalysisModal
            isOpen={isAnalysisModalOpen}
            onClose={() => setIsAnalysisModalOpen(false)}
            title="Gemini Name Analysis"
            content={analysisResult}
            isLoading={isAnalyzing}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
