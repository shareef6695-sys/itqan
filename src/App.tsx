import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { OrganizationProvider } from './context/OrganizationContext';
import { AuthProvider, useAuth, type Role } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/admin/Settings';
import { Users } from './pages/admin/Users';
import { FinanceDashboard } from './pages/finance/FinanceDashboard';
import { Expenses } from './pages/finance/Expenses';
import { Transactions } from './pages/finance/Transactions';
import { GLAccounts } from './pages/finance/GLAccounts';
import { BalanceSheet } from './pages/finance/reports/BalanceSheet';
import { ProfitLoss } from './pages/finance/reports/ProfitLoss';
import { DayBook } from './pages/finance/reports/DayBook';
import { CashFlow } from './pages/finance/reports/CashFlow';
import { TrialBalance } from './pages/finance/reports/TrialBalance';
import { ZatcaReports } from './pages/finance/reports/ZatcaReports';

// Sales Module Imports
import { Clients } from './pages/sales/Clients';
import { Quotations } from './pages/sales/Quotations';
import { CreateQuotation } from './pages/sales/CreateQuotation';
import { ProformaInvoices } from './pages/sales/ProformaInvoices';
import { CreateProformaInvoice } from './pages/sales/CreateProformaInvoice';
import { Invoices } from './pages/sales/Invoices';
import { CreateInvoice } from './pages/sales/CreateInvoice';
import { PaymentReceipts } from './pages/sales/PaymentReceipts';
import { CreatePaymentReceipt } from './pages/sales/CreatePaymentReceipt';
import { SalesOrders } from './pages/sales/SalesOrders';
import { CreateSalesOrder } from './pages/sales/CreateSalesOrder';
import { DeliveryChallans } from './pages/sales/DeliveryChallans';
import { CreateDeliveryChallan } from './pages/sales/CreateDeliveryChallan';
import { CreditNotes } from './pages/sales/CreditNotes';
import { CreateCreditNote } from './pages/sales/CreateCreditNote';

// Purchase Module Imports
import { Vendors } from './pages/purchase/Vendors';
import { PurchaseOrders } from './pages/purchase/PurchaseOrders';
import { CreatePurchaseOrder } from './pages/purchase/CreatePurchaseOrder';
import { Bills } from './pages/purchase/Bills';
import { CreateBill } from './pages/purchase/CreateBill';
import { DebitNotes } from './pages/purchase/DebitNotes';
import { CreateDebitNote } from './pages/purchase/CreateDebitNote';
import { PaymentsMade } from './pages/purchase/PaymentsMade';

// Inventory Module Imports
import { Products } from './pages/inventory/Products';
import { StockAdjustments } from './pages/inventory/StockAdjustments';
import { StockTransfers } from './pages/inventory/StockTransfers';
import { CreateStockTransfer } from './pages/inventory/CreateStockTransfer';
import { Login } from './pages/auth/Login';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Layout />;
};

interface RoleProtectedProps {
  roles: Role[];
  children: React.ReactElement;
}

const RoleProtected = ({ roles, children }: RoleProtectedProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500">Loading...</div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="p-4 text-sm text-red-600">
        Access denied
      </div>
    );
  }

  return children;
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <OrganizationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="admin/users"
              element={
                <RoleProtected roles={['owner', 'admin']}>
                  <Users />
                </RoleProtected>
              }
            />
            
            {/* Sales Module */}
          <Route path="sales/clients" element={<Clients />} />
          <Route path="sales/quotations" element={<Quotations />} />
          <Route path="sales/quotations/new" element={<CreateQuotation />} />
          <Route path="sales/proforma-invoices" element={<ProformaInvoices />} />
          <Route path="sales/proforma-invoices/new" element={<CreateProformaInvoice />} />
          <Route path="sales/invoices" element={<Invoices />} />
          <Route path="sales/invoices/new" element={<CreateInvoice />} />
          <Route path="sales/payment-receipts" element={<PaymentReceipts />} />
          <Route path="sales/payment-receipts/new" element={<CreatePaymentReceipt />} />
          <Route path="sales/sales-orders" element={<SalesOrders />} />
          <Route path="sales/sales-orders/new" element={<CreateSalesOrder />} />
          <Route path="sales/delivery-challans" element={<DeliveryChallans />} />
          <Route path="sales/delivery-challans/new" element={<CreateDeliveryChallan />} />
          <Route path="sales/credit-notes" element={<CreditNotes />} />
          <Route path="sales/credit-notes/new" element={<CreateCreditNote />} />
          
          {/* Purchase Module */}
          <Route path="purchase/vendors" element={<Vendors />} />
          <Route path="purchase/orders" element={<PurchaseOrders />} />
          <Route path="purchase/orders/new" element={<CreatePurchaseOrder />} />
          <Route path="purchase/bills" element={<Bills />} />
          <Route path="purchase/bills/new" element={<CreateBill />} />
          <Route path="purchase/debit-notes" element={<DebitNotes />} />
          <Route path="purchase/debit-notes/new" element={<CreateDebitNote />} />
          <Route path="purchase/payments-made" element={<PaymentsMade />} />

          {/* Inventory Module */}
          <Route path="inventory/products" element={<Products />} />
          <Route path="inventory/adjustments" element={<StockAdjustments />} />
          <Route path="inventory/transfers" element={<StockTransfers />} />
          <Route path="inventory/transfers/new" element={<CreateStockTransfer />} />

          {/* Finance Module */}
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/gl-accounts" element={<GLAccounts />} />
          <Route path="finance/expenses" element={<Expenses />} />
          <Route path="finance/transactions" element={<Transactions />} />
          <Route path="finance/reports/balance-sheet" element={<BalanceSheet />} />
          <Route path="finance/reports/profit-loss" element={<ProfitLoss />} />
          <Route path="finance/reports/day-book" element={<DayBook />} />
          <Route path="finance/reports/cash-flow" element={<CashFlow />} />
          <Route path="finance/reports/trial-balance" element={<TrialBalance />} />
          <Route path="finance/reports/zatca" element={<ZatcaReports />} />

          {/* Placeholders for other routes */}
          <Route path="*" element={<div className="p-4">Page not found or under construction</div>} />
        </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </OrganizationProvider>
  );
}

export default App;
