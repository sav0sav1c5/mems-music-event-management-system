import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./frontend/shared/components/Layout";
import Login from "./frontend/auth/pages/Login";
import Register from "./frontend/auth/pages/Register";
import ProtectedRoute from "./frontend/shared/components/ProtectedRoute";

// Ticket Sales imports
import TicketSalesDashboard from "./frontend/ticket-sales/pages/Dashboard";
import TicketSalesInfrastructure from "./frontend/ticket-sales/pages/Infrastructure";
import TicketSalesPerformances from './frontend/ticket-sales/pages/Performances';
import TicketSalesTicketTypes from "./frontend/ticket-sales/pages/TicketTypes";
import TicketSalesPricingOffers from "./frontend/ticket-sales/pages/PricingOffers";
import TicketSalesSalesTransactions from "./frontend/ticket-sales/pages/SalesTransactions";
import TicketSalesAnalytics from './frontend/ticket-sales/pages/Analytics';

// Add these imports for react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to get user's department
const getUserDepartment = (): number | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.department;
  } catch {
    return null;
  }
};

// Component to redirect to appropriate dashboard based on department
const DepartmentRedirect = () => {
  const department = getUserDepartment();
  
  switch (department) {
    case 1: // TicketSales
      return <Navigate to="/ticket-sales/dashboard" replace />;
    case 2: // EventOrganization
      return <Navigate to="/event-organization/dashboard" replace />;
    case 3: // ArtistCommunication
      return <Navigate to="/artist-communication/dashboard" replace />;
    case 4: // MediaCampaign
      return <Navigate to="/media-campaign/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Department redirect route */}
        {/* <Route path="/dashboard" element={<DepartmentRedirect />} /> */}

        {/* Protected routes - Ticket Sales*/}
        <Route path="/ticket-sales/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="/ticket-sales/infrastructure" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesInfrastructure />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/performances" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesPerformances />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/ticket-types" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesTicketTypes />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/pricing-offers" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesPricingOffers />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/sales-transactions" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesSalesTransactions />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/analytics" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesAnalytics />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<DepartmentRedirect />} />
        
        {/* Catch all - redirect to appropriate dashboard */}
        <Route path="*" element={<DepartmentRedirect />} />
      </Routes>

      {/* Add ToastContainer here for global notifications */}
      <ToastContainer />
    </Router>
  );
}

export default App;