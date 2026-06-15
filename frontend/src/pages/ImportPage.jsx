import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationsMenu from "../components/NotificationsMenu";
import TopNav from "../components/TopNav";

function ImportPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Read file to count rows for a quick stats update
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        setTotalRows(lines.length > 1 ? lines.length - 1 : 0);
        
        // Extract up to 4 rows for preview (header + 3 data rows)
        const previewLines = lines.slice(0, 4);
        const parsedRows = previewLines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
        setPreviewRows(parsedRows);
      };
      reader.readAsText(selectedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  async function handleUpload() {
    if (!file) {
      alert("Please select a CSV file to import.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        "/import/csv",
        formData
      );

      localStorage.setItem(
        "importResult",
        JSON.stringify(res.data)
      );

      navigate("/anomalies"); // Redirect to the beautifully styled Anomaly Center
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Import failed";
      alert(errorMsg);
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
          <Link to="/import" className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container border-l-4 border-primary-fixed font-label-md text-label-md active:scale-95 transition-transform">
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
        <TopNav title="Import CSV" />

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-lg md:p-xl w-full">
          <div className="max-w-[1024px] mx-auto flex flex-col gap-lg">
            
            {/* Page Header */}
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs tracking-tight">Import Transactions</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Upload bank statements or corporate card exports via CSV for automated reconciliation.</p>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {/* Drag and Drop Zone */}
            {!file && (
              <div 
                onClick={triggerFileInput}
                className="w-full border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low transition-all duration-200 flex flex-col items-center justify-center py-[80px] px-lg cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                  <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-on-primary">upload_file</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Drag & Drop CSV File</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg text-center max-w-[400px]">
                  Supported formats: .csv, .xls, .xlsx. Maximum file size: 50MB. Ensure headers map to Date, Description, Amount.
                </p>
                <button className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all">
                  Browse Files
                </button>
              </div>
            )}

            {/* State: File Uploaded -> Showing Stats & Preview */}
            {file && (
              <>
                <div className="flex justify-between items-center mb-xs">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Selected File: {file.name}</h3>
                  <button onClick={() => setFile(null)} className="text-error text-label-md hover:underline">Remove</button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="bg-surface border border-outline-variant rounded-lg p-md flex flex-col shadow-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Rows Detected</span>
                    <div className="flex items-end gap-sm">
                      <span className="font-display text-display text-on-surface leading-none">{totalRows}</span>
                      <span className="font-body-sm text-body-sm text-surface-tint mb-xs">Valid entries</span>
                    </div>
                  </div>
                  
                  <div className="bg-surface border border-error border-opacity-30 rounded-lg p-md flex flex-col relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Issues Found</span>
                    <div className="flex items-end gap-sm">
                      <span className="font-display text-display text-error leading-none">0</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mb-xs flex items-center gap-[2px]">
                        Pending validation
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface border border-outline-variant rounded-lg p-md flex flex-col shadow-sm">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Import Status</span>
                    <div className="flex items-center gap-sm h-full">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-headline-md text-headline-md text-on-surface">Ready to Import</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Preview Table */}
                <div className="flex flex-col gap-sm">
                  <div className="flex justify-between items-center px-xs">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Data Preview (Sample)</h3>
                    <button className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">tune</span> Map Columns
                    </button>
                  </div>
                  <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="grid gap-sm px-md py-sm bg-surface-container-low border-b border-surface-container-high font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" style={{ gridTemplateColumns: previewRows[0] ? `repeat(${previewRows[0].length}, minmax(0, 1fr))` : '1fr' }}>
                      {previewRows[0] && previewRows[0].map((header, i) => (
                        <div key={i} className="truncate" title={header}>{header}</div>
                      ))}
                    </div>
                    {/* Table Body (Actual Data) */}
                    <div className="flex flex-col font-body-sm text-body-sm text-on-surface">
                      {previewRows.slice(1).map((row, rowIdx) => (
                        <div key={rowIdx} className="grid gap-sm px-md py-[10px] border-b border-surface-container-high hover:bg-surface-container-lowest transition-colors items-center" style={{ gridTemplateColumns: `repeat(${previewRows[0].length}, minmax(0, 1fr))` }}>
                          {row.map((cell, cellIdx) => (
                            <div key={cellIdx} className="truncate" title={cell}>{cell}</div>
                          ))}
                        </div>
                      ))}
                      {previewRows.length <= 1 && (
                        <div className="px-md py-lg text-center text-on-surface-variant">No data rows found in this file.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-end items-center gap-md pt-md border-t border-outline-variant mt-sm">
                  <button 
                    onClick={() => setFile(null)}
                    className="font-label-md text-label-md text-on-surface-variant px-lg py-sm hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant bg-surface"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-primary text-on-primary font-label-md text-label-md px-xl py-sm rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                    )}
                    {loading ? "Importing..." : "Import Now"}
                  </button>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default ImportPage;
