import { useEffect, useState } from "react";
import axios from "axios";
import ProjectChart from "../components/ProjectChart";
import ProjectStatusPie from "../components/ProjectStatusPie";
import AlertsDonutChart from "../components/AlertStats";

export default function UserHome() {

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {

    axios.get("http://127.0.0.1:8000/api/projects/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`
      }
    })

    .then(res => {
      setProjects(res.data.results);
    })

    .catch(() => {
      console.log("Erreur lors du chargement des projets");
    });

  }, []);

  useEffect(() => {

    if (projects.length > 0) {
      setSelectedProject(projects[0].id);
    }

  }, [projects]);

  return (

    <div className="container mt-4">

      
      <div className="mb-4">

        <h2 className="fw-bold">
           Tableau de bord des projets
        </h2>

        <p className="text-muted">
          Suivez les statistiques et la progression de vos projets
        </p>

      </div>

     
      <div className="row mb-4">

        <div className="col-md-6 mb-4">

          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">

            

            <ProjectStatusPie />

          </div>

        </div>

        <div className="col-md-6 mb-4">

          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">

            

            <AlertsDonutChart />

          </div>

        </div>

      </div>

    
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">

        <label className="form-label fw-bold">
           Sélectionner un projet
        </label>

        <select
          className="form-select"
          value={selectedProject || ""}
          onChange={(e) => setSelectedProject(e.target.value)}
        >

          <option value="">
            -- Choisir un projet --
          </option>

          {projects.map((p) => (

            <option
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>

          ))}

        </select>

      </div>

      
      {selectedProject && (

        <div className="card border-0 shadow-sm rounded-4 p-4">

          <h5 className="fw-bold mb-4">

             Analyse du projet :{" "}
            {
              projects.find(
                p => p.id == selectedProject
              )?.name
            }

          </h5>

          <ProjectChart
            projectId={selectedProject}
            projectName={
              projects.find(
                p => p.id == selectedProject
              )?.name
            }
          />

        </div>

      )}

    </div>
  );
}