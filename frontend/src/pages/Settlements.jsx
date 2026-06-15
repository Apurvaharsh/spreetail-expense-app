import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SettlementDetailModal from "../components/SettlementDetailModal";
import TopNav from "../components/TopNav";

function Settlements() {
  const [tab, setTab] = useState("PENDING");
  const [settlements, setSettlements] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSettlements();
  }, [tab]);

  async function fetchSettlements() {
    try {
      const res = await api.get(`/settlements?status=${tab}`);
      if (tab === "PENDING") {
        setSettlements(res.data.data);
        setMeta(res.data.meta);
      } else {
        setSettlements(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSettle = async (id) => {
    try {
      await api.post(`/settlements/${id}/settle`);
      fetchSettlements(); // Refresh
    } catch (err) {
      console.error(err);
      alert("Failed to settle");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  let reductionPercentage = 0;
  if (meta && meta.rawTransactions > 0) {
    reductionPercentage = Math.round(((meta.rawTransactions - meta.simplifiedTransactions) / meta.rawTransactions) * 100);
  }

  const filteredSettlements = settlements.filter(s => 
    s.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex antialiased">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full py-lg fixed left-0 top-0 w-[240px] bg-inverse-surface dark:bg-surface-container-lowest shadow-lg z-50">
        <div className="px-lg mb-xl flex items-center gap-sm">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary" data-icon="receipt_long">receipt_long</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-surface dark:text-on-surface">SplitWise Lite</h1>
            <p className="font-label-sm text-label-sm text-surface-variant dark:text-on-surface-variant opacity-70">Expense Engine</p>
          </div>
        </div>
        <div className="px-sm mb-lg">
          <Link to="/expenses" className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-sm px-md rounded-lg flex items-center justify-center gap-sm transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            New Expense
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-sm space-y-xs">
          <Link to="/" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]" data-icon="dashboard">dashboard</span>
            Dashboard
          </Link>
          <Link to="/expenses" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]" data-icon="receipt_long">receipt_long</span>
            Expenses
          </Link>
          <Link to="/settlements" className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container border-l-4 border-primary-fixed font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]" data-icon="handshake">handshake</span>
            Settlements
          </Link>
          <Link to="/import" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]" data-icon="upload_file">upload_file</span>
            Import CSV
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-sm px-md py-sm rounded-lg text-error opacity-80 hover:bg-error/10 transition-all font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </nav>

      <SettlementDetailModal 
        isOpen={!!selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
        onSuccess={() => { setSelectedSettlement(null); fetchSettlements(); }}
        settlement={selectedSettlement}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-w-0">
        <TopNav 
          title="Settlements"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search Person..."
        />

        {/* Canvas */}
        <main className="flex-1 p-gutter overflow-y-auto max-w-container-max mx-auto w-full">
          <div className="mb-xl flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Pending Settlements</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Review and resolve outstanding balances.</p>
            </div>
            <div className="flex gap-sm">
              <button className="h-[32px] px-md rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md bg-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs shadow-sm">
                <span className="material-symbols-outlined text-[16px]" data-icon="filter_list">filter_list</span>
                Filter
              </button>
            </div>
          </div>

          {/* Simplification Banner */}
          {tab === "PENDING" && meta && (
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-md mb-lg flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0 mt-xs">
                <span className="material-symbols-outlined text-[#047857] text-[18px]" data-icon="auto_awesome">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-[#064e3b] font-bold mb-xs">Settlement Simplification Active</h3>
                <p className="font-body-sm text-body-sm text-[#065f46]">
                  {meta.simplifiedTransactions} settlements generated from group expenses.
                  Debt simplification reduced {meta.rawTransactions} transfers to {meta.simplifiedTransactions} transfers ({reductionPercentage}% reduction).
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-outline-variant mb-lg flex gap-lg">
            <button 
              onClick={() => setTab("PENDING")}
              className={`pb-sm border-b-2 font-label-md text-label-md px-xs transition-colors ${tab === "PENDING" ? "border-primary text-primary font-bold" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setTab("HISTORY")}
              className={`pb-sm border-b-2 font-label-md text-label-md px-xs transition-colors ${tab === "HISTORY" ? "border-primary text-primary font-bold" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
            >
              History
            </button>
          </div>

          {/* Settlement Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
            {filteredSettlements.map((settlement, idx) => (
              <div key={idx} className="bg-surface rounded-lg border border-outline-variant p-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-md">
                  <div className="flex items-center gap-sm">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-surface bg-tertiary flex items-center justify-center text-white font-label-sm text-label-sm z-10">{settlement.from.charAt(0).toUpperCase()}</div>
                      <div className="w-8 h-8 rounded-full border-2 border-surface bg-secondary flex items-center justify-center text-white font-label-sm text-label-sm z-0">{settlement.to.charAt(0).toUpperCase()}</div>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        {tab === "PENDING" ? `${settlement.from} owes ${settlement.to}` : `${settlement.from} paid ${settlement.to}`}
                      </p>
                      {tab === "HISTORY" && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Settled on {new Date(settlement.settledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-sm py-xs rounded-full bg-surface-container-low text-primary font-mono text-mono font-bold">
                    ₹{settlement.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                </div>
                {tab === "PENDING" && (
                  <>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded p-sm mb-lg">
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px]" data-icon="receipt">receipt</span>
                        Includes consolidated group expenses
                      </p>
                    </div>
                    <div className="flex justify-end gap-sm">
                      <button onClick={() => setSelectedSettlement(settlement)} className="h-[32px] px-md rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md transition-colors">Details</button>
                      <button onClick={() => handleSettle(settlement.id)} className="h-[32px] px-md rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Mark as Settled</button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filteredSettlements.length === 0 && (
              <div className="col-span-full text-center text-on-surface-variant py-xl">
                {settlements.length === 0 ? (tab === "PENDING" ? "No pending settlements at this time. Everyone is all caught up!" : "No settlement history yet.") : "No settlements match your search."}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settlements;
