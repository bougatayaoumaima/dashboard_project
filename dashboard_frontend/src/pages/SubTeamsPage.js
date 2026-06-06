import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

function SubTeamsPage() {

  const token = localStorage.getItem("access");

  const [subTeams, setSubTeams] = useState([]);
  const [teams, setTeams] = useState([]);

  const [name, setName] = useState("");
  const [team, setTeam] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const fetchSubTeams = async () => {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/subteams/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setSubTeams(data);

    } catch (err) {

      toast.error("Échec du chargement des sous-équipes ");

    }
  };

  const fetchTeams = async () => {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/teams/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setTeams(data);

    } catch (err) {

      toast.error("Échec du chargement des équipes ");

    }
  };

  useEffect(() => {

    fetchSubTeams();
    fetchTeams();

  }, []);

  const resetForm = () => {

    setName("");
    setTeam("");
    setEditingId(null);

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `http://127.0.0.1:8000/api/subteams/${editingId}/`
        : "http://127.0.0.1:8000/api/subteams/";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          team,
        }),
      });

      const data = await res.json();

      if (!res.ok) {

        throw data;

      }

      toast.success(
        editingId
          ? "Sous-équipe modifiée avec succès "
          : "Sous-équipe créée avec succès "
      );

      fetchSubTeams();

      resetForm();

      setShowModal(false);

    } catch (err) {

      console.log(err);

      if (err.name) {

        toast.error(err.name[0]);

      } else {

        toast.error("Une erreur est survenue ");

      }
    }
  };

  const handleEdit = (subteam) => {

    setEditingId(subteam.id);

    setName(subteam.name);

    setTeam(subteam.team);

    setShowModal(true);
  };

  const handleDelete = (id) => {

  toast(
    ({ closeToast }) => (
      <div>

        <p>Supprimer cette sous-équipe ?</p>

        <button
          className="btn btn-danger btn-sm me-2"
          onClick={async () => {

            try {

              const res = await fetch(
                `http://127.0.0.1:8000/api/subteams/${id}/`,
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

              toast.success(
                data.message || "Sous-équipe supprimée "
              );

              setSubTeams(prev =>
                prev.filter(subteam => subteam.id !== id)
              );

              fetchSubTeams();

              closeToast();

            } catch {

              toast.error("Erreur serveur ");

            }
          }}
        >
          Oui
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={closeToast}
        >
          Non
        </button>

      </div>
    ),
    {
      autoClose: false,
    }
  );
};

  return (

    <div className="container-fluid px-4 py-4">

    
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-0">
            Gestion des sous-équipes
          </h2>

          <small className="text-muted">
            Gérer les spécialités et équipes du projet
          </small>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {

            resetForm();

            setShowModal(true);

          }}
        >
          + Ajouter une sous-équipe
        </button>

      </div>

   
      <div className="card border-0 shadow-sm rounded-4 p-4">

        <h4 className="fw-bold mb-4">
          Toutes les sous-équipes
        </h4>

        <div className="table-responsive">

          <table className="table align-middle">

            <thead className="table-light">

              <tr>
                <th>ID</th>
                <th>Nom de la sous-équipe</th>
                <th>Équipe</th>
                <th className="text-end">Actions</th>
              </tr>

            </thead>

            <tbody>

              {subTeams.map((subteam) => (

                <tr key={subteam.id}>

                  <td>{subteam.id}</td>

                  <td>
                    <span className="badge bg-dark">
                      {subteam.name}
                    </span>
                  </td>

                  <td>
                    <span className="badge bg-primary">
                      {subteam.team_name || subteam.team}
                    </span>
                  </td>

                  <td className="text-end">

                    <button
                      className="btn btn-sm btn-light me-2"
                      onClick={() => handleEdit(subteam)}
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(subteam.id)}
                    >
                      <FaTrash />
                    </button>

                  </td>

                </tr>

              ))}

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
                    ? "Modifier la sous-équipe"
                    : "Créer une sous-équipe"}

                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />

              </div>

              <div className="modal-body">

                <form onSubmit={handleSubmit}>

                
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Nom de la sous-équipe
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Entrez le nom de la sous-équipe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Équipe
                    </label>

                    <select
                      className="form-select"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      required
                    >

                      <option value="">
                        Sélectionner une équipe
                      </option>

                      {teams.map((t) => (

                        <option
                          key={t.id}
                          value={t.id}
                        >
                          {t.name}
                        </option>

                      ))}

                    </select>

                  </div>

                  <button className="btn btn-primary w-100">

                    {editingId
                      ? "Modifier la sous-équipe"
                      : "Créer la sous-équipe"}

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

export default SubTeamsPage;