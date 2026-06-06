import { useEffect, useState } from "react";
import axios from "axios";
import ProjectChart from "../components/ProjectChart";
import ProjectStatusPie from "../components/ProjectStatusPie";
import AlertsDonutChart from "../components/AlertStats";
export default function Dashboard() {

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [users, setUsers] = useState([]);
  const [chefFilter, setChefFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const selected = projects.find(p => p.id == selectedProject);
  const fetchProjects = (pageNumber = 1) => {
  
  let url = `http://127.0.0.1:8000/api/projects/?page=${pageNumber}`;

  if (chefFilter) {
    url += `&chef_projet=${chefFilter}`;
  }

  axios.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`
    }
  }).then(res => {
    setProjects(res.data.results);
    setNextPage(res.data.next);
    setPrevPage(res.data.previous);
  });
};

  useEffect(() => {
  setPage(1);          
  fetchProjects(1);
}, [chefFilter]);

  useEffect(() => {
    fetchProjects(page);
  }, [page]);
useEffect(() => {
  if (projects.length > 0 && !selectedProject) {
    setSelectedProject(projects[0].id);
  }
}, [projects]);
  useEffect(() => {
  axios.get("http://127.0.0.1:8000/api/users-chef/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`
    }
  }).then(res => {
    setUsers(res.data);
  });
}, []);

  return (
  <div className="container mt-4">
   <div className="saas-header d-flex justify-content-between align-items-center mb-4">

  <div>
    <h1 className="saas-title mb-1">
      Tableau de bord intelligent
    </h1>

    <p className="saas-subtitle mb-0">
       Analyses en temps réel et prédictions IA pour vos projets
    </p>
  </div>

  <div className="saas-badge">
     EN DIRECT
  </div>

</div>


    <div className="row g-4 mb-4">

  <div className="col-md-6">
    
        
        <ProjectStatusPie />
     
  </div>

  <div className="col-md-6">
  
        
        <AlertsDonutChart />
     
  </div>

</div>

    
    <div className="filter-card mb-4">

  <div className="row g-3">

    <div className="col-md-4">
      <select
        className="form-select modern-input"
        value={chefFilter}
        onChange={(e) => setChefFilter(e.target.value)}
      >
        <option value=""> Tous les chefs</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
    </div>

    <div className="col-md-4">
      <select
        className="form-select modern-input"
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
      >
        <option value="">Sélectionner un projet</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>

    <div className="col-md-4">
      <button
        className="btn btn-gradient w-100"
        onClick={() => {
          setChefFilter("");
          setSelectedProject("");
        }}
      >
         Réinitialiser les filtres
      </button>
    </div>

  </div>

</div>

   
  {selectedProject && (
  <div className="card dashboard-card">

    <div className="card-body">

      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">
           {selected?.name}
        </h5>

        <span className="badge bg-gradient">
            Données en direct
        </span>
      </div>

      <ProjectChart projectId={selectedProject} />

    </div>

  </div>
)}

  </div>
);
}
