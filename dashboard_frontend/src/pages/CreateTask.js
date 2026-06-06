import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreateTask() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [assigned, setAssigned] = useState("");
  const [hours, setHours] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const { id, taskId } = useParams();
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/projects/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProjects(res.data.results || res.data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (taskId) {
      axios.get(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {

          setTitle(res.data.title);
          setDescription(res.data.description);
          setAssigned(Number(res.data.assigned_to));
          setHours(res.data.hours);

          setSelectedProject(
            typeof res.data.project === "object"
              ? res.data.project.id
              : res.data.project
          );

          setDeadline(
            res.data.deadline
              ? res.data.deadline.split("T")[0]
              : ""
          );

        })
        .catch(err => console.log(err));
    }
  }, [taskId]);

  useEffect(() => {

    if (selectedProject) {

      axios.get(
        `http://127.0.0.1:8000/api/projects/${selectedProject}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
        .then(res => setMembers(res.data.members || []))
        .catch(err => console.log(err));

    }

  }, [selectedProject]);

  useEffect(() => {

    if (id) {
      setSelectedProject(id);
    }

  }, [id]);

  const handleSubmit = async () => {

    if (!hours || Number(hours) <= 0 || Number(hours) > 100) {

      toast.error(
        "Les heures doivent être comprises entre 1 et 100"
      );

      return;
    }

    if (!assigned) {

      toast.error("Sélectionnez un membre");

      return;
    }

    try {

      if (taskId) {

        await axios.put(
          `http://127.0.0.1:8000/api/tasks/${taskId}/`,
          {
            title,
            description,
            assigned_to: Number(assigned),
            hours: Number(hours),
            deadline
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        toast.success("Tâche mise à jour");

      } else {

        await axios.post(
          "http://127.0.0.1:8000/api/tasks/",
          {
            title,
            description,
            project: selectedProject,
            assigned_to: assigned,
            hours: Number(hours),
            deadline
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        toast.success("Tâche créée");
      }

      navigate("/user/all-tasks");

    } catch (err) {

      const data = err.response?.data;

      console.log(data);

      if (data?.title) {

        toast.error(data.title[0]);

      } else if (data?.deadline) {

        toast.error(data.deadline[0]);

      } else if (data?.hours) {

        toast.error(data.hours[0]);

      } else {

        toast.error("Une erreur s'est produite");

      }

    }

  };

  return (

    <div className="container-fluid bg-light min-vh-100 py-5">

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 p-4">

            <div className="mb-4 p-4 rounded-4"
  style={{
  background: "#eef4ff",
  color: "#1e40af",
  border: "1px solid #dbeafe"
}}
>
              <h2 className="fw-bold mb-2">

                {taskId
                  ? " Modifier la tâche"
                  : " Créer une tâche"}

              </h2>

              <p className="text-muted mb-0">
                Remplissez les détails ci-dessous pour gérer votre tâche
              </p>

            </div>

          
              <div
  className="mb-4 p-3 rounded-4"
  style={{
    background: "#fafafa",
    border: "1px solid #ececec"
  }}
>

              <label className="fw-semibold mb-1">
                Titre
              </label>

              <input
                className="form-control"
                placeholder="Saisir le titre de la tâche"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

            </div>

            <div
  className="mb-4 p-3 rounded-4"
  style={{
    background: "#fafafa",
    border: "1px solid #ececec"
  }}
>

              <label className="fw-semibold mb-1">
                Description
              </label>

              <textarea
                className="form-control"
                rows="4"
                placeholder="Saisir la description de la tâche"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

            </div>

           <div
  className="mb-4 p-3 rounded-4"
  style={{
    background: "#fafafa",
    border: "1px solid #ececec"
  }}
>

              <label className="fw-semibold mb-1">
                Heures estimées
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="1 - 100"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />

            </div>

            <div
  className="mb-4 p-3 rounded-4"
  style={{
    background: "#fafafa",
    border: "1px solid #ececec"
  }}
>

              <label className="fw-semibold mb-1">
                Date limite
              </label>

              <input
                type="date"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

            </div>

            <div
  className="mb-4 p-4 rounded-4"
  style={{
  background: "#eef4ff",
  color: "#1e40af",
  border: "1px solid #dbeafe"
}}
>

              <label className="fw-semibold mb-2">
                Assigner à
              </label>

              <select
                className="form-select"
                value={assigned || ""}
                onChange={(e) => setAssigned(Number(e.target.value))}
              >

                <option value="">
                  Sélectionner un membre
                </option>

                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.username}
                  </option>
                ))}

              </select>

            </div>

            <div className="d-flex justify-content-end gap-2">

              <button
 className="btn px-5 py-2 fw-semibold"
 style={{
   background:"#4f46e5",
   color:"white",
   borderRadius:"14px"
 }}

                onClick={() => window.history.back()}
              >
                Annuler
              </button>

             <button
 className="btn px-4 py-2"
 style={{
   background:"#f3f4f6",
   borderRadius:"14px"
 }}

                onClick={handleSubmit}
              >

                {taskId
                  ? "Mettre à jour la tâche"
                  : "Créer la tâche"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreateTask;