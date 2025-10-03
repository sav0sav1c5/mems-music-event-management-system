import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedDepartments?: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedDepartments = [] }) => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  try {
    const parsedUser = JSON.parse(user);

    // If allowedDepartments is specified, check if user's department is allowed
    if (allowedDepartments.length > 0 && !allowedDepartments.includes(parsedUser.department)) {
      switch (parsedUser.department) {
        case 1: // TicketSales
          return <Navigate to="/ticket-sales/dashboard" replace />;
        case 2: // EventOrganization
          return <Navigate to="/event-organization/dashboard" replace />;
        case 3: // ArtistCommunication
          return <Navigate to="/performer-communication/dashboard" replace />;
        case 4: // MediaCampaign
          return <Navigate to="/media-campaign/dashboard" replace />;
        case 5: // MEMS Client
          return <Navigate to="/client/browse-events" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  return <>{children}</>;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;