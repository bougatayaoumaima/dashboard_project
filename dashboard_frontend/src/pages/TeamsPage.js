import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

function TeamsPage() {

  const token = localStorage.getItem("access");

  const [teams, setTeams] = useState([]);

  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [showModal, setShowModal] = useState(false);


  const fetchTeams = () => {

    fetch("http://127.0.0.1:8000/api/teams/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
      })
      .catch(() => {
        toast.error("Échec du chargement des équipes ");
      });
  };

  useEffect(() => {
    fetchTeams();
  }, []);


  const resetForm = () => {
    setName("");
    setEditingId(null);
  };


  const handleSubmit = (e) => {

    e.preventDefault();

    const method = editingId ? "PUT" : "POST";

    const url = editingId
      ? `http://127.0.0.1:8000/api/teams/${editingId}/`
      : "http://127.0.0.1:8000/api/teams/";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name,
      }),
    })
      .then(async (res) => {

        const data = await res.json();

        if (!res.ok) {
          throw data;
        }

        return data;
      })

      .then(() => {

        toast.success(
          editingId
            ? "Équipe modifiée avec succès "
            : "Équipe créée avec succès "
        );

        fetchTeams();

        resetForm();

        setShowModal(false);
      })

      .catch((err) => {

        console.log(err);

        if (err.name) {
          toast.error(err.name[0]);
        } else {
          toast.error("Une erreur est survenue ");
        }
      });
  };


  const handleEdit = (team) => {

    setName(team.name);

    setEditingId(team.id);

    setShowModal(true);
  };


const handleDelete = (id) => {

  toast(
    ({ closeToast }) => (
      <div>

        <p>Voulez-vous vraiment supprimer cette équipe ?</p>

        <button
          className="btn btn-sm btn-danger me-2"
          onClick={async () => {

            try {

              const res = await fetch(
                `http://127.0.0.1:8000/api/teams/${id}/`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              let data = {};

              if (res.status !== 204) {
                data = await res.json();
              }

              if (!res.ok) {

                toast.error(
                  data.error || "Échec de la suppression "
                );

                return;
              }

              toast.success("Équipe supprimée ");

              setTeams(prev =>
                prev.filter(team => team.id !== id)
              );

              closeToast();

            } catch {

              toast.error("Erreur serveur ");

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

    { autoClose: false }
  );
};


  return (

    <div className="container-fluid px-4 py-4">

     

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-0">
            Gestion des Équipes
          </h2>

          <small className="text-muted">
            Gérer toutes les équipes
          </small>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {

            resetForm();

            setShowModal(true);
          }}
        >
          + Nouvelle Équipe
        </button>

      </div>

    

      <div className="card border-0 shadow-sm rounded-4 p-4">

        <h4 className="fw-bold mb-4">
          Liste des Équipes
        </h4>

        <div className="table-responsive">

          <table className="table align-middle">

            <thead className="table-light">

              <tr>
                <th>ID</th>
                <th>Nom de l'Équipe</th>
                <th className="text-end">Actions</th>
              </tr>

            </thead>

            <tbody>

              {teams.length > 0 ? (

                teams.map((team) => (

                  <tr key={team.id}>

                    <td>{team.id}</td>

                    <td>
                      <span className="badge bg-primary fs-6">
                        {team.name}
                      </span>
                    </td>

                    <td className="text-end">

                      <button
                        className="btn btn-sm btn-light me-2"
                        onClick={() => handleEdit(team)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(team.id)}
                      >
                        <FaTrash />
                      </button>

                    </td>

                  </tr>
                ))

              ) : (

                <tr>

                  <td colSpan="3" className="text-center py-4">

                    Aucune équipe trouvée

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

     

      {showModal && (

        <div className="modal show d-block">

          <div className="modal-dialog">

            <div className="modal-content">

          
              <div className="modal-header">

                <h5 className="modal-title">

                  {editingId
                    ? "Modifier l'Équipe"
                    : "Créer une Équipe"}

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
                      Nom de l'Équipe
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Entrer le nom de l'équipe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                  </div>

                  <button className="btn btn-primary w-100">

                    {editingId
                      ? "Mettre à jour l'Équipe"
                      : "Créer l'Équipe"}

                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default TeamsPage;