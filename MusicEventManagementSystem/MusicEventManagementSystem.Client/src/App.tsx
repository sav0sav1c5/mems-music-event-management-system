import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./frontend/shared/components/Layout";
import Login from "./frontend/auth/pages/Login";
import Register from "./frontend/auth/pages/Register";
import ProtectedRoute from "./frontend/shared/components/ProtectedRoute";

// Ticket Sales imports
import TicketSalesDashboard from "./frontend/ticket-sales/pages/Dashboard";
import TicketSalesVenues from "./frontend/ticket-sales/pages/Venues";
import TicketSalesZones from './frontend/ticket-sales/pages/Zones';
import TicketSalesSegments from './frontend/ticket-sales/pages/Segments';
import TicketSalesTicketTypes from './frontend/ticket-sales/pages/TicketTypes';
import TicketSalesTickets from './frontend/ticket-sales/pages/Tickets';
import TicketSalesRecordedSales from './frontend/ticket-sales/pages/RecordedSales';
import TicketSalesPricingRules from './frontend/ticket-sales/pages/PricingRules';
import TicketSalesSpecialOffers from './frontend/ticket-sales/pages/SpecialOffer';

// Artist Communication / Performer Negotiations imports
import PerformerDashboard from "./frontend/performer-negotations/pages/PerformerDashboard";
import Performers from "./frontend/performer-negotations/pages/Performers";

import Phases from "./frontend/performer-negotations/pages/Phases";
import NegotiationsNew from "./frontend/performer-negotations/pages/NegotiationsNew";
import NegotiationWorkflow from "./frontend/performer-negotations/pages/NegotiationWorkflow";
import Contracts from "./frontend/performer-negotations/pages/Contracts";
import Documents from "./frontend/performer-negotations/pages/Documents";
import Communications from "./frontend/performer-negotations/pages/Communications";
import Analytics from "./frontend/performer-negotations/pages/Analytics.tsx";

// Reports
import NegotiationReports from "./components/NegotiationReports";

// Event Organization imports
// ...

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

        <Route 
          path="/ticket-sales/venues" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesVenues />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/segments" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesSegments />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ticket-sales/zones" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesZones />
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
          path="/ticket-sales/tickets" 
          element={
            <ProtectedRoute allowedDepartments={[1]}>
              <Layout>
                <TicketSalesTickets />
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

        {/* Artist Communication / Performer Negotiations routes */}
        <Route 
          path="/artist-communication/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <PerformerDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/artist-communication/performers" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <Performers />
              </Layout>
            </ProtectedRoute>
          } 
        />



        <Route 
          path="/artist-communication/phases" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <Phases />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/artist-communication/negotiations" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <NegotiationsNew />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/negotiations/:id/workflow" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <NegotiationWorkflow />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/artist-communication/contracts" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <Contracts />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/artist-communication/documents" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <Documents />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/artist-communication/communications" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <Communications />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/artist-communication/analytics" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/reports/negotiations" 
          element={
            <ProtectedRoute allowedDepartments={[3]}>
              <Layout>
                <NegotiationReports />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<DepartmentRedirect />} />
        
        {/* Catch all - redirect to appropriate dashboard */}
        <Route path="*" element={<DepartmentRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;