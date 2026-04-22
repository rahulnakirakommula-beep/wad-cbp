import { useState, useEffect } from 'react';
import ContentRenderer from './ContentRenderer';

export default function SplitPaneEditor({ value, onChange, placeholder = "Start writing...", previewClass = "" }) {
  const [activeTab, setActiveTab] = useState('write'); // mobile/tablet only

  return (
    <div className="flex flex-col h-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-inner">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-slate-100 bg-white p-2">
        <button 
          onClick={() => setActiveTab('write')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'write' ? 'bg-primary-navy text-white shadow-lg' : 'text-slate-400'}`}
        >
          Editor
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'preview' ? 'bg-primary-navy text-white shadow-lg' : 'text-slate-400'}`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Editor Pane */}
        <div className={`
          flex-1 min-h-0 border-r border-slate-100 bg-white
          ${activeTab === 'write' ? 'block' : 'hidden lg:block'}
        `}>
          <textarea
            className="w-full h-full p-8 sm:p-12 text-base font-medium text-slate-700 leading-relaxed bg-transparent border-none focus:ring-0 resize-none no-scrollbar placeholder:italic placeholder:text-slate-200"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck="false"
          />
        </div>

        {/* Preview Pane */}
        <div className={`
          flex-1 min-h-0 overflow-y-auto p-8 sm:p-12 bg-slate-50/50
          ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}
          ${previewClass}
        `}>
          {value ? (
            <ContentRenderer content={value} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-2xl mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Live Preview Ready</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="px-8 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300">
        <div className="flex gap-4">
          <span>{value?.length || 0} characters</span>
          <span>{value?.split(/\s+/).filter(Boolean).length || 0} words</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          <span>Real-time Sync Active</span>
        </div>
      </div>
    </div>
  );
}
