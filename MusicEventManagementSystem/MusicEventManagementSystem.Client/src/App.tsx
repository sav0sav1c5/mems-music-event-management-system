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

// Event Organization imports
<<<<<<< HEAD
import EventOrgDashboard from "./frontend/event-organization/pages/EventOrgDashboard";
import EventOrgEvents from "./frontend/event-organization/pages/Events"
import EventOrgEventDetails from "./frontend/event-organization/pages/EventDetails";
import EventOrgAddEvent from "./frontend/event-organization/pages/AddEvent";
import EventOrgAddPerformance from "./frontend/event-organization/pages/AddPerformance";
import EventOrgPerformanceDetails from "./frontend/event-organization/pages/PerformanceDetails";
import EventOrgAddResource from "./frontend/event-organization/pages/AddResource";
import EventOrgResourceDetails from "./frontend/event-organization/pages/ResourceDetails";
import EventOrgManageResourceTypes from "./frontend/event-organization/pages/ManageResourceTypes";
import EventOrgAddWorkTask from "./frontend/event-organization/pages/AddWorkTask";
import EventOrgWorkTaskDetails from "./frontend/event-organization/pages/WorkTaskDetails";
import EventOrgPerformances from "./frontend/event-organization/pages/Performances";
import EventOrgWorkTasks from "./frontend/event-organization/pages/WorkTasks";
import EventOrgResources from "./frontend/event-organization/pages/Resources";
import EventOrgCalendar from "./frontend/event-organization/pages/Calendar";
import EventOrgAnalytics from "./frontend/event-organization/pages/Analytics";
=======
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
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543

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

        {/* Protected routes - Event Organization*/}
        <Route 
          path="/event-organization/dashboard" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                <EventOrgDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/event-organization/events" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgEvents />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/events/add" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddEvent />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/events/:id" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgEventDetails />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/events/:id/edit" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddEvent />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/performances" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgPerformances />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/performances/add" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddPerformance />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/performances/:id" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgPerformanceDetails />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/performances/:id/edit" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddPerformance />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/work-tasks" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgWorkTasks />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/work-tasks/add" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddWorkTask />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/work-tasks/:id" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgWorkTaskDetails />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/work-tasks/:id/edit" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddWorkTask />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/resources" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgResources />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/resources/add" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddResource />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/resources/:id" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgResourceDetails />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/resources/:id/edit" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAddResource />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/resources/types" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgManageResourceTypes />
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/event-organization/calendar" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgCalendar />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Timeline functionality merged into Calendar - redirect to calendar */}
        <Route 
          path="/event-organization/timeline" 
          element={<Navigate to="/event-organization/calendar" replace />}
        />

        <Route 
          path="/event-organization/analytics" 
          element={
            <ProtectedRoute allowedDepartments={[2]}>
              <Layout>
                  <EventOrgAnalytics />
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