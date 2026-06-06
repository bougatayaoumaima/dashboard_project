import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function MemberTasks(){

const { memberId, projectId } = useParams();
const [tasks,setTasks] = useState([]);
const token = localStorage.getItem("access");
const navigate = useNavigate();

useEffect(()=>{

axios.get(
`http://127.0.0.1:8000/api/member/${memberId}/tasks/${projectId}/`,
{
headers:{ Authorization:`Bearer ${token}` }
}
)
.then(res=>setTasks(res.data))
.catch(err=>console.log(err));

},[]);


const deleteTask = async (id) => {

  toast(
    ({ closeToast }) => (
      <div>

        <p>Êtes-vous sûr de vouloir supprimer cette tâche ?</p>

        <button
          className="btn btn-sm btn-danger me-2"
          onClick={async () => {

            try {

              await axios.delete(
                `http://127.0.0.1:8000/api/tasks/${id}/`,
                {
                  headers:{
                    Authorization:`Bearer ${token}`
                  }
                }
              );

              setTasks(prev =>
                prev.filter(t => t.id !== id)
              );

              toast.success("Tâche supprimée avec succès ");

              closeToast();

            } catch(err) {

              if (err.response && err.response.data) {
                toast.error(err.response.data.error);
              } else {
                toast.error("Une erreur est survenue ");
              }

            }

          }}
        >
          Oui
        </button>

        <button
          className="btn btn-sm btn-secondary"
          onClick={closeToast}
        >
          Non
        </button>

      </div>
    ),
    { autoClose:false }
  );

};


const updateStatus = async (id,status)=>{

try{

await axios.put(
`http://127.0.0.1:8000/api/tasks/${id}/status/`,
{ status },
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setTasks(prev =>
  prev.map(t =>
    t.id === id ? { ...t, status } : t
  )
);

toast.success("Tâche mise à jour avec succès ");

}catch(err){

console.log(err);

toast.error("Échec de la mise à jour ");

}

};


return (

<div className="container mt-5">

 
  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 className="fw-bold"> Tâches du membre</h2>
      <p className="text-muted mb-0">Gérer et suivre les tâches du membre</p>
    </div>
  </div>

  <div className="row">
    {tasks.map(t => (

      <div key={t.id} className="col-md-6 col-lg-4 mb-4">

        <div className="card border-0 shadow-lg rounded-4 h-100 p-3">

         
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="fw-bold mb-0">{t.title}</h5>

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
          </div>

          
          <p className="text-muted small">
            {t.description?.length > 80
              ? t.description.slice(0, 80) + "..."
              : t.description}
          </p>

         
          <div className="mt-auto d-flex gap-2">

  <button
    className={`btn w-100 rounded-3 ${
      t.status === "terminee"
        ? "btn-secondary disabled"
        : "btn-outline-warning"
    }`}
    disabled={t.status === "terminee"}
    onClick={() =>
      navigate(`/user/edit-task/${projectId}/${t.id}`)
    }
  >
     Modifier
  </button>

  <button
    className={`btn w-100 rounded-3 ${
      t.status === "terminee"
        ? "btn-secondary disabled"
        : "btn-outline-danger"
    }`}
    disabled={t.status === "terminee"}
    onClick={() => deleteTask(t.id)}
  >
     Supprimer
  </button>

</div>

          <button
            className="btn btn-primary w-100 mt-2 rounded-3"
            onClick={() => navigate(`/user/task-details/${t.id}`)}
          >
             Voir les détails
          </button>

        </div>

      </div>

    ))}
  </div>

</div>

);

}

export default MemberTasks;