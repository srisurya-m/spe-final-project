import { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface props {
  isAuthenticated: boolean;
  children?: ReactElement;
  adminOrDistributorRoute?: boolean;
  isAdminOrDistributor?: boolean;
  redirect?: string;
  orders?: boolean;
}

const ProtectedRoute = ({
  isAuthenticated,
  children,
  adminOrDistributorRoute,
  isAdminOrDistributor,
  orders,
  redirect = "/",
}: props) => {
  if (!isAuthenticated) return <Navigate to={redirect} />;
  if (!orders && !isAuthenticated) return <Navigate to={redirect} />;
  if (adminOrDistributorRoute && !isAdminOrDistributor) return <Navigate to={redirect} />;
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
