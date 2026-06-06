import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

function RolesPage() {

  const token = localStorage.getItem("access");

  const [roles, setRoles] = useState([]);

  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [showModal, setShowModal] = useState(false);


  const fetchRoles = () => {

    fetch("http://127.0.0.1:8000/api/roles/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRoles(data);
      })
      .catch(() => {
        toast.error("Échec du chargement des rôles ");
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);


  const resetForm = () => {

    setName("");

    setEditingId(null);
  };


  const handleSubmit = (e) => {

    e.preventDefault();

    const method = editingId ? "PUT" : "POST";

    const url = editingId
      ? `http://127.0.0.1:8000/api/roles/${editingId}/`
      : "http://127.0.0.1:8000/api/roles/";

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
            ? "Rôle modifié avec succès "
            : "Rôle créé avec succès "
        );

        fetchRoles();

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


  const handleEdit = (role) => {

    setName(role.name);

    setEditingId(role.id);

    setShowModal(true);
  };


  const handleDelete = (id) => {

toast(
({ closeToast }) => (
<div>

    <p>Voulez-vous vraiment supprimer ce rôle ?</p>

    <button
      className="btn btn-sm btn-danger me-2"
      onClick={async () => {

        try {

          const res = await fetch(
            `http://127.0.0.1:8000/api/roles/${id}/`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.status === 204) {

            toast.success("Rôle supprimé avec succès ");

            setRoles((prev) =>
              prev.filter((role) => role.id !== id)
            );

            closeToast();

            return;
          }

          // CAS D'ERREUR
          const data = await res.json();

          toast.error(
            data.error || "Échec de la suppression "
          );

        } catch (err) {

          console.log(err);

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
            Gestion des rôles
          </h2>

          <small className="text-muted">
            Gérer les rôles et permissions du système
          </small>

        </div>

        <button
          className="btn btn-primary"
          onClick={() => {

            resetForm();

            setShowModal(true);
          }}
        >
          + Nouveau rôle
        </button>

      </div>


      <div className="card border-0 shadow-sm rounded-4 p-4">

        <h4 className="fw-bold mb-4">
          Liste des rôles
        </h4>

        <div className="table-responsive">

          <table className="table align-middle">

            <thead className="table-light">

              <tr>
                <th>ID</th>
                <th>Nom du rôle</th>
                <th className="text-end">Actions</th>
              </tr>

            </thead>

            <tbody>

              {roles.length > 0 ? (

                roles.map((role) => (

                  <tr key={role.id}>

                    <td>{role.id}</td>

                    <td>

                      <span className="badge bg-dark fs-6">
                        {role.name}
                      </span>

                    </td>

                    <td className="text-end">

                      <button
                        className="btn btn-sm btn-light me-2"
                        onClick={() => handleEdit(role)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(role.id)}
                      >
                        <FaTrash />
                      </button>

                    </td>

                  </tr>
                ))

              ) : (

                <tr>

                  <td colSpan="3" className="text-center py-4">

                    Aucun rôle trouvé

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
                    ? "Modifier le rôle"
                    : "Créer un rôle"}

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
                      Nom du rôle
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Entrez le nom du rôle"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                  </div>

                  <button className="btn btn-primary w-100">

                    {editingId
                      ? "Modifier le rôle"
                      : "Créer le rôle"}

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

export default RolesPage;