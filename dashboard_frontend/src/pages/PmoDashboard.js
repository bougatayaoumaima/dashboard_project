import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, User, Filter, RotateCcw } from "lucide-react";
import "../styles/dashboard.css"
function PmoDashboard() {

const navigate = useNavigate();

const [projects,setProjects] = useState([]);
const [users,setUsers] = useState([]);

const [name,setName] = useState("");
const [description,setDescription] = useState("");
const [chef,setChef] = useState("");
const [editingId,setEditingId] = useState(null);
const [budget,setBudget] = useState("");
const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");
const [page, setPage] = useState(1);
const [nextPage, setNextPage] = useState(null);
const [prevPage, setPrevPage] = useState(null);
const [totalProjects, setTotalProjects] = useState(0);
const [selectedChef, setSelectedChef] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [search, setSearch] = useState("");
const [expandedProject, setExpandedProject] = useState(null);
const [projectTasks, setProjectTasks] = useState({});
const [stats, setStats] = useState({
  en_attente: "",
  en_cours: "",
  terminee: "",
  total: ""
});
const API = "http://127.0.0.1:8000/api/projects/";
const getToken = () => localStorage.getItem("access");
const [showModal, setShowModal] = useState(false);

const fetchProjects = async (pageNumber = 1) => {
  try {

    let url = `${API}?page=${pageNumber}`;

    if (selectedChef) {
      url += `&chef_projet=${selectedChef}`;
    }

    if (statusFilter) {
      url += `&status=${statusFilter}`;
    }

    if (search) {
      url += `&search=${search}`;
    }

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    setProjects(res.data.results);
    setNextPage(res.data.next);
    setPrevPage(res.data.previous);
    setTotalProjects(res.data.count);

  } catch (err) {
    console.log(err);
  }
};


const fetchUsers = async () => {

  try {

    const res = await axios.get(
      "http://127.0.0.1:8000/api/users-chef/",
      {
        headers:{
          Authorization:`Bearer ${getToken()}`
        }
      }
    );

    console.log("USERS API =>", res.data);

    const data = res.data.results || res.data;

    const chefs = data.filter(
      u => u.role_name === "CHEF_PROJET"
    );

    setUsers(chefs);

  } catch(err) {
    console.log(err);
  }
};


const fetchProjectTasks = async (projectId) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/api/tasks/?project=${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    setProjectTasks(prev => ({
      ...prev,
      [projectId]: res.data.results || res.data
    }));

  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchProjects(page);
  fetchUsers();
  fetchStats();
}, [page, selectedChef, statusFilter, search]);


const handleSubmit = async (e) => {

  
  e.preventDefault();
  const today = new Date();
  today.setHours(0,0,0,0); 

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!editingId) {

    if (start < today) {
      toast.error("La date de début doit être aujourd'hui ou plus tard ");
      return;
    }

  }

  if (end < start) {
    toast.error("La date de fin doit être après la date de début ");
    return;
  }

  try {
    if (editingId) {
  await axios.put(API + editingId + "/", {
    name,
    description,
    chef_projet: chef,
    budget,
    start_date: startDate,
    end_date: endDate,
  },{
    headers:{ Authorization:`Bearer ${getToken()}` }
  });

  toast.success("Projet mis à jour avec succès ");

} else {
  await axios.post(API,{
    name,
    description,
    chef_projet: chef,
    budget,
    start_date: startDate,
    end_date: endDate,
  },{
    headers:{ Authorization:`Bearer ${getToken()}` }
  });

  toast.success("Projet créé avec succès ");
}

await fetchProjects(page);
    setShowModal(false);
    setName("");
    setDescription("");
    setChef("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setEditingId(null);

await fetchStats();   

  } catch(err) {
    console.log(err);
    toast.error("Une erreur est survenue");
  }
};


const handleEdit = (project) => {
  setName(project.name);
  setDescription(project.description);
  setChef(String(project.chef_projet));
  setBudget(project.budget);
  setStartDate(project.start_date);
  setEndDate(project.end_date);
  setEditingId(project.id);

  setShowModal(true);
};


const handleDelete = async (id) => {
  toast(
    ({ closeToast }) => (
      <div>
        <p>Êtes-vous sûr de vouloir supprimer ce projet ?</p>
        <button
          className="btn btn-sm btn-danger me-2"
          onClick={async () => {
            try {
              await axios.delete(API + id + "/", {
                headers:{ Authorization:`Bearer ${getToken()}` }
              });

              toast.success("Projet supprimé ");
              fetchProjects(page);
              fetchStats();
              closeToast();

            } catch(err) {
              toast.error(err.response?.data?.error || "La suppression a échoué ");
            }
          }}
        >
          Yes
        </button>

        <button className="btn btn-sm btn-secondary" onClick={closeToast}>
          No
        </button>
      </div>
    ),
    { autoClose: false }
  );
};
const fetchStats = async () => {
  try {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/dashboard-project-stats/",
      {
        headers: { Authorization: `Bearer ${getToken()}` }
      }
    );
    setStats(res.data);
  } catch (err) {
    console.log(err);
  }
};

const exportPdf = async (projectId, projectName) => {

  try {

    const response = await axios.get(
      `http://127.0.0.1:8000/api/projects/${projectId}/report/`,
      {
        responseType: "blob",

        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `project_${projectName}.pdf`
    );

    document.body.appendChild(link);

    link.click();

  } catch (err) {
    console.log(err);
    toast.error("Échec de l'export PDF ");
  }
};


return (

  
<div className="container mt-4">

<div className="row g-3 mb-4">

  <div className="col-md-3">
    <div className="ultra-kpi">

      <center><span className="value">{stats.total}</span><br></br>
      <span className="label">Total des Projets</span></center>
      
    </div>
  </div>

  <div className="col-md-3">
    <div className="ultra-kpi">
      <center><span className="value">{stats.en_attente}</span><br></br>
      <span className="label">En attente</span></center>
      
    </div>
  </div>

  <div className="col-md-3">
    <div className="ultra-kpi">

      <center><span className="value">{stats.en_cours}</span><br></br>
      <span className="label">En cours</span></center>
      
    </div>
  </div>

  <div className="col-md-3">
    <div className="ultra-kpi">

      <center><span className="value">{stats.terminee}</span><br></br>
      <span className="label">Terminés</span></center>
      
    </div>
  </div>

</div>


  <div className="saas-header">

  <div>
    <h5 className="mb-3 fw-bold text-primary">Gestion des projets</h5>
    <p className="saas-subtitle">
      Gérez et suivez vos projets efficacement
    </p>
  </div>

  <button
    className="saas-btn"
    onClick={() => {
      setEditingId(null);
      setShowModal(true);
    }}
  >
    + Nouveau Projet
  </button>

</div>
<br></br>
  <div className="row g-4">

    {showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">
            {editingId ? "Modifier le projet" : "Ajouter un projet"}
          </h5>
          <button
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        <div className="modal-body">

          <form onSubmit={handleSubmit}>

 
  <div className="mb-3">
    <label className="form-label fw-semibold">
      Nom du projet
    </label>

    <input
      className="form-control"
      placeholder="Entrez le nom du projet"
      value={name}
      onChange={(e)=>setName(e.target.value)}
      required
    />
  </div>

  <div className="mb-3">
    <label className="form-label fw-semibold">
      Description
    </label>

    <textarea
      className="form-control"
      placeholder="Entrez une description"
      value={description}
      onChange={(e)=>setDescription(e.target.value)}
      required
    />
  </div>

 
  <div className="mb-3">
    <label className="form-label fw-semibold">
      Chef de projet
    </label>

    <select
      className="form-control"
      value={chef}
      onChange={(e)=>setChef(e.target.value)}
      required
    >
      <option value="">Sélectionner un chef</option>

      {users.map(user => (
        <option key={user.id} value={user.id}>
          {user.username}
        </option>
      ))}
    </select>
  </div>

  <div className="mb-3">
    <label className="form-label fw-semibold">
      Budget
    </label>

    <input
      className="form-control"
      type="number"
      placeholder="Entrez le budget"
      value={budget}
      onChange={(e)=>setBudget(e.target.value)}
      required
    />
  </div>

  <div className="mb-3">
    <label className="form-label fw-semibold">
      Date de début
    </label>

    <input
      className="form-control"
      type="date"
      value={startDate}
      onChange={(e)=>setStartDate(e.target.value)}
      required
    />
  </div>


  <div className="mb-3">
    <label className="form-label fw-semibold">
      Date de fin
    </label>

    <input
      className="form-control"
      type="date"
      value={endDate}
      onChange={(e)=>setEndDate(e.target.value)}
      required
    />
  </div>

  <button className="btn btn-primary w-100">
    {editingId ? "Update Project" : "Add Project"}
  </button>

</form>

        </div>

      </div>
    </div>
  </div>
)}

    
    <div className="saas-card">

  <div className="saas-table-header">
    <h4>Projets</h4>
  </div>

  <div className="saas-filters">

  
    <div className="saas-input">
      <Search size={16} />
      <input
        placeholder="Rechercher un projet..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>

  
    <div className="saas-input">
      <User size={16} />
      <select
        value={selectedChef}
        onChange={(e) => {
          setSelectedChef(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Tous les chefs</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>

    
    <div className="saas-input">
      <Filter size={16} />
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Tous les statuts</option>
        <option value="en_attente">En attente</option>
        <option value="en_cours">En cours</option>
        <option value="terminee">Terminé</option>
      </select>
    </div>

   
    <button
      className="saas-reset"
      onClick={() => {
        setSelectedChef("");
        setStatusFilter("");
        setSearch("");
        setPage(1);
      }}
    >
      <RotateCcw size={14} />
      Réinitialiser
    </button>

  </div>


  <div className="saas-table-wrapper">

    <table className="saas-table">

      <thead>
        <tr>
          <th>Nom</th>
          <th>Chef</th>
          <th>Budget</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
  {projects.map(p => (
    <>
      
      <tr key={p.id}>
        <td
          className="bold"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (expandedProject === p.id) {
              setExpandedProject(null);
            } else {
              setExpandedProject(p.id);
              fetchProjectTasks(p.id);
            }
          }}
        >
          {p.name}
        </td>

        <td>{p.chef_projet_username}</td>
        <td>{p.budget} DT</td>

        <td>
          <span className={`badge ${p.status}`}>
            {p.status}
          </span>
        </td>

        <td className="actions">

  <button onClick={() => handleEdit(p)}>
    Modifier
  </button>

  <button
    className="danger"
    onClick={() => handleDelete(p.id)}
  >
    Supprimer
  </button>
  <button
  onClick={() => exportPdf(p.id , p.name)}
>
  Exporter PDF
</button>

  

</td>
      </tr>

      {expandedProject === p.id && (
        <tr>
          <td colSpan="5">
            <div className="p-3 bg-light rounded">

              <h6>Tâches</h6>

              {projectTasks[p.id]?.length > 0 ? (
                <ul>
                  {projectTasks[p.id].map(task => (
                    <li key={task.id}>
  <strong>{task.title}</strong>
  <br />
  Statut : {task.status}
  <br />
  Chef de projet : {task.chef_projet}
</li>
                  ))}
                </ul>
              ) : (
                <p>Aucune tâche</p>
              )}

            </div>
          </td>
        </tr>
      )}

    </>
  ))}
</tbody>

    </table>

  </div>

 
  <div className="saas-pagination">

    <button disabled={!prevPage} onClick={() => setPage(p => Math.max(p - 1, 1))}>
      Précédent
    </button>

    <span>Page {page}</span>

    <button disabled={!nextPage} onClick={() => setPage(p => p + 1)}>
      Suivant
    </button>

  </div>

</div>

  </div>
</div>
);

}

export default PmoDashboard;