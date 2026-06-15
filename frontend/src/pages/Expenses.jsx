import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationsMenu from "../components/NotificationsMenu";
import TopNav from "../components/TopNav";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    currency: "INR",
    date: "",
    splitType: "equal",
    paidById: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, []);

  async function fetchExpenses() {
    try {
      const res = await api.get("/expenses");
      // Display newest first
      setExpenses(res.data.reverse());
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUsers() {
    try {
      const res = await api.get("/balances");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date || !form.paidById) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/expenses", {
        ...form,
        amount: parseFloat(form.amount)
      });

      setForm({
        description: "",
        amount: "",
        currency: "INR",
        date: "",
        splitType: "equal",
        paidById: ""
      });

      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to create expense.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exp.paidBy?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          <Link to="/expenses" className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container border-l-4 border-primary-fixed font-label-md text-label-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]" data-icon="receipt_long">receipt_long</span>
            Expenses
          </Link>
          <Link to="/settlements" className="flex items-center gap-sm px-md py-sm rounded-lg text-surface-variant dark:text-on-surface-variant opacity-70 hover:bg-surface-variant/10 dark:hover:bg-surface-container-high transition-all font-label-md text-label-md active:scale-95">
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

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-w-0">
        <TopNav 
          title="Expenses"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search Expenses..."
        />

        <main className="flex-1 p-lg md:p-xl overflow-y-auto max-w-[1200px] mx-auto w-full">
          <div className="mb-xl flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Expenses</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Log new group expenses and view history.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
            {/* Left Col: Add Expense Form */}
            <div className="lg:col-span-4">
              <div className="bg-surface rounded-lg border border-outline-variant p-lg shadow-sm sticky top-24">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-lg flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary" data-icon="add_circle">add_circle</span>
                  Add New Expense
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                  {/* Description */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Description</label>
                    <input
                      required
                      type="text"
                      className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-lowest"
                      placeholder="e.g. Dinner at Taj"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  {/* Amount & Currency */}
                  <div className="flex gap-sm">
                    <div className="flex-1">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Amount</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-lowest"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Curr</label>
                      <select
                        className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-lowest"
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Date</label>
                    <input
                      required
                      type="date"
                      className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-lowest"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>

                  {/* Paid By */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Paid By</label>
                    <select
                      required
                      className="w-full px-md py-sm border border-outline-variant rounded-lg font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface-container-lowest"
                      value={form.paidById}
                      onChange={(e) => setForm({ ...form, paidById: e.target.value })}
                    >
                      <option value="" disabled>Select Payer</option>
                      {users.map((user) => (
                        <option key={user.userId} value={user.userId}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-sm bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Expense"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col: Expenses List */}
            <div className="lg:col-span-8">
              <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
                <div className="p-lg border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Expense History</h3>
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
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
                      </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-surface">
                      {filteredExpenses.map(exp => (
                        <tr
                          key={exp.id}
                          className="border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors h-[52px] cursor-pointer"
                          onClick={() => navigate(`/expenses/${exp.id}`)}
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
                          <td className="py-sm px-lg text-on-surface-variant">
                            {new Date(exp.createdAt || exp.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-sm px-lg font-mono text-right text-[15px] font-medium">
                            ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-xl text-center text-on-surface-variant">
                            {expenses.length === 0 ? "No expenses found. Start by adding one!" : "No expenses match your search."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Expenses;
