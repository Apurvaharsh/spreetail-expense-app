import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CreateExpenseModal from "../components/CreateExpenseModal";
import SettlementDetailModal from "../components/SettlementDetailModal";
import TopNav from "../components/TopNav";

function Dashboard() {
  const [balances, setBalances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [issues, setIssues] = useState([]);
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    fetchBalances();
    fetchExpenses();
    fetchSettlements();
    fetchIssues();
  }

  async function fetchBalances() {
    try {
      const res = await api.get("/balances");
      setBalances(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchExpenses() {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSettlements() {
    try {
      const res = await api.get("/settlements?status=PENDING");
      setSettlements(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchIssues() {
    try {
      const res = await api.get("/import/issues").catch(() => ({ data: [] }));
      setIssues(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDeleteExpense = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        console.error(err);
        alert("Failed to delete expense");
      }
    }
  };

  const handleEditExpense = async (e, id) => {
    e.stopPropagation();
    // basic edit wiring to satisfy the PUT request requirement
    const newDesc = prompt("Enter new description:");
    if (newDesc) {
      try {
        await api.put(`/expenses/${id}`, { description: newDesc });
        fetchExpenses();
      } catch (err) {
        console.error(err);
        alert("Failed to update expense");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const activeMembersCount = balances.length;
  const suggestedSettlementsCount = settlements.length;
  const openIssuesCount = issues.length;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex antialiased">
      <CreateExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSuccess={fetchAllData} 
      />
      
      <SettlementDetailModal 
        isOpen={!!selectedSettlement} 
        onClose={() => setSelectedSettlement(null)} 
        onSuccess={fetchAllData}
        settlement={selectedSettlement}
      />

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
          <button onClick={() => setIsExpenseModalOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-sm px-md rounded-lg flex items-center justify-center gap-sm transition-colors shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            New Expense
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-sm space-y-xs">
          <Link to="/" className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container border-l-4 border-primary-fixed font-label-md text-label-md active:scale-95 transition-transform">
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
        <TopNav 
          title="Dashboard"
        />

        {/* Canvas */}
        <main className="flex-1 p-lg md:p-xl overflow-y-auto w-full">
          {/* Welcome Header */}
          <div className="mb-xl">
            <h2 className="font-display text-display text-on-surface tracking-tight">Overview</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Track, reconcile, and settle expenses efficiently.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-12 gap-6 mb-xl">
            {/* Total Expenses */}
            <div onClick={() => navigate('/expenses')} className="col-span-12 md:col-span-3 bg-surface border border-outline-variant rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-sm mb-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]" data-icon="account_balance">account_balance</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Expenses</span>
              </div>
              <div className="font-headline-lg text-headline-lg text-on-surface">₹{totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="mt-sm font-label-sm text-label-sm text-primary flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
                All time
              </div>
            </div>

            {/* Active Members */}
            <div onClick={() => navigate('/members')} className="col-span-12 md:col-span-3 bg-surface border border-outline-variant rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-sm mb-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]" data-icon="group">group</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Active Members</span>
              </div>
              <div className="font-headline-lg text-headline-lg text-on-surface">{activeMembersCount}</div>
              <div className="mt-sm font-label-sm text-label-sm text-on-surface-variant">
                In this group
              </div>
            </div>

            {/* Open Issues */}
            <div onClick={() => navigate('/anomalies')} className="col-span-12 md:col-span-3 bg-surface border border-outline-variant rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-sm mb-md text-error">
                <span className="material-symbols-outlined text-[20px]" data-icon="warning">warning</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Open Issues</span>
              </div>
              <div className="font-headline-lg text-headline-lg text-on-surface">{openIssuesCount}</div>
              <div className="mt-sm font-label-sm text-label-sm text-on-surface-variant">
                Needs review
              </div>
            </div>

            {/* Suggested Settlements */}
            <div onClick={() => navigate('/settlements')} className="col-span-12 md:col-span-3 bg-primary text-on-primary border border-primary rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-4 -mt-4 pointer-events-none transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-sm mb-md opacity-90 relative z-10">
                <span className="material-symbols-outlined text-[20px]" data-icon="handshake">handshake</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Suggested Settlements</span>
              </div>
              <div className="font-headline-lg text-headline-lg relative z-10">{suggestedSettlementsCount}</div>
              <div className="mt-sm font-label-sm text-label-sm opacity-90 flex items-center justify-between relative z-10">
                Ready to execute
                <span className="material-symbols-outlined text-[16px] cursor-pointer group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Middle Section: Balance Summary & Settlements */}
          <div className="grid grid-cols-12 gap-6 mb-xl">
            {/* Balance Summary */}
            <div className="col-span-12 lg:col-span-7 bg-surface border border-outline-variant rounded-lg p-lg shadow-sm">
              <div className="flex justify-between items-center mb-md border-b border-surface-container-high pb-sm">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary" data-icon="account_balance_wallet">account_balance_wallet</span>
                  Member Balances
                </h3>
                <button onClick={() => navigate('/balances')} className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer">View All</button>
              </div>
              <div className="flex flex-col gap-sm">
                {balances.slice(0, 5).map(user => {
                  const isPositive = user.balance >= 0;
                  return (
                    <div 
                      key={user.userId} 
                      onClick={() => navigate(`/user/${user.userId}`)}
                      className="flex items-center justify-between p-sm rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-headline-md text-primary">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="font-body-md font-semibold text-on-surface">{user.name}</div>
                          <div className="font-label-sm text-on-surface-variant">{isPositive ? "Gets back" : "Owes"}</div>
                        </div>
                      </div>
                      <div className={`font-mono text-[16px] font-semibold ${isPositive ? 'text-[#10B981]' : 'text-error'}`}>
                        {isPositive ? '+' : '-'}₹{Math.abs(user.balance).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  );
                })}
                {balances.length === 0 && (
                  <div className="text-center text-on-surface-variant py-md">No balances available</div>
                )}
              </div>
            </div>

            {/* Settlement Recommendations */}
            <div className="col-span-12 lg:col-span-5 bg-surface border border-outline-variant rounded-lg p-lg shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-[0.03] -mr-10 -mt-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" data-icon="handshake" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
              </div>
              <div className="flex justify-between items-center mb-md border-b border-surface-container-high pb-sm relative z-10">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary" data-icon="route">route</span>
                  Suggested Settlements
                </h3>
              </div>
              <div className="flex flex-col gap-md relative z-10">
                {settlements.slice(0, 3).map((settlement, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedSettlement(settlement)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md cursor-pointer hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-sm">
                      <div className="flex items-center gap-sm">
                        <span className="font-body-sm font-semibold text-on-surface">{settlement.from}</span>
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                        <span className="font-body-sm font-semibold text-on-surface">{settlement.to}</span>
                      </div>
                      <span className="font-mono font-semibold text-on-surface text-[15px]">₹{settlement.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <button className="w-full py-xs border border-outline-variant text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors rounded">Record Payment</button>
                  </div>
                ))}
                {settlements.length === 0 && (
                  <div className="text-center text-on-surface-variant py-md">No settlements needed</div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Tables & Activity */}
          <div className="grid grid-cols-12 gap-6">
            {/* Recent Expenses Table */}
            <div className="col-span-12 lg:col-span-8 bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="p-lg border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-headline-md text-headline-md text-on-surface">Recent Expenses</h3>
                <button onClick={() => navigate('/expenses')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined" data-icon="more_horiz">more_horiz</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container-high">
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">Description</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">Paid By</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">Date</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Amount</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {expenses.slice(0, 5).map(exp => (
                      <tr 
                        key={exp.id} 
                        onClick={() => navigate(`/expenses/${exp.id}`)}
                        className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors h-[52px] cursor-pointer"
                      >
                        <td className="py-sm px-lg flex items-center gap-md">
                          <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
                            <span className="material-symbols-outlined text-[20px]" data-icon="receipt">receipt</span>
                          </div>
                          <span className="font-semibold">{exp.description}</span>
                        </td>
                        <td className="py-sm px-lg text-on-surface-variant">
                          <div className="flex items-center gap-xs">
                            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                              {exp.paidBy?.name ? exp.paidBy.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            {exp.paidBy?.name || "Unknown"}
                          </div>
                        </td>
                        <td className="py-sm px-lg text-on-surface-variant">{new Date(exp.createdAt || exp.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="py-sm px-lg font-mono text-right text-[15px] font-medium">₹{exp.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="py-sm px-lg text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-sm">
                            <button onClick={() => navigate(`/expenses/${exp.id}`)} className="text-on-surface-variant hover:text-primary transition-colors" title="View">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button onClick={(e) => handleEditExpense(e, exp.id)} className="text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={(e) => handleDeleteExpense(e, exp.id)} className="text-on-surface-variant hover:text-error transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-xl text-center text-on-surface-variant">No expenses found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity/Imports */}
            <div className="col-span-12 lg:col-span-4 bg-surface border border-outline-variant rounded-lg p-lg shadow-sm flex flex-col">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md pb-sm border-b border-surface-container-high flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant" data-icon="history">history</span>
                Recent Activity
              </h3>
              <div className="relative pl-md border-l-2 border-surface-container-high ml-sm space-y-lg mt-md flex-1">
                {expenses.slice(0, 3).map((exp, idx) => (
                  <div 
                    key={exp.id} 
                    onClick={() => navigate(`/expenses/${exp.id}`)}
                    className={`relative cursor-pointer hover:opacity-100 transition-opacity ${idx > 0 ? 'opacity-70' : ''}`}
                  >
                    <div className={`absolute w-3 h-3 ${idx === 0 ? 'bg-primary' : 'bg-surface-variant'} rounded-full -left-[21px] top-1 ring-4 ring-surface`}></div>
                    <div className="font-body-sm text-body-sm">
                      <span className="font-semibold text-on-surface">{exp.paidBy?.name}</span> added '{exp.description}'
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant mt-xs">{new Date(exp.createdAt || exp.date || Date.now()).toLocaleDateString('en-IN')}</div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="text-on-surface-variant text-sm py-md text-center">No recent activity.</div>
                )}
              </div>
              <button onClick={() => navigate('/import')} className="mt-xl w-full py-sm bg-surface-container-lowest border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low rounded-lg transition-colors flex items-center justify-center gap-sm shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[16px]" data-icon="upload_file">upload_file</span>
                Import New CSV
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
