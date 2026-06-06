import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProjectTeam({ projectId, isModal = false }) {

  const [data, setData] = useState(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const fetchTeam = async () => {

    try {

      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/${projectId}/team/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setData(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    if (projectId) {
      fetchTeam();
    }

  }, [projectId]);

  const handleDelete = async (memberId) => {

    if (!window.confirm("Supprimer ce membre ?")) return;

    try {

      await axios.post(
        "http://127.0.0.1:8000/api/remove-member/",
        {
          project_id: projectId,
          member_id: memberId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setData(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));

    } catch(err){

      if (err.response && err.response.data) {

        alert(err.response.data.error);

      } else {

        alert("Erreur lors de la suppression du membre");

      }
    }
  };

  const goToMemberTasks = (memberId) => {

    navigate(`/member/${memberId}/tasks/${projectId}`);

  };

  if (!data)
    return (
      <p>Chargement...</p>
    );

  return (

    <div className={isModal ? "" : "container py-4"}>

      {!isModal && (

        <h3 className="fw-bold mb-4">
           Équipe du projet {data.project}
        </h3>

      )}

      {data.members.length === 0 && (

        <div className="alert alert-info rounded-4">
          Aucun membre dans ce projet
        </div>

      )}

      <div className="row g-4">

        {data.members.map(m => (

          <div key={m.id} className="col-md-6 col-lg-4">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body">

                <div className="d-flex align-items-center mb-3">

                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "45px",
                      height: "45px",
                      fontWeight: "bold"
                    }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>

                  <div>

                    <h6 className="mb-0 fw-bold">
                      {m.name}
                    </h6>

                    <small className="text-muted">
                      Membre de l’équipe
                    </small>

                  </div>

                </div>

                
                <div className="mb-3">

                  <div className="d-flex justify-content-between mb-1">

                    <small className="text-muted">
                      Progression
                    </small>

                    <small className="fw-semibold">
                      {m.progress || 0}%
                    </small>

                  </div>

                  <div
                    className="progress"
                    style={{ height: "8px" }}
                  >

                    <div
                      className="progress-bar"
                      style={{
                        width: `${m.progress || 0}%`
                      }}
                    ></div>

                  </div>

                </div>

                <div>

                  <h6 className="fw-semibold mb-2">
                    Tâches
                  </h6>

                  {!m.tasks || m.tasks.length === 0 ? (

                    <small className="text-muted">
                      Aucune tâche assignée
                    </small>

                  ) : (

                    <ul className="list-unstyled">

                      {m.tasks?.map(t => (

                        <li
                          key={t.id}
                          className="mb-1 d-flex justify-content-between"
                        >

                          <span
                            className="text-truncate"
                            style={{ maxWidth: "70%" }}
                          >
                            {t.title}
                          </span>

                          <span
                            className={`badge rounded-pill ${
                              t.status === "DONE"
                                ? "bg-success"
                                : t.status === "EN_COURS"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {t.status}
                          </span>

                        </li>

                      ))}

                    </ul>

                  )}

                </div>

              </div>

              <div className="card-footer bg-white border-0 d-flex justify-content-between">

                <button
                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                  onClick={() => handleDelete(m.id)}
                >
                  Supprimer
                </button>

                <button
                  className="btn btn-sm btn-primary rounded-pill px-3"
                  onClick={() => goToMemberTasks(m.id)}
                >
                  Voir les tâches
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default ProjectTeam;