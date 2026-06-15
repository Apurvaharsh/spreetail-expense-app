import React from "react";

function ProjectDocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const docs = [
    {
      title: "README",
      description: "Project Overview and setup instructions.",
      icon: "menu_book"
    },
    {
      title: "SCOPE",
      description: "Application requirements and boundaries.",
      icon: "radar"
    },
    {
      title: "DECISIONS",
      description: "Architecture and design choices log.",
      icon: "architecture"
    },
    {
      title: "AI_USAGE",
      description: "Details on AI code generation tools used.",
      icon: "smart_toy"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-surface border border-outline-variant rounded-2xl shadow-xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-xl py-lg border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-display text-display text-on-surface">Project Documentation</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-xl bg-background">
          <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
            Quickly access internal documentation for technical interviewers or onboarding developers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {docs.map((doc, idx) => (
              <div key={idx} className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-sm mb-md text-primary">
                  <span className="material-symbols-outlined text-[24px]">{doc.icon}</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{doc.title}</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex-1 mb-lg">
                  {doc.description}
                </p>
                <button 
                  className="w-full py-sm border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProjectDocsModal;
