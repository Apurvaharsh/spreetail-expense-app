import { useEffect, useState, useMemo } from "react";
import React from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import TopNav from "../components/TopNav";

function AnomalyCenter() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    try {
      const res = await api.get("/import/issues").catch(() => {
        return { data: [] };
      });
      setIssues(res.data || []);
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

  const getSeverityBadge = (severity) => {
    const s = severity?.toUpperCase() || "INFO";
    if (s === "ERROR") return "bg-red-100 text-red-800 border-red-200";
    if (s === "WARNING") return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const formatText = (text) => {
    if (!text) return "-";
    return text.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const summary = useMemo(() => {
    return {
      total: issues.length,
      errors: issues.filter(i => i.severity?.toUpperCase() === "ERROR").length,
      warnings: issues.filter(i => i.severity?.toUpperCase() === "WARNING").length,
      info: issues.filter(i => !i.severity || i.severity?.toUpperCase() === "INFO").length
    };
  }, [issues]);

  const filteredIssues = issues.filter(issue => 
    (issue.issueType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.actionTaken || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.severity || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(issue.rowNumber).includes(searchQuery)
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
        <TopNav 
          title="Anomaly Center"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search Issue..."
        />

        {/* Canvas */}
        <main className="flex-1 p-lg md:p-xl overflow-y-auto w-full">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-xl flex justify-between items-end">
              <div>
                <h2 className="font-display text-display text-on-surface tracking-tight flex items-center gap-sm">
                  <span className="material-symbols-outlined text-error text-[36px]" data-icon="warning">warning</span>
                  Anomaly Center
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Review and resolve issues detected during CSV imports.</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
              <div className="bg-surface border border-outline-variant rounded-lg p-lg shadow-sm flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Total Issues</span>
                <span className="font-display text-display text-on-surface font-semibold">{summary.total}</span>
              </div>
              <div className="bg-surface border border-red-200 rounded-lg p-lg shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <span className="font-label-sm text-label-sm text-red-800 uppercase tracking-wider mb-xs">Errors</span>
                <span className="font-display text-display text-red-700 font-semibold">{summary.errors}</span>
              </div>
              <div className="bg-surface border border-orange-200 rounded-lg p-lg shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <span className="font-label-sm text-label-sm text-orange-800 uppercase tracking-wider mb-xs">Warnings</span>
                <span className="font-display text-display text-orange-700 font-semibold">{summary.warnings}</span>
              </div>
              <div className="bg-surface border border-blue-200 rounded-lg p-lg shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <span className="font-label-sm text-label-sm text-blue-800 uppercase tracking-wider mb-xs">Info</span>
                <span className="font-display text-display text-blue-700 font-semibold">{summary.info}</span>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container-high">
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">Row Number</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">Issue Type</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold text-center">Severity</th>
                      <th className="py-sm px-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-xl text-center text-on-surface-variant">Loading issues...</td>
                      </tr>
                    ) : filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-xl text-center text-on-surface-variant">
                          {issues.length === 0 ? "No anomalies detected in recent imports." : "No anomalies match your search."}
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue, idx) => {
                        const isExpanded = expandedRow === idx;
                        
                        return (
                          <React.Fragment key={idx}>
                            <tr 
                              className={`border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors h-[52px] cursor-pointer ${isExpanded ? 'bg-surface-container-lowest' : ''}`}
                              onClick={() => setExpandedRow(isExpanded ? null : idx)}
                            >
                              <td className="py-sm px-lg font-mono text-on-surface-variant">Row {issue.rowNumber}</td>
                              <td className="py-sm px-lg font-semibold">{formatText(issue.issueType)}</td>
                              <td className="py-sm px-lg text-center">
                                <span className={`px-2 py-[2px] rounded text-[10px] font-semibold tracking-wide uppercase border ${getSeverityBadge(issue.severity)}`}>
                                  {issue.severity || 'INFO'}
                               </span>
                              </td>
                              <td className="py-sm px-lg text-on-surface-variant">{formatText(issue.actionTaken)}</td>
                            </tr>
                            
                            {/* Expandable Details Section */}
                            {isExpanded && (
                              <tr className="bg-surface-container-lowest border-b border-surface-container-high">
                                <td colSpan="4" className="p-0">
                                  <div className="p-md border-l-4 border-primary ml-lg my-sm bg-surface rounded-r-lg shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                                      <div>
                                        <span className="block font-label-sm text-on-surface-variant uppercase mb-xs">Issue</span>
                                        <span className="font-medium text-on-surface">{formatText(issue.issueType)}</span>
                                      </div>
                                      <div>
                                        <span className="block font-label-sm text-on-surface-variant uppercase mb-xs">Reason</span>
                                        <span className="text-on-surface">{issue.description ? formatText(issue.description) : 'Detected anomaly during parsing'}</span>
                                      </div>
                                      <div>
                                        <span className="block font-label-sm text-on-surface-variant uppercase mb-xs">Action Required</span>
                                        <span className="text-on-surface">{formatText(issue.actionTaken)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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

export default AnomalyCenter;
