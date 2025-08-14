
import React, { useState } from 'react';
import { DollarSignIcon, MailIcon, MessageSquareIcon, SendIcon, UserIcon, XIcon } from '../constants';

interface HireMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HireMeModal: React.FC<HireMeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subject = `Project Inquiry: ${formData.projectType || "Web Development"}`;
    const body = `Hi Al Redowan,

I'm interested in hiring you for a project. Here are the details:

Name: ${formData.name}
Email: ${formData.email}
Project Type: ${formData.projectType}
Budget: ${formData.budget}
Timeline: ${formData.timeline}

Project Description:
${formData.description}

Looking forward to hearing from you!

Best regards,
${formData.name}`;

    const mailtoLink = `mailto:fahimdj071@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(false);
      onClose();
      setFormData({ name: "", email: "", projectType: "", budget: "", timeline: "", description: "" });
    }, 2000);
  };

  if (!isOpen) return null;

  const selectClasses = "w-full bg-slate-700/50 border border-purple-500/30 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none";
  const inputClasses = "w-full bg-slate-700/50 border border-purple-500/30 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClasses = "text-slate-300 flex items-center gap-2 text-sm";
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <SendIcon className="w-5 h-5 text-purple-400" />
            Hire Al Redowan
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SendIcon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Email Client Opened!</h3>
              <p className="text-slate-400">Your email client should open with the project details pre-filled.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className={labelClasses}>
                    <UserIcon className="w-4 h-4" /> Your Name
                  </label>
                  <input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className={inputClasses} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className={labelClasses}>
                    <MailIcon className="w-4 h-4" /> Email Address
                  </label>
                  <input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className={inputClasses} placeholder="john@example.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="projectType" className={`${labelClasses} mb-2`}>Project Type</label>
                <select id="projectType" value={formData.projectType} onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))} className={selectClasses} required>
                  <option value="" disabled>Select project type</option>
                  <option value="web-app">Web Application</option>
                  <option value="website">Website</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="api">API Development</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="budget" className={`${labelClasses} mb-2`}>
                    <DollarSignIcon className="w-4 h-4" /> Budget Range
                  </label>
                  <select id="budget" value={formData.budget} onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))} className={selectClasses} required>
                    <option value="" disabled>Select budget range</option>
                    <option value="under-1k">Under $1,000</option>
                    <option value="1k-5k">$1,000 - $5,000</option>
                    <option value="5k-10k">$5,000 - $10,000</option>
                    <option value="10k-plus">$10,000+</option>
                    <option value="discuss">Let's Discuss</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="timeline" className={`${labelClasses} mb-2`}>Timeline</label>
                  <select id="timeline" value={formData.timeline} onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))} className={selectClasses} required>
                    <option value="" disabled>Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-3-months">2-3 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className={labelClasses}>
                  <MessageSquareIcon className="w-4 h-4" /> Project Description
                </label>
                <textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className={`${inputClasses} min-h-[120px]`} placeholder="Tell me about your project..." required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? ( "Opening Email Client..." ) : (
                  <>
                    <SendIcon className="w-4 h-4 mr-2" />
                    Send Project Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HireMeModal;
