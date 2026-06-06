import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; 

function TaskDetails({ isModal = false }) {

  const { taskId } = useParams(); 
  const [task, setTask] = useState(null);
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!taskId) return;

    axios.get(
      `http://127.0.0.1:8000/api/tasks/${taskId}/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    .then(res => setTask(res.data))
    .catch(err => console.log(err));

  }, [taskId]);

  if (!task) return <p>Chargement...</p>;

  return (
  <div className={isModal ? "" : "container mt-5"}>

    {!isModal && (
      <div className="mb-4">
        <h2 className="fw-bold"> Détails de la tâche</h2>
        <p className="text-muted">
          Informations complètes sur cette tâche
        </p>
      </div>
    )}

    <div className="card border-0 shadow-lg rounded-4 p-4">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">{task.title}</h4>

        <span
          className={`badge px-3 py-2 ${
            task.status === "en_attente"
              ? "bg-danger"
              : task.status === "en_cours"
              ? "bg-warning text-dark"
              : "bg-success"
          }`}
        >
          {task.status === "en_attente"
            ? "En attente"
            : task.status === "en_cours"
            ? "En cours"
            : "Terminée"}
        </span>
      </div>

      <hr />

      <div className="mb-4">
        <h6 className="text-muted"> Description</h6>
        <p className="mb-0">{task.description}</p>
      </div>

      <div className="row g-3">

        <div className="col-md-6">
          <div className="bg-light p-3 rounded-3">
            <small className="text-muted"> Assignée à</small>
            <div className="fw-semibold">
              {task.assigned_to_username}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="bg-light p-3 rounded-3">
            <small className="text-muted"> Heures</small>
            <div className="fw-semibold">
              {task.hours} h
            </div>
          </div>
        </div>

        {task.deadline && (
          <div className="col-md-6">
            <div className="bg-light p-3 rounded-3">
              <small className="text-muted">
                 Date limite
              </small>
              <div className="fw-semibold">
                {task.deadline}
              </div>
            </div>
          </div>
        )}

        {task.project_name && (
          <div className="col-md-6">
            <div className="bg-light p-3 rounded-3">
              <small className="text-muted"> Projet</small>
              <div className="fw-semibold">
                {task.project_name}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>

  </div>
);
}

export default TaskDetails;