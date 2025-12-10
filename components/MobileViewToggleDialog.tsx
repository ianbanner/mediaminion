
import React from 'react';
import Button from './Button.tsx';

interface MobileViewToggleDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const MobileViewToggleDialog: React.FC<MobileViewToggleDialogProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-6 animate-fade-in-fast">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-6 max-w-sm text-center">
        <h3 className="text-xl font-bold text-white mb-2">Switch to Mobile Companion?</h3>
        <p className="text-gray-300 text-sm mb-6">
          It looks like you're on a small screen. The Mobile Companion mode is optimized for capturing ideas on the go.
        </p>
        <div className="flex flex-col gap-3">
            <Button onClick={onConfirm} className="bg-teal-600 hover:bg-teal-500 w-full py-3">
                Yes, Open Companion Mode
            </Button>
            <button onClick={onCancel} className="text-gray-400 text-sm hover:text-white underline py-2">
                No, stay in Desktop View
            </button>
        </div>
      </div>
    </div>
  );
};

export default MobileViewToggleDialog;
