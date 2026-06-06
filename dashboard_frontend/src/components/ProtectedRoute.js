
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("access");
  const location = useLocation();


  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000;

  
    if (decoded.exp < currentTime) {
      localStorage.clear();
      return <Navigate to="/" replace />;
    }

    if (
      decoded.must_change_password === true &&
      location.pathname !== "/change-password"
    ) {
      return <Navigate to="/change-password" replace />;
    }

    if (role && decoded.role !== role) {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (error) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
}

export default ProtectedRoute;