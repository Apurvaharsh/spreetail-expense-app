import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

function SettlementDetailModal({ isOpen, onClose, onSuccess, settlement }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (isOpen && settlement) {
      fetchDetails();
    }
  }, [isOpen, settlement]);

  async function fetchDetails() {
    try {
      const res = await api.get(`/settlements/${settlement.id}`);
      setDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch settlement details:", err);
    }
  }

  if (!isOpen || !settlement) return null;

  const handleRecordPayment = async () => {
    setLoading(true);
    try {
      await api.post(`/settlements/${settlement.id}/settle`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ zIndex: 9999 }}>
      <div className="bg-surface w-full max-w-[400px] rounded-xl shadow-lg border border-outline-variant overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-md border-b border-surface-container-high bg-surface-container-lowest">
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Settlement Details
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="p-lg flex flex-col gap-lg text-center overflow-y-auto max-h-[80vh]">
          <div className="flex items-center justify-center gap-md">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant font-bold flex items-center justify-center text-xl mb-xs">
                {settlement.from ? settlement.from.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="font-body-sm font-semibold">{settlement.from}</span>
              <span className="font-label-sm text-on-surface-variant">Debtor</span>
            </div>
            
            <div className="flex flex-col items-center text-primary px-sm">
              <span className="font-mono text-xl font-bold mb-xs">
                ₹{settlement.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xl mb-xs">
                {settlement.to ? settlement.to.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="font-body-sm font-semibold">{settlement.to}</span>
              <span className="font-label-sm text-on-surface-variant">Creditor</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md text-left">
            <h3 className="font-label-md text-on-surface mb-sm">Why?</h3>
            <p className="font-body-sm text-on-surface-variant mb-md">
              Contributing expenses where {settlement.to} paid and {settlement.from} participated:
            </p>
            {details ? (
              <div className="flex flex-col gap-sm">
                {details.contributingExpenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-surface-container-high pb-xs last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">{exp.description}</span>
                      <span className="text-xs text-on-surface-variant">{new Date(exp.date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-mono font-medium text-on-surface">₹{exp.share.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                ))}
                {details.contributingExpenses.length === 0 && (
                  <p className="text-sm text-on-surface-variant italic">No direct expenses found. This debt is the result of transitive debt simplification across the group.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Loading details...</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-sm p-md border-t border-surface-container-high bg-surface-container-lowest">
          <button 
            type="button" 
            onClick={onClose}
            className="px-md py-sm font-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          {settlement.status !== "SETTLED" && (
            <button 
              onClick={handleRecordPayment}
              disabled={loading}
              className="px-lg py-sm bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-xs disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Payment"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SettlementDetailModal;
