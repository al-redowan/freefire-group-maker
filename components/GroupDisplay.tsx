
import React, { useState } from 'react';
import { Team } from '../types';
import { ClipboardIcon, CheckIcon } from '../constants';

interface GroupDisplayProps {
  groups: Team[][];
}

const GroupDisplay: React.FC<GroupDisplayProps> = ({ groups }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (groups.length === 0) {
    return null;
  }

  const formatGroupText = (group: Team[], groupIndex: number): string => {
    const groupLetter = String.fromCharCode(65 + groupIndex);
    const header = `☄ GROUP ${groupLetter} ☄\n`;
    const teamLines = group.map((team, index) => `${index + 1}. ${team.name}`).join('\n');
    const emailHeader = '\n\nTeam Emails:\n\n';
    const emails = group.map(team => team.email).filter(email => email && email !== 'N/A').join(', ');
    
    return `${header}${teamLines}${emailHeader}${emails}`;
  };

  const handleCopy = (group: Team[], index: number) => {
    const textToCopy = formatGroupText(group, index);
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="mt-8 space-y-6">
       <h3 className="text-xl font-bold text-white">Generated Groups Output</h3>
       <p className="text-slate-400">The following text blocks are formatted for easy copying and pasting into announcements.</p>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group, index) => (
          <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col space-y-3 relative">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-indigo-400">
                  Group {String.fromCharCode(65 + index)}
                </h4>
                <button
                    onClick={() => handleCopy(group, index)}
                    className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                >
                    {copiedIndex === index ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-4 h-4" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <textarea
              readOnly
              rows={Math.min(15, group.length + 5)}
              className="w-full bg-slate-900 border-slate-600 rounded-md p-3 text-sm text-slate-300 font-mono resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={formatGroupText(group, index)}
            />
          </div>
        ))}
       </div>
    </div>
  );
};

export default GroupDisplay;
