import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import ImportPage from "./pages/ImportPage";
import ImportReport from "./pages/ImportReport";
import Settlements from "./pages/Settlements";
import UserBalance from "./pages/UserBalance";
import Members from "./pages/Members";
import AnomalyCenter from "./pages/AnomalyCenter";
import BalancesList from "./pages/BalancesList";
import ExpenseDetail from "./pages/ExpenseDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/:expenseId"
          element={
            <ProtectedRoute>
              <ExpenseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <ImportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ImportReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settlements"
          element={
            <ProtectedRoute>
              <Settlements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute>
              <UserBalance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anomalies"
          element={
            <ProtectedRoute>
              <AnomalyCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/balances"
          element={
            <ProtectedRoute>
              <BalancesList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
