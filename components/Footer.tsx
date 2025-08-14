import React, { useState } from 'react';
import { BriefcaseIcon, FacebookIcon, GithubIcon, GlobeIcon, InstagramIcon, MailIcon, SendIcon } from '../constants';
import HireMeModal from './HireMeModal';

const Footer: React.FC = () => {
  const [isHireFormOpen, setIsHireFormOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900/50 border-t border-purple-500/20 mt-16 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-white">ESports Team Analyzer</h3>
              <p className="text-slate-400 text-sm">
                A powerful tool for managing esports team data, generating groups, and organizing tournaments with ease.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-white">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• CSV &amp; TXT file parsing</li>
                <li>• Manual team entry</li>
                <li>• Team group generation</li>
                <li>• Gemini-powered name analysis</li>
                <li>• Data sorting and search</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-white">Developer</h4>
              <div className="space-y-3">
                <p className="text-slate-400 text-sm font-medium">Al Redowan Ahmed Fahim</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://al-redowan.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-300 transition-colors" title="Portfolio">
                    <GlobeIcon className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/al-redowan" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-300 transition-colors" title="GitHub">
                    <GithubIcon className="w-5 h-5" />
                  </a>
                  <a href="https://www.facebook.com/AR.ERROR.404" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-300 transition-colors" title="Facebook">
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                  <a href="https://t.me/Al_redowan" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-300 transition-colors" title="Telegram">
                    <SendIcon className="w-5 h-5" />
                  </a>
                  <a href="https://www.instagram.com/sinister.face0" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-purple-300 transition-colors" title="Instagram">
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                  <a href="mailto:fahimdj071@gmail.com" className="text-slate-400 hover:text-purple-300 transition-colors" title="Email">
                    <MailIcon className="w-5 h-5" />
                  </a>
                </div>
                <button
                  onClick={() => setIsHireFormOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
                >
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  Hire Me
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-6 text-center">
            <p className="text-slate-500 text-sm">© 2024 Al Redowan Ahmed Fahim. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <HireMeModal isOpen={isHireFormOpen} onClose={() => setIsHireFormOpen(false)} />
    </>
  );
};

export default Footer;