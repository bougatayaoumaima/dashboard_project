import { useEffect, useState } from "react";
import axios from "axios";
import { Search, User, Folder, Filter, RotateCcw } from "lucide-react";

function AllTasks() {

  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/tasks/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.log(err);
    }
  };

  const users = [
    ...new Set(
      tasks
        .filter(t =>
          selectedProject === "" || t.project_name === selectedProject
        )
        .map(t => t.assigned_to_username)
    )
  ];

  const projects = [...new Set(tasks.map(t => t.project_name))];

  const filteredTasks = tasks.filter(t => {
    return (
      (selectedUser === "" || t.assigned_to_username === selectedUser) &&
      (selectedProject === "" || t.project_name === selectedProject) &&
      (statusFilter === "" || t.status === statusFilter) &&
      (search === "" || t.title.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="container">

      <div className="mb-4">
        <h2 className="fw-bold">📋 Toutes les tâches</h2>

        <p className="text-muted">
          Vue d’ensemble de toutes les tâches dans tous les projets
        </p>
      </div>

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="row g-2 align-items-center">

            <div className="col-md-3">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Search size={18} />
                </span>

                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher une tâche..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

            </div>

            <div className="col-md-3">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <User size={18} />
                </span>

                <select
                  className="form-select border-start-0"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Tous les membres</option>

                  {users.map((u, i) => (
                    <option key={i} value={u}>
                      {u}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            <div className="col-md-3">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Folder size={18} />
                </span>

                <select
                  className="form-select border-start-0"
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                    setSelectedUser("");
                  }}
                >
                  <option value="">Tous les projets</option>

                  {projects.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            <div className="col-md-2">

              <div className="input-group">

                <span className="input-group-text bg-white">
                  <Filter size={18} />
                </span>

                <select
                  className="form-select border-start-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>

                  <option value="en_attente">
                    En attente
                  </option>

                  <option value="en_cours">
                    En cours
                  </option>

                  <option value="terminee">
                    Terminée
                  </option>

                </select>

              </div>

            </div>

            <div className="col-md-1">

              <button
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center"
                onClick={() => {
                  setSelectedUser("");
                  setSelectedProject("");
                  setStatusFilter("");
                  setSearch("");
                }}
              >
                <RotateCcw size={16} />
              </button>

            </div>

          </div>

        </div>

      </div>

    
      <div className="card border-0 shadow-lg rounded-4 p-3">

        <h5 className="mb-3">Liste des tâches</h5>

        <div className="table-responsive">

          <table className="table align-middle table-hover">

            <thead className="table-light">
              <tr>
                <th>Tâche</th>
                <th>Membre</th>
                <th>Projet</th>
                <th>Statut</th>
                <th>Date limite</th>
                <th>Heures</th>
                <th>Coût</th>
              </tr>
            </thead>

            <tbody>

              {filteredTasks.map(t => (

                <tr key={t.id}>

                  <td className="fw-semibold">
                    {t.title}
                  </td>

                  <td>
                    {t.assigned_to_username}
                  </td>

                  <td>
                    {t.project_name}
                  </td>

                  <td>

                    <span className={
                      `badge px-3 py-2 ${
                        t.status === "en_attente"
                          ? "bg-danger"
                          : t.status === "en_cours"
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`
                    }>

                      {t.status === "en_attente"
                        ? "En attente"
                        : t.status === "en_cours"
                        ? "En cours"
                        : "Terminée"}

                    </span>

                  </td>

                  <td>
                    {t.deadline}
                  </td>

                  <td>
                    {t.hours} h
                  </td>

                  <td>
                    {t.cost} DT
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AllTasks;