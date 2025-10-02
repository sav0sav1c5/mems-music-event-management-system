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
import TicketSalesSpecialOffers from "./frontend/ticket-sales/pages/SpecialOffer";
import TicketSalesPricingRules from "./frontend/ticket-sales/pages/PricingRules";
import TicketSalesAnalytics from './frontend/ticket-sales/pages/Analytics';

// Event Organization imports
import EventOrganizationDashboard from "./frontend/event-organization/pages/Dashboard";

// Media Campaign imports
import MediaCampaignDashboard from "./frontend/media-campaign/pages/Dashboard";

// Artist Communication imports
import ArtistCommunicationDashboard from "./frontend/performer-communication/pages/Dashboard";

// MEMS Client imports
import ClientDashboard from "../src/frontend/shared/page/Dashboard";
import ClientEvents from "../src/frontend/shared/page/Events";
import ClientMyCart from "../src/frontend/shared/page/MyCart";
import ClientCheckout from "../src/frontend/shared/page/Checkout";
import ClientOrders from "../src/frontend/shared/page/MyOrders";

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
      return <Navigate to="/performer-communication/dashboard" replace />;
    case 4: // MediaCampaign
      return <Navigate to="/media-campaign/dashboard" replace />;
    case 5: // MEMS Client
      return <Navigate to="/client/dashboard" replace />;
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
          path="/ticket-sales/special-offers" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesSpecialOffers />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/pricing-rules" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesPricingRules/>
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

        {/* Protected routes - Event Organization*/}
        <Route path="/event-organization/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                <EventOrganizationDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Protected routes - Performer Communication*/}
        <Route path="/performer-communication/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <ArtistCommunicationDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Protected routes - Media Campaign*/}
        <Route path="/media-campaign/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[4]}>
              <Layout>
                <MediaCampaignDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Protected routes - MEMS Client*/}
        <Route path="/client/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[5]}>
              <Layout>
                <ClientDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="/client/events" 
          element={
            <ProtectedRoute allowedDepartments={[5]}>
              <Layout>
                <ClientEvents />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="/client/my-cart" 
          element={
            <ProtectedRoute allowedDepartments={[5]}>
              <Layout>
                <ClientMyCart />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="/client/checkout" 
          element={
            <ProtectedRoute allowedDepartments={[5]}>
              <Layout>
                <ClientCheckout />
              </Layout>
            </ProtectedRoute>
          } 
        />

         <Route path="/client/orders" 
          element={
            <ProtectedRoute allowedDepartments={[5]}>
              <Layout>
                <ClientOrders />
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