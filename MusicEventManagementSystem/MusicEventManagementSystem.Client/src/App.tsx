import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./frontend/shared/components/Layout";
import Login from "./frontend/auth/pages/Login";
import Register from "./frontend/auth/pages/Register";
import ProtectedRoute from "./frontend/shared/components/ProtectedRoute";

// Ticket Sales imports
import TicketSalesDashboard from "./frontend/ticket-sales/pages/Dashboard";
import TicketSalesInfrastructure from "./frontend/ticket-sales/pages/Infrastructure";
// import TicketSalesVenues from "./frontend/ticket-sales/pages/Venues";
// import TicketSalesZones from './frontend/ticket-sales/pages/Zones';
// import TicketSalesSegments from './frontend/ticket-sales/pages/Segments';
// import TicketSalesTicketTypes from './frontend/ticket-sales/pages/TicketTypes';
import TicketSalesTickets from './frontend/ticket-sales/pages/Tickets';
import TicketSalesRecordedSales from './frontend/ticket-sales/pages/RecordedSales';
// import TicketSalesPricingRules from './frontend/ticket-sales/pages/PricingRules';
// import TicketSalesSpecialOffers from './frontend/ticket-sales/pages/SpecialOffer';
import TicketSalesTicketing from './frontend/ticket-sales/pages/Ticketing';

// Event Organization imports
// ...

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

        {/* <Route 
          path="/ticket-sales/venues" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesVenues />
              </Layout>
            </ProtectedRoute>
          } 
        /> */}

        {/* <Route 
          path="/ticket-sales/segments" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesSegments />
              </Layout>
            </ProtectedRoute>
          } 
        /> */}

        {/* <Route 
          path="/ticket-sales/zones" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesZones />
              </Layout>
            </ProtectedRoute>
          } 
        /> */}

        <Route 
          path="/ticket-sales/ticketing" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesTicketing />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/tickets" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesTickets />
              </Layout>
            </ProtectedRoute>
          } 
        />



        {/** 
        
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
          path="/ticket-sales/pricing-rules" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesPricingRules />
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
        
        **/}

        <Route 
          path="/ticket-sales/recorded-sales" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesRecordedSales />
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