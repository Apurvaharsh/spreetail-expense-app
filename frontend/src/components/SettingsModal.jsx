import React from "react";
import { useNavigate } from "react-router-dom";

function SettingsModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-surface border border-outline-variant rounded-2xl shadow-xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-xl py-lg border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-display text-display text-on-surface">Settings</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-xl space-y-xl">
          
          {/* SECTION 1: IMPORT PREFERENCES */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md pb-xs border-b border-surface-container-high">Import Preferences</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Base Currency</span>
                <span className="font-body-md font-medium text-on-surface">INR</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">USD Conversion Rate</span>
                <span className="font-body-md font-medium text-on-surface">83</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Critical Anomalies</span>
                <span className="font-body-md font-medium text-primary">ON</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Duplicate Detection</span>
                <span className="font-body-md font-medium text-on-surface">Medium</span>
              </div>
            </div>
          </section>

          {/* SECTION 2: RECONCILIATION RULES */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md pb-xs border-b border-surface-container-high">Reconciliation Rules</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Settlement Strategy</span>
                <span className="font-body-md font-medium text-on-surface">Debt Simplification</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Membership Handling</span>
                <span className="font-body-md font-medium text-on-surface">Date Aware</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Foreign Currency</span>
                <span className="font-body-md font-medium text-on-surface">Auto Convert</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Negative Amounts</span>
                <span className="font-body-md font-medium text-on-surface">Refund Handling</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: SYSTEM INFORMATION */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md pb-xs border-b border-surface-container-high">System Information</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Application</span>
                <span className="font-body-md font-medium text-on-surface">SplitWise Lite</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Version</span>
                <span className="font-body-md font-medium text-on-surface">1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Imported Expenses</span>
                <span className="font-body-md font-medium text-on-surface">42</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Detected Anomalies</span>
                <span className="font-body-md font-medium text-on-surface">15</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="font-body-md text-on-surface-variant">Generated Settlements</span>
                <span className="font-body-md font-medium text-on-surface">5</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="px-xl py-lg border-t border-surface-container-high bg-surface-container-lowest flex justify-end">
          <button 
            onClick={handleLogout}
            className="bg-error hover:bg-error/90 text-surface font-label-md text-label-md py-sm px-lg rounded-lg transition-colors flex items-center gap-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
