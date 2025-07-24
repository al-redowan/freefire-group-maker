
import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface AnalysisCardProps {
    analysis: AnalysisResult | null;
    isLoading: boolean;
    error: string | null;
    onAnalyze: (instruction: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-white animate-bounce"></div>
    </div>
);

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, isLoading, error, onAnalyze }) => {
    const DEFAULT_INSTRUCTION = "Analyze this list of esports team names. Identify common themes, pick out 3-5 of the most creative names, and give a brief summary of the overall impression of the team names (e.g., aggressive, professional, simple).";
    const [instruction, setInstruction] = useState<string>(DEFAULT_INSTRUCTION);

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-xl font-bold text-white mb-2 sm:mb-0">
                    <span className="text-indigo-400">Gemini</span> Team Name Analysis
                </h2>
                <button
                    onClick={() => onAnalyze(instruction)}
                    disabled={isLoading}
                    className="flex items-center justify-center w-48 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-500/70 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? (
                         <div className="flex items-center">
                            <LoadingSpinner />
                            <span className="ml-2">Analyzing...</span>
                        </div>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-3a1 1 0 00-1-1V6.5a1.5 1.5 0 01-3 0V6a1 1 0 00-1-1H6a1 1 0 01-1-1V3a1 1 0 011-1h3a1 1 0 001-1V1.5a1.5 1.5 0 013 0V2a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-3a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V14a1 1 0 00-1 1h-3a1 1 0 01-1-1v-2a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013-0v.5a1 1 0 001 1h3a1 1 0 011 1v2a1 1 0 01-1 1h-3a1 1 0 00-1-1V17.5a1.5 1.5 0 01-3 0V18a1 1 0 00-1 1H6a1 1 0 01-1-1v-2a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013-0V10a1 1 0 00-1-1H6a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V3.5z" />
                            </svg>
                            Analyze Names
                        </>
                    )}
                </button>
            </div>
            
            <div className="mb-4">
                <label htmlFor="gemini-instruction" className="block text-sm font-medium text-gray-300 mb-2">
                    Analysis Instruction
                </label>
                <textarea
                    id="gemini-instruction"
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 transition-colors disabled:bg-gray-700/50"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Enter your analysis instructions for Gemini..."
                    disabled={isLoading}
                />
            </div>
            
            {error && <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-md mt-4">{error}</div>}
            
            {!analysis && !isLoading && !error && (
                 <div className="text-center py-8 text-gray-400 border-t border-gray-700 mt-4">Adjust the instructions if needed and click "Analyze Names" to generate insights.</div>
            )}

            {analysis && (
                <div className="mt-4 pt-4 border-t border-gray-700 grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-200 mb-2">Common Themes</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.commonThemes.map((theme, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">{theme}</span>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-gray-200 mb-2">Most Creative Names</h3>
                        <ul className="space-y-2">
                           {analysis.mostCreativeNames.map((name, index) => (
                               <li key={index} className="flex items-center text-gray-300">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                   </svg>
                                   {name}
                               </li>
                           ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-lg text-gray-200 mb-2">Summary</h3>
                        <p className="text-gray-400 bg-gray-900/50 p-4 rounded-md border border-gray-700">{analysis.analysisSummary}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisCard;
