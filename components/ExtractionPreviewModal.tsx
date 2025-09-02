
import React, { useMemo } from 'react';
import type { ExtractedTeamPreview } from '../types';

interface ExtractionPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    previewData: ExtractedTeamPreview[];
}

const StatusBadge: React.FC<{ status: 'new' | 'duplicate' | 'invalid' }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
    switch (status) {
        case 'new':
            return <span className={`${baseClasses} bg-green-800 text-green-200`}>New</span>;
        case 'duplicate':
            return <span className={`${baseClasses} bg-yellow-800 text-yellow-200`}>Duplicate</span>;
        case 'invalid':
            return <span className={`${baseClasses} bg-red-800 text-red-200`}>Invalid</span>;
        default:
            return null;
    }
};

const ExtractionPreviewModal: React.FC<ExtractionPreviewModalProps> = ({ isOpen, onClose, onConfirm, previewData }) => {
    const summary = useMemo(() => {
        const total = previewData.length;
        const newCount = previewData.filter(t => t.status === 'new').length;
        const duplicateCount = previewData.filter(t => t.status === 'duplicate').length;
        const invalidCount = previewData.filter(t => t.status === 'invalid').length;
        return { total, newCount, duplicateCount, invalidCount };
    }, [previewData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl flex flex-col" style={{maxHeight: '90vh'}}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">AI Extraction Preview</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="p-6 flex-grow overflow-y-auto">
                    {previewData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                             <h3 className="text-lg font-semibold">No Teams Found</h3>
                             <p>The AI could not extract any team and email pairs from the document.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-4 flex flex-wrap justify-around gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-400">Total Found</p>
                                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-400">New Teams</p>
                                    <p className="text-2xl font-bold text-green-300">{summary.newCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-400">Duplicates</p>
                                    <p className="text-2xl font-bold text-yellow-300">{summary.duplicateCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-400">Invalid Emails</p>
                                    <p className="text-2xl font-bold text-red-300">{summary.invalidCount}</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-800 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                                        {previewData.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-700/50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.teamName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end items-center space-x-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={summary.newCount === 0}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-500/70 disabled:cursor-not-allowed"
                    >
                        Confirm Add ({summary.newCount})
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ExtractionPreviewModal;
