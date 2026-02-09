import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FinanceDashboard } from './pages/finance/FinanceDashboard';
import { Expenses } from './pages/finance/Expenses';
import { Transactions } from './pages/finance/Transactions';
import { GLAccounts } from './pages/finance/GLAccounts';

// Sales Module Imports
import { Clients } from './pages/sales/Clients';
import { Quotations } from './pages/sales/Quotations';
import { ProformaInvoices } from './pages/sales/ProformaInvoices';
import { Invoices } from './pages/sales/Invoices';
import { CreateInvoice } from './pages/sales/CreateInvoice';
import { PaymentReceipts } from './pages/sales/PaymentReceipts';
import { SalesOrders } from './pages/sales/SalesOrders';
import { DeliveryChallans } from './pages/sales/DeliveryChallans';
import { CreditNotes } from './pages/sales/CreditNotes';

// Purchase Module Imports
import { Vendors } from './pages/purchase/Vendors';
import { PurchaseOrders } from './pages/purchase/PurchaseOrders';
import { Bills } from './pages/purchase/Bills';
import { DebitNotes } from './pages/purchase/DebitNotes';
import { PaymentsMade } from './pages/purchase/PaymentsMade';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Sales Module */}
          <Route path="sales/clients" element={<Clients />} />
          <Route path="sales/quotations" element={<Quotations />} />
          <Route path="sales/proforma-invoices" element={<ProformaInvoices />} />
          <Route path="sales/invoices" element={<Invoices />} />
          <Route path="sales/invoices/new" element={<CreateInvoice />} />
          <Route path="sales/payment-receipts" element={<PaymentReceipts />} />
          <Route path="sales/sales-orders" element={<SalesOrders />} />
          <Route path="sales/delivery-challans" element={<DeliveryChallans />} />
          <Route path="sales/credit-notes" element={<CreditNotes />} />
          
          {/* Purchase Module */}
          <Route path="purchase/vendors" element={<Vendors />} />
          <Route path="purchase/orders" element={<PurchaseOrders />} />
          <Route path="purchase/bills" element={<Bills />} />
          <Route path="purchase/debit-notes" element={<DebitNotes />} />
          <Route path="purchase/payments-made" element={<PaymentsMade />} />

          {/* Finance Module */}
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/gl-accounts" element={<GLAccounts />} />
          <Route path="finance/expenses" element={<Expenses />} />
          <Route path="finance/transactions" element={<Transactions />} />

          {/* Placeholders for other routes */}
          <Route path="*" element={<div className="p-4">Page not found or under construction</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
