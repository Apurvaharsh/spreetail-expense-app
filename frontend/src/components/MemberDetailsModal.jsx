import { useState } from "react";

function MemberDetailsModal({ isOpen, onClose, member }) {
  if (!isOpen || !member) return null;

  const isActive = !member.leftAt;
  const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  const leftDate = member.leftAt ? new Date(member.leftAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Present';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-2xl rounded-xl shadow-lg border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-md border-b border-surface-container-high bg-surface-container-lowest">
          <div className="flex items-center gap-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-headline-md ${isActive ? 'bg-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
              {member.name ? member.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
                {member.name}
                <span className={`px-2 py-[2px] rounded text-[10px] font-semibold tracking-wide uppercase ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isActive ? 'Active' : 'Left Group'}
                </span>
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Member Details</span>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="p-lg flex-1 overflow-y-auto flex flex-col gap-lg bg-surface-container-lowest">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-xs">Participation</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{member.expensesParticipated || 0} Expenses</span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-xs">Total Share</span>
              <span className="font-mono text-lg text-on-surface font-semibold">₹{(member.totalShareAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-xs">Balance</span>
              <span className={`font-mono text-lg font-semibold ${(member.balance || 0) >= 0 ? 'text-green-600' : 'text-error'}`}>
                {(member.balance || 0) >= 0 ? '+' : '-'}₹{Math.abs(member.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-xs">Tenure</span>
              <span className="font-body-sm text-body-sm text-on-surface font-semibold block">{joinedDate}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">to {leftDate}</span>
            </div>
          </div>

          {/* History Table */}
          <div className="border border-outline-variant rounded-lg overflow-hidden">
            <div className="bg-surface-container-high px-md py-sm border-b border-outline-variant font-headline-sm text-on-surface flex justify-between items-center">
              <span>Expense Participation History</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">history</span>
            </div>
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-container-low shadow-sm">
                  <tr className="border-b border-outline-variant">
                    <th className="py-xs px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="py-xs px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Description</th>
                    <th className="py-xs px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Share Amount</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm text-on-surface">
                  {member.history && member.history.length > 0 ? (
                    member.history.map((item, idx) => (
                      <tr key={idx} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                        <td className="py-sm px-md text-on-surface-variant">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-sm px-md font-medium">{item.description}</td>
                        <td className="py-sm px-md text-right font-mono">₹{(item.amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-lg text-center text-on-surface-variant">No participation history available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-sm p-md border-t border-surface-container-high bg-surface-container-lowest">
          <button 
            type="button" 
            onClick={onClose}
            className="px-lg py-sm font-label-md rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberDetailsModal;
