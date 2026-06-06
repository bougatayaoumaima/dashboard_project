import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

import {
  FaTachometerAlt,
  FaUsers,
  FaProjectDiagram,
  FaUser,
  FaSignOutAlt,
  FaMoon,
  FaUserTag,
  FaLayerGroup,
  FaSitemap
} from "react-icons/fa";

function AdminLayout() {

  const [user, setUser] = useState(null);
  const token = localStorage.getItem("access");

  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const getColor = (name) => {
    const colors = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1"];
    const index = name?.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`saas-layout ${dark ? "dark" : ""}`}>

     
      <aside className="saas-sidebar">

      
        <div className="d-flex align-items-center mb-4 p-2 rounded-3 hover-card">

          {user?.profile_image ? (
            <img
              src={`http://127.0.0.1:8000${user.profile_image}`}
              className="rounded-circle me-2"
              width="45"
              height="45"
              style={{ objectFit: "cover", cursor: "pointer" }}
              onClick={() => navigate("/admin/profile")}
            />
          ) : (
            <div
              className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white"
              style={{
                width: "45px",
                height: "45px",
                background: "linear-gradient(135deg,#0d6efd,#6f42c1)",
                fontWeight: "bold"
              }}
            >
              {user?.first_name?.charAt(0) || "A"}
            </div>
          )}

          <div>
            <strong>{user?.first_name || "Administrateur"}</strong>
            <br />
            <small className="text-muted">{user?.role}</small>
          </div>

        </div>

      
        <nav className="saas-nav">

          <Link
            to="/admin"
            className={isActive("/admin") ? "active" : ""}
          >
            <FaTachometerAlt /> Tableau de bord
          </Link>

          <br></br>

          <Link
            to="/admin/users"
            className={isActive("/admin/users") ? "active" : ""}
          >
            <FaUsers /> Utilisateurs
          </Link>

          <br></br>

          <Link
            to="/admin/projects"
            className={isActive("/admin/projects") ? "active" : ""}
          >
            <FaProjectDiagram /> Projets
          </Link>

          <br></br>

          <Link
            to="/admin/roles"
            className={isActive("/admin/roles") ? "active" : ""}
          >
            <FaUserTag /> Rôles
          </Link>

          <br></br>

          <Link
            to="/admin/teams"
            className={isActive("/admin/teams") ? "active" : ""}
          >
            <FaLayerGroup /> Équipes
          </Link>

          <br></br>

          <Link
            to="/admin/subteams"
            className={isActive("/admin/subteams") ? "active" : ""}
          >
            <FaSitemap /> Sous-équipes
          </Link>

          <br></br>

          <Link
            to="/admin/profile"
            className={isActive("/admin/profile") ? "active" : ""}
          >
            <FaUser /> Profil
          </Link>

        </nav>

        <div className="saas-footer">

      
          <div className="d-flex align-items-center mb-3">

            <FaMoon className="me-2" />

            <span>Mode sombre</span>

            <div
              className="ms-auto"
              onClick={() => setDark(!dark)}
              style={{
                width: "45px",
                height: "22px",
                borderRadius: "20px",
                background: dark ? "#0d6efd" : "#ccc",
                position: "relative",
                cursor: "pointer",
                transition: "0.3s"
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: "2px",
                  left: dark ? "24px" : "3px",
                  transition: "0.3s"
                }}
              />
            </div>

          </div>

       
          <button
            className="saas-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Déconnexion
          </button>

        </div>

      </aside>

      <main className="saas-main">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;