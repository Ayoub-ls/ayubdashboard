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
  let bgClass = 'bg-slate-800 border-slate-700';
  let Icon = Info;
  let textColor = 'text-slate-200';

  if (type === 'success') {
    bgClass = 'bg-emerald-600/90 border-emerald-500 backdrop-blur-md shadow-emerald-950/20';
    Icon = CheckCircle2;
    textColor = 'text-white';
  } else if (type === 'grey') {
    bgClass = 'bg-slate-800/95 border-slate-700 backdrop-blur-md shadow-slate-950/20';
    Icon = Info;
    textColor = 'text-slate-300';
  } else if (type === 'error') {
    bgClass = 'bg-rose-600/90 border-rose-500 backdrop-blur-md shadow-rose-950/20';
    Icon = AlertCircle;
    textColor = 'text-white';
  }

  return (
    <div 
      id="custom-toast"
      className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${bgClass} ${textColor} shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in max-w-sm pointer-events-auto`}
    >
      <div className="bg-white/10 p-1.5 rounded-xl shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 pr-1 font-medium text-xs leading-relaxed text-right md:text-sm">
        {message}
      </div>

      <button 
        onClick={onClose}
        className="text-white/60 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
