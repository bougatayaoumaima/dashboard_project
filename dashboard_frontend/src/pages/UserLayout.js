import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  FaTachometerAlt,
  FaUsers,
  FaUser,
  FaSignOutAlt,
  FaMoon,
  FaProjectDiagram,
  FaList,
  FaChevronRight
} from "react-icons/fa";

function UserLayout() {

  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = useState(false);

  const [openProjects, setOpenProjects] = useState(null);

  const [activeProject, setActiveProject] = useState(null);

  const [projects, setProjects] = useState([]);

  const [showProjects, setShowProjects] = useState(false);

  const [user, setUser] = useState(null);

  const token = localStorage.getItem("access");


  const menu = [

    {
      path: "/user/home",
      label: "Tableau de bord",
      icon: <FaTachometerAlt />
    },

    {
      path: "/user/tasks",
      label: "Projets",
      icon: <FaUsers />,
      isProjects: true
    },

    {
      path: "/user/all-tasks",
      label: "Toutes les tâches",
      icon: <FaList />
    },

    {
      path: "/user/profile",
      label: "Profil",
      icon: <FaUser />
    }

  ];


  const handleLogout = () => {

    localStorage.removeItem("access");

    navigate("/");

  };


  const isActive = (path) =>
    location.pathname === path;

  const isSubActive = (path) =>
    location.pathname === path;


  const toggleProject = (projectId) => {

    setOpenProjects(prev =>
      prev === projectId ? null : projectId
    );

  };


  const selectProject = (project) => {

    setActiveProject(project.id);

    setShowProjects(true);

    localStorage.setItem(
      "activeProject",
      project.id
    );

  };


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

    fetch("http://127.0.0.1:8000/api/projects/", {

      headers: {
        Authorization: `Bearer ${token}`,
      },

    })

      .then(res => res.json())

      .then(data =>
        setProjects(data.results || data)
      );

  }, []);


  useEffect(() => {

    const savedProject =
      localStorage.getItem("activeProject");

    if (savedProject) {

      setActiveProject(Number(savedProject));

      setShowProjects(true);

    }

  }, []);


  useEffect(() => {

    const path = location.pathname;

    projects.forEach(p => {

      if (
        path.includes(`/user/add-members/${p.id}`) ||
        path.includes(`/user/create-task/${p.id}`)
      ) {

        setOpenProjects(p.id);

      }

    });

  }, [location.pathname, projects]);


  const getColor = (name) => {

    const colors = [
      "#0d6efd",
      "#20c997",
      "#ffc107",
      "#dc3545",
      "#6f42c1"
    ];

    const index =
      name?.charCodeAt(0) % colors.length;

    return colors[index];

  };


  return (

    <div className={`d-flex ${dark ? "bg-dark text-white" : ""}`}>


      <div
        className="d-flex flex-column justify-content-between"
        style={{
          width: "260px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          background: dark ? "#111827" : "#ffffff",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          padding: "20px",
          overflowY: "auto"
        }}
      >

        <div>

          <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">

            <FaProjectDiagram />

            Espace Utilisateur

          </h4>


          <div
            className="d-flex align-items-center mb-4 p-2 rounded"
            style={{
              background: dark ? "#1f2937" : "#f3f4f6"
            }}
          >

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

                {user?.first_name?.charAt(0) || "U"}

              </div>

            )}

            <div>

              <strong>
                {user?.first_name || "Utilisateur"}
              </strong>

              <br />

              <small className="opacity-75">
                {user?.role}
              </small>

            </div>

          </div>


          <ul className="nav flex-column gap-2">

            {menu.map((item) => (

              <li key={item.label}>

                {item.isProjects ? (

                  <>


                    <div
                      className="nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                      style={{
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >

                      <div
                        className="d-flex align-items-center gap-2"
                        onClick={() => navigate("/user/tasks")}
                      >

                        <FaChevronRight
                          onClick={(e) => {

                            e.stopPropagation();

                            setShowProjects(!showProjects);

                          }}
                          style={{
                            transition: "0.3s",
                            transform: showProjects
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                            color: "#6c757d"
                          }}
                        />

                        {item.icon}

                        {item.label}

                      </div>

                    </div>


                    {showProjects && (

                      <ul
                        className="ms-4 mt-2"
                        style={{
                          listStyle: "none",
                          paddingLeft: 0
                        }}
                      >

                        {projects.map(p => (

                          <li key={p.id}>

                           

                            <div
                              className="d-flex align-items-center gap-2 px-2 py-1 rounded-2"
                              style={{
                                cursor: "pointer",
                                fontWeight:
                                  activeProject === p.id
                                    ? "600"
                                    : "400",

                                background:
                                  activeProject === p.id
                                    ? "#e7f1ff"
                                    : "transparent"
                              }}
                            >

                              <FaChevronRight
                                onClick={(e) => {

                                  e.stopPropagation();

                                  toggleProject(p.id);

                                }}
                                style={{
                                  transition: "0.3s",
                                  transform:
                                    openProjects === p.id
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",

                                  color: "#6c757d",
                                  fontSize: "12px"
                                }}
                              />

                              <div
                                onClick={() =>
                                  selectProject(p)
                                }
                                style={{ flex: 1 }}
                              >

                                {p.name}

                              </div>

                            </div>

                            {openProjects === p.id && (

                              <div className="ms-4 mt-1">

                                <div
                                  className={`nav-link small px-2 py-1 rounded-2 ${
                                    isSubActive(`/user/add-members/${p.id}`)
                                      ? "bg-primary text-white"
                                      : ""
                                  }`}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    navigate(`/user/add-members/${p.id}`)
                                  }
                                >

                                  Ajouter des membres

                                </div>

                                <div
                                  className={`nav-link small px-2 py-1 rounded-2 ${
                                    isSubActive(`/user/create-task/${p.id}`)
                                      ? "bg-primary text-white"
                                      : ""
                                  }`}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    navigate(`/user/create-task/${p.id}`)
                                  }
                                >

                                  Créer une tâche

                                </div>

                              </div>

                            )}

                          </li>

                        ))}

                      </ul>

                    )}

                  </>

                ) : (

                  <Link
                    to={item.path}
                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${
                      isActive(item.path)
                        ? "bg-primary text-white"
                        : "text-dark"
                    }`}
                  >

                    {item.icon}

                    {item.label}

                  </Link>

                )}

              </li>

            ))}

          </ul>

        </div>


        <div>


          <div className="d-flex align-items-center mb-3 px-2">

            <FaMoon className="me-2" />

            <span>Mode sombre</span>

            <input
              type="checkbox"
              className="form-check-input ms-auto"
              checked={dark}
              onChange={() => setDark(!dark)}
            />

          </div>


          <button
            className="btn btn-gradient w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
          >

            <FaSignOutAlt />

            Déconnexion

          </button>

        </div>

      </div>


      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: "260px"
        }}
      >

        <Outlet />

      </div>

    </div>
  );
}

export default UserLayout;