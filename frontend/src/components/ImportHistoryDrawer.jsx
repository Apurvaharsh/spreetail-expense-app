import React from "react";
import { useNavigate } from "react-router-dom";

function ImportHistoryDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleImportClick = () => {
    onClose();
    navigate('/anomalies');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-surface w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-xl py-lg border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-display text-display text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">history</span>
            Import History
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-md space-y-md bg-background">
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-md">history</span>
            <p className="font-body-md text-on-surface-variant">No import history available.</p>
            <p className="font-body-sm text-on-surface-variant opacity-70 mt-xs">Import a CSV to see it here.</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ImportHistoryDrawer;
