import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function BalancesList() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalances();
  }, []);

  async function fetchBalances() {
    try {
      const res = await api.get("/balances");
      setBalances(res.data || []);
    } catch (err) {
      console.error(err);
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
              <span className="text-on-surface font-semibold">Balances</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]" data-icon="notifications">notifications</span>
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]" data-icon="settings">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 p-lg md:p-xl overflow-y-auto w-full">
          <div className="max-w-[1024px] mx-auto">
            <div className="mb-xl flex justify-between items-end">
              <div>
                <h2 className="font-display text-display text-on-surface tracking-tight">Member Balances</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Overview of all user balances.</p>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container-high">
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">User</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Paid</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Owed</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-xl text-center text-on-surface-variant">Loading balances...</td>
                      </tr>
                    ) : balances.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-xl text-center text-on-surface-variant">No balances found.</td>
                      </tr>
                    ) : (
                      balances.map((user, idx) => {
                        const isPositive = user.balance >= 0;
                        return (
                          <tr 
                            key={idx} 
                            onClick={() => navigate(`/user/${user.userId}`)}
                            className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors h-[52px] cursor-pointer"
                          >
                            <td className="py-sm px-lg flex items-center gap-md">
                              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0 font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="font-semibold">{user.name}</span>
                            </td>
                            <td className="py-sm px-lg text-right font-mono text-[15px]">
                              ₹{user.paid ? user.paid.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}
                            </td>
                            <td className="py-sm px-lg text-right font-mono text-[15px]">
                              ₹{user.owed ? user.owed.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}
                            </td>
                            <td className={`py-sm px-lg text-right font-mono text-[15px] font-semibold ${isPositive ? 'text-[#10B981]' : 'text-error'}`}>
                              {isPositive ? '+' : '-'}₹{Math.abs(user.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BalancesList;
