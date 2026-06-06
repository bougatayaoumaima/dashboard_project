import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function ProjectDetails() {

  const { id } = useParams();

  const [project, setProject] = useState(null);

  const token = localStorage.getItem("access");

  useEffect(() => {

    axios.get(`http://127.0.0.1:8000/api/projects/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    .then(res => setProject(res.data))

    .catch(err => console.log(err));

  }, [id]);

  if (!project)
    return (
      <p className="text-center mt-5">
        Chargement...
      </p>
    );

  return (

    <div className="container mt-5">

      
      <div className="card shadow-lg p-4 mb-4">

        <h2 className="mb-3">
           {project.name}
        </h2>

        <p className="text-muted">
          {project.description}
        </p>

      </div>

   
      <div className="row">

       
        <div className="col-md-6">

          <div className="card shadow-sm p-3 mb-3">

            <h5> Informations du projet</h5>

            <p>
              <b>Statut :</b>

              <span className="badge bg-success ms-2">
                {project.status}
              </span>
            </p>

            <p>
              <b>Budget :</b>  {project.budget}
            </p>

          </div>

        </div>

        
        <div className="col-md-6">

          <div className="card shadow-sm p-3 mb-3">

            <h5> Calendrier</h5>

            <p>
              <b>Date de début :</b> {project.start_date}
            </p>

            <p>
              <b>Date de fin :</b> {project.end_date}
            </p>

          </div>

        </div>

      </div>

      
      <div className="card shadow p-4 mt-3">

        <h4> Membres de l’équipe</h4>

        <div className="row mt-3">

          {project.members.map(m => (

            <div key={m.id} className="col-md-4 mb-3">

              <div className="card p-3 text-center shadow-sm">

                <h6>
                  {m.first_name} {m.last_name}
                </h6>

                <span className="badge bg-primary">
                  {m.sub_team_name}
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default ProjectDetails;