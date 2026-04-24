import { X, Command, CornerDownLeft, Search, LogOut } from 'lucide-react';
import Modal from './ui/Modal';

export default function ShortcutsHelpModal({ isOpen, onClose }) {
  const shortcutGroups = [
    {
      title: 'Navigation',
      shortcuts: [
        { key: '/', label: 'Focus Search', icon: Search },
        { key: '?', label: 'Show this help', icon: Command },
        { key: 'Esc', label: 'Close current modal / dropdown' }
      ]
    },
    {
      title: 'Admin actions',
      shortcuts: [
        { key: 'Cmd/Ctrl + S', label: 'Save listing (form dirty only)' }
      ]
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="space-y-6 py-2">
        {shortcutGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {group.title}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((s, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between group">
                  <span className="text-sm font-bold text-slate-600 group-hover:text-primary-navy transition-colors">
                    {s.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-50 border-2 border-slate-100 rounded-lg text-[10px] font-black text-primary-navy shadow-sm uppercase">
                      {s.key}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
