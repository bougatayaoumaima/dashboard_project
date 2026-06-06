import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import { toast } from "react-toastify";
function DeveloperDashboard() {

  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [projectFilter, setProjectFilter] = useState("all");
  const [chefFilter, setChefFilter] = useState("all");

  const token = localStorage.getItem("access");
  
const onDragEnd = async (result) => {

  if (!result.destination) return;

  const sourceColumn = result.source.droppableId;

  const destinationColumn =
    result.destination.droppableId;

  if (sourceColumn === destinationColumn) {
    return;
  }

  const taskId = parseInt(result.draggableId);
  setTasks(prev =>
  prev.map(task =>
    task.id === taskId
      ? {
          ...task,
          status: destinationColumn
        }
      : task
  )
);
  try {

    await axios.put(
      `http://127.0.0.1:8000/api/tasks/${taskId}/status/`,
      {
        status: destinationColumn
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    toast.success("Statut mis à jour avec succès");

    fetchTasks();

  } catch (err) {
    fetchTasks();

    toast.error(
  err.response?.data?.error ||
  "Transition invalide"
);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/");
  };

  const getOptions = (status) => {

    if (status === "en_attente") {
      return (
        <>
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
        </>
      );
    }

    if (status === "en_cours") {
      return (
        <>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
        </>
      );
    }

    if (status === "terminee") {
      return (
        <option value="terminee">Terminée</option>
      );
    }
  };


  const fetchTasks = () => {

    axios
      .get("http://127.0.0.1:8000/api/my-tasks/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      .then(res => setTasks(res.data))

      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getStatusColor = (status) => {

    if (status === "en_attente") return "warning";

    if (status === "en_cours") return "primary";

    if (status === "terminee") return "success";
  };

  
  const filteredTasks = tasks.filter(t => {

    return (
      (projectFilter === "all" ||
        t.project_name === projectFilter)

      &&

      (chefFilter === "all" ||
        t.chef_projet === chefFilter)
    );

  });
const columns = {
  en_attente: {
    title: "En attente",
    headerColor:"linear-gradient(135deg,#f59e0b,#f97316)",
    bodyColor: "#fff7ed",
    items: filteredTasks.filter(
      t => t.status === "en_attente"
    ),
  },

  en_cours: {
    title: "En cours",
   headerColor:"linear-gradient(135deg,#3b82f6,#2563eb)",
    bodyColor: "#eff6ff",
    items: filteredTasks.filter(
      t => t.status === "en_cours"
    ),
  },

  terminee: {
    title: "Terminée",
    headerColor:"linear-gradient(135deg,#22c55e,#16a34a)",
    bodyColor: "#f0fdf4",
    items: filteredTasks.filter(
      t => t.status === "terminee"
    ),
  },
};

  const en_attenteTasks =
    filteredTasks.filter(t => t.status === "en_attente");

  const inProgressTasks =
    filteredTasks.filter(t => t.status === "en_cours");

  const termineeTasks =
    filteredTasks.filter(t => t.status === "terminee");

  
  const projects =
    [...new Set(tasks.map(t => t.project_name))];

  const chefs =
    [...new Set(tasks.map(t => t.chef_projet))];

 
  const resetFilters = () => {

    setProjectFilter("all");

    setChefFilter("all");
  };


  const updateStatus = async (taskId, status) => {

    await axios.put(
      `http://127.0.0.1:8000/api/tasks/${taskId}/status/`,
      { status },

      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchTasks();
    
  };

  return (

    <div className="container mt-5">

     
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold">
            Tableau de bord Développeur
          </h2>
        </div>

        <div className="d-flex gap-2">
      
          <button
            className="btn btn-outline-primary px-4 d-flex align-items-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <FaUser />
            Mon Profil
          </button>
         
          <button
            className="btn btn-danger px-4 d-flex align-items-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Déconnexion
          </button>

        </div>

      </div>

    
      <div className="row mb-4">

    
        <div className="col-md-4">

          <div className="card p-3 shadow-sm border-0">

            <h6 className="text-muted">
              En attente
            </h6>

            <h3 className="text-warning">
              {en_attenteTasks.length}
            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card p-3 shadow-sm border-0">

            <h6 className="text-muted">
              En cours
            </h6>

            <h3 className="text-primary">
              {inProgressTasks.length}
            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card p-3 shadow-sm border-0">

            <h6 className="text-muted">
              Terminées
            </h6>

            <h3 className="text-success">
              {termineeTasks.length}
            </h3>

          </div>

        </div>

      </div>

      <div className="card p-3 mb-4 shadow-sm border-0">

        <div className="d-flex gap-3 align-items-center">
        
          <select
            className="form-select"
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >

            <option value="all">
              Tous les projets
            </option>

            {projects.map(p => (

              <option key={p}>
                {p}
              </option>

            ))}

          </select>

          <select
            className="form-select"
            value={chefFilter}
            onChange={e => setChefFilter(e.target.value)}
          >

            <option value="all">
              Tous les chefs de projet
            </option>

            {chefs.map(c => (

              <option key={c}>
                {c}
              </option>

            ))}

          </select>

      
          <button
            className="btn btn-outline-secondary"
            onClick={resetFilters}
          >
             Réinitialiser
          </button>

        </div>

      </div>

      <div className="row">

  <DragDropContext onDragEnd={onDragEnd}>

    {Object.entries(columns).map(
      ([columnId, column]) => (

        <div className="col-md-4" key={columnId}>

          <div className="card shadow-sm border-0 rounded-4">

            <div
  className="card-header"
  style={{
    background: column.headerColor,
    color: "white"
  }}
>
  <h5 className="fw-bold mb-0">
    {column.title}
  </h5>
</div>

            <div
  className="card-body kanban-column"
  style={{
    backgroundColor: column.bodyColor
  }}
>

              <Droppable droppableId={columnId}>

                {(provided) => (

                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: "500px"
                    }}
                  >

                    {column.items.map(
                      (task, index) => (

                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >

                          {(provided) => (

                            <div
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
  className="card mb-3 shadow-sm task-card"
  style={{
  backgroundColor: column.bodyColor,
  border: `2px solid ${column.headerColor}`,
  transition: "all .25s ease",
  cursor: "grab"
}}
>

                              <div className="card-body">

                                <h6 className="fw-bold">
                                  {task.title}
                                </h6>

                                <p className="text-muted small">
                                  {task.description}
                                </p>

                                <div className="small">

                                  <div>
                                     {task.project_name}
                                  </div>

                                  <div>
                                     {task.chef_projet}
                                  </div>

                                  <div>
                                     {task.deadline}
                                  </div>

                                </div>

                              </div>

                            </div>

                          )}

                        </Draggable>

                    ))}

                    {provided.placeholder}

                  </div>

                )}

              </Droppable>

            </div>

          </div>

        </div>

    ))}

  </DragDropContext>

</div>

          </div>

       
  );
}

export default DeveloperDashboard;