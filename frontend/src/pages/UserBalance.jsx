import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function UserBalance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const res = await api.get(`/balances/${id}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

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
          <Link to="/" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[20px]" data-icon="dashboard">dashboard</span>
            Dashboard
          </Link>
          <Link to="/expenses" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[20px]" data-icon="receipt_long">receipt_long</span>
            Expenses
          </Link>
          <Link to="/settlements" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[20px]" data-icon="handshake">handshake</span>
            Settlements
          </Link>
          <Link to="/import" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[20px]" data-icon="upload_file">upload_file</span>
            Import CSV
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-sm px-md py-sm rounded-lg text-error opacity-80 hover:bg-error/10 transition-all font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="bg-surface shadow-sm flex justify-between items-center w-full px-lg py-sm h-16 sticky top-0 z-40 border-b border-outline-variant">
          <div className="flex items-center gap-sm w-full max-w-lg">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hidden md:block" data-icon="menu">menu</span>
            <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant ml-sm">
              <Link to="/" className="hover:text-primary cursor-pointer transition-colors">Dashboard</Link>
              <span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span>
              <span className="text-on-surface font-semibold">User Balance</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 p-lg md:p-xl overflow-y-auto w-full bg-surface-container-lowest">
          <div className="max-w-[1024px] mx-auto">
            {/* Header & Back Button */}
            <div className="flex items-center gap-md mb-xl">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-outline-variant hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
              </button>
              <div>
                <h2 className="font-display text-display text-on-surface tracking-tight">Balance Breakdown</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Detailed view of all outstanding expenses</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-xl">
                <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
              </div>
            ) : !data ? (
              <div className="text-center py-xl text-on-surface-variant font-label-lg">No data found.</div>
            ) : (
              <div className="flex flex-col md:flex-row gap-xl items-start">
                
                {/* Left Column: Summary Card */}
                <div className="w-full md:w-[350px] shrink-0">
                  <div className="bg-primary rounded-2xl p-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none"></div>
                    <span className="font-label-md text-label-md text-on-primary opacity-80 uppercase tracking-widest mb-sm block">Total Owed</span>
                    <div className="font-display text-[48px] text-on-primary font-bold leading-none mb-xs truncate" title={"₹" + Math.abs(data.totalOwed || 0).toFixed(2)}>
                      ₹{Math.abs(data.totalOwed || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    {data.totalOwed > 0 && (
                      <span className="font-label-sm text-label-sm bg-error text-on-error px-2 py-1 rounded mt-sm inline-block shadow-sm">Payment Required</span>
                    )}
                  </div>
                </div>

                {/* Right Column: List of Expenses */}
                <div className="flex-1 w-full flex flex-col gap-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Expense Contributions</h3>
                  
                  {data.expenses && data.expenses.length === 0 ? (
                    <div className="bg-surface border border-outline-variant border-dashed rounded-xl p-xl text-center flex flex-col items-center">
                      <span className="material-symbols-outlined text-[48px] text-surface-variant mb-md">receipt_long</span>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface mb-xs">No active expenses</h4>
                      <p className="font-body-md text-on-surface-variant max-w-[300px]">This user currently has no outstanding expense shares.</p>
                    </div>
                  ) : (
                    data.expenses.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-surface border border-outline-variant rounded-xl p-md flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                        onClick={() => navigate(`/expenses/${item.expenseId || item.expense?.id}`)}
                      >
                        <div className="flex items-center gap-md min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary-container transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-primary-container" data-icon="receipt_long">receipt_long</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors truncate">{item.expense?.description || "Unnamed Expense"}</h4>
                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-[2px]">
                              {item.expense?.date ? new Date(item.expense.date).toLocaleDateString() : "Date unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0 ml-md">
                          <span className="font-label-sm text-label-sm text-on-surface-variant mb-[2px]">Share Amount</span>
                          <span className="font-mono text-lg font-semibold text-error bg-error/10 px-sm py-[2px] rounded border border-error/20">
                            ₹{Number(item.shareAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserBalance;
