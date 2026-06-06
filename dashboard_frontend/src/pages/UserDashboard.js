import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ProjectTeam from "./ProjectTeam";

function UserDashboard() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const token = localStorage.getItem("access");


  const openTeamModal = (projectId) => {
    setSelectedProjectId(projectId);
    setShowModal(true);
  };

  useEffect(() => {

    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

  }, [showModal]);


  const fetchProjects = async () => {

    try {

      let allProjects = [];
      let url = "http://127.0.0.1:8000/api/projects/";

      while (url) {

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        allProjects = [
          ...allProjects,
          ...res.data.results
        ];

        url = res.data.next;
      }

      setProjects(allProjects);

    } catch (err) {

      console.log(err);

    }
  };


  const fetchUsers = () => {

    axios
      .get("http://127.0.0.1:8000/api/users-membres/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      .then((res) => setUsers(res.data))

      .catch((err) => console.log(err));
  };


  const fetchTasks = async () => {

    try {

      let allTasks = [];
      let url = "http://127.0.0.1:8000/api/tasks/";

      while (url) {

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        allTasks = [
          ...allTasks,
          ...res.data.results
        ];

        url = res.data.next;
      }

      setTasks(allTasks);

    } catch (err) {

      console.log(err);

    }
  };


  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {

    fetchProjects();

    fetchTasks();

    fetchUsers();
  };

  if (projects.length === 0) {
    return null;
  }

  return (

    <div className="container mt-4">

      <div className="card shadow-sm border-0 rounded-4 p-3 mb-4">

        <div className="d-flex justify-content-between align-items-center">

          <h3 className="fw-bold mb-0">
             Tableau de bord Chef de Projet
          </h3>

        </div>

       

        <div className="card shadow-sm border-0 rounded-4 p-3 mb-4">

          <div className="table-responsive">

            <table className="table align-middle table-hover">

              <thead className="table-light">

                <tr>
                  <th>Projet</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Progression</th>
                  <th>Budget</th>
                  <th>Utilisé</th>
                  <th>Restant</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {projects.map((p) => (

                  <tr key={p.id}>

                    <td className="fw-semibold">
                      {p.name}
                    </td>

                    <td className="text-muted">
                      {p.description}
                    </td>

                    <td>

                      <span className="badge bg-info text-dark">
                        {p.status}
                      </span>

                    </td>

                    <td style={{ width: "180px" }}>

                      <div
                        className="progress"
                        style={{ height: "8px" }}
                      >

                        <div
                          className="progress-bar"
                          style={{
                            width: `${p.progress}%`
                          }}
                        ></div>

                      </div>

                      <small className="text-muted">
                        {p.progress}%
                      </small>

                    </td>

                    <td>{p.budget} DT</td>

                    <td>{p.budget_used} DT</td>

                    <td>

                      <span
                        className={
                          p.budget_remaining < 0
                            ? "text-danger fw-bold"
                            : "text-success"
                        }
                      >
                        {p.budget_remaining} DT
                      </span>

                      {p.budget_remaining < 0 && (

                        <div className="badge bg-danger mt-1">
                          Dépassement Budget
                        </div>

                      )}

                    </td>

                    <td>

                      <div className="d-flex gap-2 flex-wrap">

                        <button
                          className="btn btn-sm btn-outline-info rounded-pill"
                          onClick={() => openTeamModal(p.id)}
                        >
                          Membres
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          onClick={() =>
                            navigate(`/user/project-details/${p.id}`)
                          }
                        >
                          Détails
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      

      {showModal && (
        <>

          <div className="modal fade show d-block">

            <div className="modal-dialog modal-lg modal-dialog-scrollable">

              <div className="modal-content rounded-4">

                <div className="modal-header">

                  <h5 className="modal-title">
                    Équipe du Projet
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>

                </div>

                <div className="modal-body">

                  <ProjectTeam
                    projectId={selectedProjectId}
                    isModal={true}
                  />

                </div>

              </div>

            </div>

          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          ></div>

        </>
      )}

    </div>
  );
}

export default UserDashboard;