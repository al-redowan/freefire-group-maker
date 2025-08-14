import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-24">
                    <div className="flex items-center space-x-3">
                         <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-white">Esports Team Analyzer</h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;