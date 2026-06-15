function ImportReport() {
  const data =
    JSON.parse(
      localStorage.getItem(
        "importResult"
      )
    ) || {};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Import Report</h1>

      <h3>
        Total Rows:
        {data.totalRows}
      </h3>

      <h3>
        Issues Found:
        {data.issuesFound}
      </h3>

      <hr />

      {data.issues?.map(
        (issue, index) => (
          <div
            key={index}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px"
            }}
          >
            <p>
              Row:
              {issue.rowNumber}
            </p>

            <p>
              Type:
              {issue.type}
            </p>

            <p>
              Severity:
              {issue.severity}
            </p>

            <p>
              Action:
              {issue.action}
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default ImportReport;
