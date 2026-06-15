import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ExpenseDetail() {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseDetail();
  }, [expenseId]);

  async function fetchExpenseDetail() {
    try {
      const res = await api.get(`/expenses/${expenseId}`).catch(() => {
        return null;
      });
      if (res && res.data) {
        setExpense(res.data);
      } else {
        setExpense(null);
      }
    } catch (err) {
      console.error(err);
      setExpense(null);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  const handleExportCSV = () => {
    if (!expense || !expense.participants) return;
    
    const headers = "Participant,Split (%),Calculated Share,Net Balance\n";
    const amount = expense.amount || 0;
    const participants = expense.participants || [];
    const payerName = expense.paidBy?.name || "Unknown";
    
    const rows = participants.map(p => {
      const shareAmount = p.amount || (amount / participants.length);
      const percentage = amount > 0 ? (shareAmount / amount) * 100 : (100 / participants.length);
      const isPayer = (p.user?.id === expense.paidBy?.id) || (p.user?.name === payerName);
      
      let netBalance = 0;
      if (isPayer) {
        netBalance = amount - shareAmount;
      } else {
        netBalance = -shareAmount;
      }
      
      return `${p.user?.name || "Unknown"},${percentage.toFixed(0)}%,${shareAmount.toFixed(2)},${netBalance.toFixed(2)}`;
    }).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expense_${expenseId}_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = () => {
    alert("Edit Expense functionality is under construction.");
  };

  const handleSettleUp = () => {
    alert("Settle Up functionality is under construction.");
  };

  const handleAttachReceipt = () => {
    alert("Attach Receipt functionality is under construction.");
  };

  if (loading) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">sync</span>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="bg-background text-on-surface antialiased min-h-screen flex items-center justify-center flex-col gap-4">
        <span className="material-symbols-outlined text-[64px] text-error">error</span>
        <span className="text-on-surface font-headline-md">Expense not found or API unavailable.</span>
        <button onClick={() => navigate(-1)} className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md">Go Back</button>
      </div>
    );
  }

  const amount = expense.amount || 0;
  const payerName = expense.paidBy?.name || "Unknown";
  const payerInitial = payerName.charAt(0).toUpperCase();
  const participants = expense.participants || [];
  
  // Try to generate colors dynamically or use predefined ones
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-tertiary",
    "bg-error"
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex antialiased">
      {/* Standard SideNavBar */}
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
          <Link to="/expenses" className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary text-on-primary border-l-4 border-primary-fixed font-label-md text-label-md active:scale-95 transition-transform">
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
        
        {/* Standard TopNavBar */}
        <header className="bg-surface shadow-sm flex justify-between items-center w-full px-lg py-sm h-16 sticky top-0 z-40 border-b border-outline-variant">
          <div className="flex items-center gap-sm w-full max-w-lg">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hidden md:block" data-icon="menu">menu</span>
            <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant ml-sm">
              <Link to="/expenses" className="hover:text-primary cursor-pointer transition-colors">Expenses</Link>
              <span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span>
              <span className="text-on-surface font-semibold truncate">{expense.description || "Expense Detail"}</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button onClick={handleEdit} className="px-md py-sm border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">edit</span> Edit
            </button>
            <button onClick={handleSettleUp} className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-colors flex items-center gap-xs shadow-sm">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span> Settle Up
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer ml-md">
              U
            </div>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 p-lg md:p-xl overflow-y-auto w-full bg-surface-container-lowest">
          <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-xl">
            {/* Left Column: Summary & Meta */}
            <div className="lg:col-span-4 flex flex-col gap-lg">
              {/* Meta Info Card */}
              <section className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-md">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">info</span> Metadata
                  </h2>
                  <span className="px-sm py-[2px] bg-primary-container text-on-primary-container rounded font-label-sm text-label-sm capitalize">
                    {expense.splitType || "EQUAL"} Split
                  </span>
                </div>
                <div className="flex flex-col gap-md">
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Total Amount</span>
                    <span className="font-display text-[24px] text-on-surface font-semibold">
                      ₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Date</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">
                      {new Date(expense.createdAt || expense.date || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Paid By</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm">
                        {payerInitial}
                      </div>
                      <span className="font-body-md text-body-md text-on-surface font-semibold">{payerName}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">Category</span>
                    <span className="font-body-md text-body-md text-on-surface flex items-center gap-xs font-medium">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">category</span> General
                    </span>
                  </div>
                </div>
              </section>

              {/* Receipt Image */}
              <section className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[200px] group cursor-pointer" onClick={handleAttachReceipt}>
                <div className="flex-1 bg-surface-container-low flex flex-col items-center justify-center p-xl text-center hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md opacity-50 group-hover:text-primary group-hover:opacity-100 transition-all">add_photo_alternate</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant mb-xs">No Receipt Attached</span>
                  <p className="font-body-sm text-on-surface-variant max-w-[200px]">Click here to upload a receipt image for your records.</p>
                </div>
              </section>
            </div>

            {/* Right Column: Traceability & Breakdown */}
            <div className="lg:col-span-8 flex flex-col gap-lg">
              
              {/* Visual Breakdown */}
              <section className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-lg flex items-center gap-sm border-b border-outline-variant pb-md">
                  <span className="material-symbols-outlined text-primary">pie_chart</span> Split Visualizer
                </h2>
                
                {participants.length === 0 ? (
                  <div className="py-xl text-center text-on-surface-variant font-label-md">No participants found.</div>
                ) : (
                  <>
                    {/* Stacked Bar Chart */}
                    <div className="w-full h-10 rounded-lg overflow-hidden flex shadow-inner">
                      {participants.map((p, idx) => {
                        const shareAmount = p.amount || (amount / participants.length);
                        const percentage = amount > 0 ? (shareAmount / amount) * 100 : (100 / participants.length);
                        const colorClass = colors[idx % colors.length];
                        return (
                          <div 
                            key={idx}
                            className={`${colorClass} h-full border-r border-surface-container-lowest transition-all hover:brightness-110`} 
                            style={{ width: `${percentage}%` }} 
                            title={`${p.user?.name || 'User'}: ${percentage.toFixed(0)}%`}
                          ></div>
                        );
                      })}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap gap-md mt-lg justify-center">
                      {participants.map((p, idx) => {
                        const splitType = (expense.splitType || "equal").toUpperCase();
                        let displayRule = "";
                        if (splitType === "PERCENTAGE" && p.splitValue != null) displayRule = `${p.splitValue}%`;
                        else if (splitType === "UNEQUAL" && p.splitValue != null) displayRule = `₹${p.splitValue.toLocaleString('en-IN')}`;
                        else if (splitType === "SHARE" && p.splitValue != null) displayRule = `${p.splitValue} Share${p.splitValue > 1 ? 's' : ''}`;
                        else if (splitType === "EQUAL") displayRule = "Equal";
                        else {
                          const shareAmount = p.amount || (amount / participants.length);
                          const percentage = amount > 0 ? (shareAmount / amount) * 100 : (100 / participants.length);
                          displayRule = `${percentage.toFixed(0)}%`;
                        }

                        const colorClass = colors[idx % colors.length];
                        return (
                          <div key={idx} className="flex items-center gap-xs bg-surface-container-low px-sm py-[4px] rounded-full border border-outline-variant">
                            <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                            <span className="font-label-sm text-label-sm text-on-surface font-medium">
                              {p.user?.name || 'Unknown'} ({displayRule})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </section>

              {/* Detailed Ledger Table */}
              <section className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-md px-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">table_rows</span> Share Calculation Ledger
                  </h2>
                  <button onClick={handleExportCSV} className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-xs bg-primary/10 px-sm py-[4px] rounded hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Participant</th>
                        <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Split Rule</th>
                        <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Calculated Share</th>
                        <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Net Balance</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md bg-surface">
                      {participants.map((p, idx) => {
                        const shareAmount = p.amount || (amount / participants.length);
                        const isPayer = (p.user?.id === expense.paidBy?.id) || (p.user?.name === payerName);
                        const colorClass = colors[idx % colors.length];
                        
                        let netBalance = 0;
                        if (isPayer) {
                          netBalance = amount - shareAmount;
                        } else {
                          netBalance = -shareAmount;
                        }

                        const splitType = (expense.splitType || "equal").toUpperCase();
                        let displayRule = "";
                        if (splitType === "PERCENTAGE" && p.splitValue != null) displayRule = `${p.splitValue}%`;
                        else if (splitType === "UNEQUAL" && p.splitValue != null) displayRule = `₹${p.splitValue.toLocaleString('en-IN')}`;
                        else if (splitType === "SHARE" && p.splitValue != null) displayRule = `${p.splitValue} Share${p.splitValue > 1 ? 's' : ''}`;
                        else if (splitType === "EQUAL") displayRule = "Equal";
                        else displayRule = "--";
                        
                        return (
                          <tr key={idx} className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors">
                            <td className="py-md px-lg">
                              <div className="flex items-center gap-md">
                                <div className={`w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-label-md`}>
                                  {p.user?.name ? p.user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <div className="font-semibold text-on-surface">{p.user?.name || "Unknown"}</div>
                                  {isPayer && <div className="font-label-sm text-label-sm text-tertiary">Payer</div>}
                                </div>
                              </div>
                            </td>
                            <td className="py-md px-lg text-right font-mono text-on-surface-variant font-medium">{displayRule}</td>
                            <td className="py-md px-lg text-right font-mono text-on-surface font-medium">
                              ₹{shareAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </td>
                            <td className={`py-md px-lg text-right font-mono flex justify-end items-center gap-xs ${netBalance >= 0 ? 'text-green-600' : 'text-error'}`}>
                              <span className={`material-symbols-outlined text-[16px]`}>
                                {netBalance >= 0 ? 'arrow_upward' : 'arrow_downward'}
                              </span>
                              <span className="font-bold">
                                {netBalance >= 0 ? '+' : '-'}₹{Math.abs(netBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-surface-container-low border-t-2 border-outline-variant font-label-sm">
                      <tr>
                        <td className="py-sm px-lg font-bold text-on-surface">Total Reconciled</td>
                        <td className="py-sm px-lg text-right font-mono text-on-surface-variant font-bold">100%</td>
                        <td className="py-sm px-lg text-right font-mono text-on-surface font-bold">
                          ₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-sm px-lg text-right font-mono text-on-surface text-opacity-50">--</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {/* Logic Step-by-Step Context */}
              <section className="bg-surface-container-low border border-outline-variant border-dashed rounded-xl p-md">
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-start gap-sm">
                  <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-[2px]">account_tree</span>
                  <span className="leading-relaxed">
                    <strong className="text-on-surface">Reconciliation Logic:</strong> {payerName} paid the full ₹{amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}. 
                    The expense was flagged as an "<strong>{expense.splitType || "EQUAL"} Split</strong>". The system calculated exact shares based on the principal. 
                    {payerName}'s share is ₹{(participants.find(p => p.user?.name === payerName)?.amount || (amount / participants.length)).toLocaleString('en-IN', {minimumFractionDigits: 2})}, meaning the remaining participants owe {payerName} to balance the ledger.
                  </span>
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExpenseDetail;
