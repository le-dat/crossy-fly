
import React from 'react';

interface LogSidebarProps {
  logs: string[];
}

const LogSidebar: React.FC<LogSidebarProps> = ({ logs }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {logs.map((log, i) => (
        <div 
          key={i} 
          className={`text-xs p-2 rounded border-l-2 transition-all duration-300 animate-in slide-in-from-right-4 ${
            i === 0 
              ? 'bg-sky-500/10 border-sky-500 text-sky-200 font-medium' 
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{log}</span>
            {i === 0 && <span className="text-[10px] opacity-50">Just now</span>}
          </div>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-white/20 italic text-sm">
          No logs yet...
        </div>
      )}
    </div>
  );
};

export default LogSidebar;
