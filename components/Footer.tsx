import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 flex-shrink-0">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Esports Team Analyzer. All rights reserved.</p>
                <p className="mt-1">Powered with <span role="img" aria-label="sparkles">✨</span> by Gemini AI</p>
            </div>
        </footer>
    );
};

export default Footer;