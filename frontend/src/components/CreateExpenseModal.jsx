import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

function CreateExpenseModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    currency: "INR",
    date: new Date().toISOString().split('T')[0],
    splitType: "EQUAL",
    paidBy: ""
  });
  
  // shares: { [userId]: string_value }
  const [shares, setShares] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      // Reset state when opened
      setFormData({
        description: "",
        amount: "",
        currency: "INR",
        date: new Date().toISOString().split('T')[0],
        splitType: "EQUAL",
        paidBy: ""
      });
      setShares({});
    }
  }, [isOpen]);

  async function fetchMembers() {
    try {
      const res = await api.get("/groups/default/members");
      setMembers(res.data);
      // Initialize shares object
      const initialShares = {};
      res.data.forEach(m => {
        initialShares[m.userId] = "";
      });
      setShares(initialShares);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  }

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShareChange = (userId, value) => {
    setShares({ ...shares, [userId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert("Please enter a description.");
      return;
    }
    
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    if (!formData.date) {
      alert("Please select a date.");
      return;
    }

    if (!formData.paidBy) {
      alert("Please select who paid for this expense.");
      return;
    }

    // Validate splits
    if (formData.splitType === "EXACT") {
      const sum = Object.values(shares).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      if (Math.abs(sum - numAmount) > 0.01) {
        alert(`Exact amounts must sum to ${numAmount}. Current sum is ${sum}.`);
        return;
      }
    } else if (formData.splitType === "PERCENTAGE") {
      const sum = Object.values(shares).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      if (Math.abs(sum - 100) > 0.01) {
        alert(`Percentages must sum to 100. Current sum is ${sum}.`);
        return;
      }
    }

    setLoading(true);
    
    // Format shares payload
    const sharesPayload = Object.entries(shares)
      .map(([userId, value]) => ({ userId, value: parseFloat(value) || 0 }))
      .filter(s => s.value > 0);

    try {
      const payload = {
        description: formData.description,
        amount: numAmount,
        currency: formData.currency,
        date: formData.date,
        splitType: formData.splitType,
        paidById: formData.paidBy,
        shares: sharesPayload
      };

      await api.post("/expenses", payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create expense.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ zIndex: 9999 }}>
      <div className="bg-surface w-full max-w-[500px] rounded-xl shadow-lg border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-md border-b border-surface-container-high bg-surface-container-lowest shrink-0">
          <h2 className="font-headline-md text-headline-md text-on-surface">Create New Expense</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md overflow-y-auto">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Description</label>
            <input 
              name="description"
              value={formData.description}
              onChange={handleChange}
              type="text" 
              className="w-full px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Dinner at Dishoom"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Amount</label>
              <input 
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                type="number" 
                step="0.01"
                min="0"
                className="w-full px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Currency</label>
              <select 
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Date</label>
              <input 
                name="date"
                value={formData.date}
                onChange={handleChange}
                type="date" 
                className="w-full px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Split Type</label>
              <select 
                name="splitType"
                value={formData.splitType}
                onChange={handleChange}
                className="w-full px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="EQUAL">Equally</option>
                <option value="EXACT">Exact Amounts</option>
                <option value="PERCENTAGE">Percentages</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Paid By</label>
            <select 
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="w-full px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="" disabled>Select who paid</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Split Section */}
          {formData.splitType !== "EQUAL" && (
            <div className="mt-xs bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
              <div className="flex justify-between items-center mb-sm">
                <label className="block font-label-sm text-label-sm font-semibold text-on-surface">
                  {formData.splitType === "EXACT" ? "Enter exact amounts" : "Enter percentages"}
                </label>
                <span className="font-label-sm text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                  Sum: {Object.values(shares).reduce((acc, val) => acc + (parseFloat(val) || 0), 0)}
                  {formData.splitType === "PERCENTAGE" ? "%" : ""}
                  {' / '}
                  {formData.splitType === "PERCENTAGE" ? "100%" : (formData.amount || "0")}
                </span>
              </div>
              <div className="flex flex-col gap-sm">
                {members.map(m => (
                  <div key={m.userId} className="flex items-center justify-between gap-sm">
                    <span className="font-body-sm text-on-surface truncate flex-1">{m.user?.name || m.userId}</span>
                    <div className="relative w-[120px]">
                      {formData.splitType === "PERCENTAGE" && (
                        <span className="absolute right-xs top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">%</span>
                      )}
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={shares[m.userId] || ""}
                        onChange={(e) => handleShareChange(m.userId, e.target.value)}
                        className={`w-full px-sm py-xs border border-outline-variant rounded bg-surface text-on-surface font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${formData.splitType === "PERCENTAGE" ? "pr-[24px]" : ""}`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-sm mt-sm pt-md border-t border-surface-container-high shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-lg py-sm font-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-lg py-sm bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-xs disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default CreateExpenseModal;
