import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedDepartments?: number[];
}

// HELPER FUNCTION: Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    // JWT token structure: header.payload.signature
    const payload = token.split('.')[1];
    
    // Decode payload (Base64)
    const decodedPayload = JSON.parse(atob(payload));
    
    // 'exp' is the expiration timestamp in seconds
    const expirationTime = decodedPayload.exp * 1000; // convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime > expirationTime;
  } catch (error) {
    // If it can't parse the token, treat it as expired
    console.error('Error parsing token:', error);
    return true;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedDepartments = [] }) => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  // CHECH 1: Does user and token exist, if not redirect to login
  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  // CHECK 2: Is token expired
  if (isTokenExpired(token)) {
    // Clear storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace state={{ message: 'Your session has expired. Please login again.' }} />;
  }

  try {
    const parsedUser = JSON.parse(userStr);

    // CHECK 3: Does user have permission to access this route
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

    // If all checks pass, render the component
    return <>{children}</>;
  } catch {
    // If it can't parse the user, redirect to login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;