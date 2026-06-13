import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  // Determine styling based on type
  let borderClass = 'border-l-4 border-slate-400';
  let Icon = Info;
  let iconColor = 'text-slate-500';

  if (type === 'success') {
    borderClass = 'border-l-4 border-green-500';
    Icon = CheckCircle2;
    iconColor = 'text-green-500';
  } else if (type === 'grey') {
    borderClass = 'border-l-4 border-slate-400';
    Icon = Info;
    iconColor = 'text-slate-400';
  } else if (type === 'error') {
    borderClass = 'border-l-4 border-red-500';
    Icon = AlertCircle;
    iconColor = 'text-red-500';
  }

  return (
    <div 
      id="custom-toast"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-lg bg-white ${borderClass} text-slate-800 shadow-lg max-w-sm pointer-events-auto border border-slate-200`}
    >
      <div className={`shrink-0 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 pr-1 font-medium text-xs leading-relaxed text-right md:text-sm text-slate-700">
        {message}
      </div>

      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
