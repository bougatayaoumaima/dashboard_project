import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaMoon
} from "react-icons/fa";

function PmoLayout() {

  const [user, setUser] = useState(null);
  const token = localStorage.getItem("access");

  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const getColor = (name) => {
    const colors = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1"];
    const index = name?.charCodeAt(0) % colors.length;
    return colors[index]; };
  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

useEffect(() => {
  if (dark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}, [dark]);


  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  useEffect(() => {
  const fetchCount = () => {
    fetch("http://127.0.0.1:8000/api/notifications/unread-count/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setNotifCount(data.count));
  };

  fetchCount();
  const interval = setInterval(fetchCount, 5000); 

  return () => clearInterval(interval);
}, []);

  return (
    <div className={`saas-layout ${dark ? "dark" : ""}`}>

  
  <aside className="saas-sidebar">

    <div className="saas-logo">
      PMO
    </div>

  
    <div className="saas-user">
      {user?.profile_image ? (
  <img
    src={`http://127.0.0.1:8000${user.profile_image}`}
    alt="avatar"
    className="rounded-circle me-2"
    width="40"
    height="40"
    style={{ objectFit: "cover" }}
  />
) : (
  <div
    className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white"
    style={{
      width: "40px",
      height: "40px",
      backgroundColor: getColor(user?.first_name),
      fontWeight: "bold"
    }}
  >
    {user?.first_name?.charAt(0) || "P"}
  </div>
)}
      <div>
        <center><strong>{user?.first_name || "PMO"}</strong><br></br>
        <small>{user?.role}</small></center>
      </div>
    </div>

    <nav className="saas-nav">

      <Link to="/pmo" className={isActive("/pmo") ? "active" : ""}>
        <FaTachometerAlt /> Tableau de bord
      </Link>
<br></br>
      <Link to="/pmo/projects" className={isActive("/pmo/projects") ? "active" : ""}>
        <FaProjectDiagram />  Projets
      </Link>
<br></br>
      <Link to="/pmo/notifications" className={isActive("/pmo/notifications") ? "active" : ""}>
        <FaBell /> Notifications
        {notifCount > 0 && <span className="badge">{notifCount}</span>}
      </Link>
<br></br>
      <Link to="/pmo/profile" className={isActive("/pmo/profile") ? "active" : ""}>
        <FaUser /> Profil
      </Link>

    </nav>
    <div className="saas-footer">

      <label className="dark-toggle">
        <FaMoon />
        Mode sombre
        <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
      </label>

      <button className="saas-logout" onClick={handleLogout}>
        <FaSignOutAlt />  Déconnexion
      </button>

    </div>

  </aside>

  <main className="saas-main">
    <Outlet />
  </main>

</div>
  );
}

export default PmoLayout;