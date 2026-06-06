import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheckCircle,FaBan,FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const [image, setImage] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("");
  const [team, setTeam] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [filterRole, setFilterRole] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [salary, setSalary] = useState("");

  const token = localStorage.getItem("access");
  const navigate = useNavigate();
  const [subTeam, setSubTeam] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [subTeams, setSubTeams] = useState([]);
  const [filterSubTeam, setFilterSubTeam] = useState("");
  const [roles, setRoles] = useState([]);
  
const fetchUsers = () => {
  fetch(`http://127.0.0.1:8000/api/users/?page=${page}&role=${filterRole}&team=${filterTeam}&sub_team=${filterSubTeam}&search=${search}`, {
  headers: { Authorization: `Bearer ${token}` },
})
const params = new URLSearchParams();

params.append("page", page);

if (filterRole) {
  params.append("role", filterRole);
}

if (filterTeam) {
  params.append("team", filterTeam);
}

if (filterSubTeam) {
  params.append("sub_team", filterSubTeam);
}

if (search) {
  params.append("search", search);
}

fetch(`http://127.0.0.1:8000/api/users/?${params.toString()}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
    .then((res) => res.json())
.then((data) => {

  if (!data.results) {
    setUsers([]);
    return;
  }

  setUsers(data.results); 

  setTotalPages(Math.ceil(data.count / 10));

})
.catch((err) => {
  console.log(err);

  if (typeof err === "object") {
    Object.entries(err).forEach(([key, value]) => {
      toast.error(`${key}: ${value}`);
    });
  } else {
    toast.error("Une erreur est survenue");
  }
});

};

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole, filterTeam,filterSubTeam , search]);
  useEffect(() => {

  fetch("http://127.0.0.1:8000/api/teams/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => setTeams(data));

  fetch("http://127.0.0.1:8000/api/subteams/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => setSubTeams(data));
  fetch("http://127.0.0.1:8000/api/roles/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
})
  .then(res => res.json())
  .then(data => setRoles(data));
}, []);
  useEffect(() => {
  if (role !== "MEMBRE") {
    setSalary("");
  }
}, [role]);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "MEMBRE" && !team) {
      alert("L'équipe est obligatoire pour un membre");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://127.0.0.1:8000/api/users/${editingId}/`
      : "http://127.0.0.1:8000/api/users/";

    const baseData = {
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      
      team,
    };

    const bodyData = editingId
  ? {
      ...baseData,
      ...(role === "MEMBRE" && { salary_per_hour: salary })
    }
  : {
      ...baseData,
      password,
      ...(role === "MEMBRE" && { salary_per_hour: salary })
    };

    

    const formData = new FormData();

formData.append("first_name", firstName);
formData.append("last_name", lastName);
formData.append("email", email);
formData.append("role", role);

formData.append("team", team);
formData.append("sub_team", subTeam);

if (!editingId) {
  formData.append("password", password);
}

if (role === "MEMBRE") {
  formData.append("salary_per_hour", salary);
}

if (image) {
  formData.append("profile_image", image);
}

fetch(url, {
  method,
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
})
.then(async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
})
.then(() => {
  fetchUsers();
  resetForm();
  setShowModal(false);

  toast.success(
    editingId
      ? "Utilisateur mis à jour avec succès"
      : "Utilisateur créé avec succès"
  );
})
.catch((err) => {
  console.log(err);

  if (err.email) {
    toast.error(err.email[0]);
  } else if (err.username) {
    toast.error(err.username[0]);
  } else if (err.detail) {
    toast.error(err.detail);
  } else {
    toast.error("Something went wrong ❌");
  }
});


  };

const resetForm = () => {
  setFirstName("");
  setLastName("");
  setEmail("");
  setPassword("");
  setRole("");
  setTeam("");
  setSubTeam("");
  setEditingId(null);
  setSalary("");
  setImage(null);
  
};

const handleEdit = (user) => {
  setFirstName(user.first_name);
  setLastName(user.last_name);
  setEmail(user.email);
  setRole(user.role || "");
  setTeam(user.team || "");
  setSubTeam(user.sub_team || "");
  setEditingId(user.id);
  setSalary(user.salary_per_hour || "");
  setShowModal(true);
};
const handleResetPassword = async (id) => {

  const confirmReset = window.confirm(
    "Réinitialiser le mot de passe à 123 ?"
  );

  if (!confirmReset) return;

  try {

    await fetch(
      `http://127.0.0.1:8000/api/users/${id}/reset-password/`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(
      "Mot de passe réinitialisé à 123"
    );

  } catch {

    toast.error(
      "Erreur lors de la réinitialisation"
    );

  }
};
  const handleDeactivate = (id) => {

  toast(
    ({ closeToast }) => (
      <div>

        <p>Désactiver cet utilisateur ?</p>

        <button
          className="btn btn-danger btn-sm me-2"
          onClick={async () => {

            try {

              await fetch(
                `http://127.0.0.1:8000/api/users/${id}/`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              toast.success("Utilisateur désactivé");

              fetchUsers();

              closeToast();

            } catch {

              toast.error("Échec de l'opération ");

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
    { autoClose: false }
  );
};


const handleActivate = async (id) => {

  try {

    await fetch(
      `http://127.0.0.1:8000/api/users/${id}/activate/`,
      {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Utilisateur activé");

    fetchUsers();

  } catch {

    toast.error("Échec de l'activation");

  }
};
  const getColor = (name) => {
  const colors = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1"];
  const index = name?.charCodeAt(0) % colors.length;
  return colors[index];
};


  return (
    <div className="container-fluid px-4 py-4">

  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 className="fw-bold mb-0">Gestion des utilisateurs</h2>
      <small className="text-muted">Gérez votre équipe et les permissions</small>
    </div>
  </div>

  <div className="card border-0 shadow-sm rounded-4 p-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
  

  <button
    className="btn btn-primary"
    onClick={() => {
      setEditingId(null);
      resetForm();
      setShowModal(true);
    }}
  >
    + Nouvel utilisateur
  </button>
</div>

{showModal && (
  <div className="modal show d-block">
    <div className="modal-dialog modal-xl modal-dialog-centered">
      <div
  className="modal-content border-0 shadow-lg rounded-4"
>

        <div
  className="modal-header border-0"
  style={{ background: "#f8f9ff" }}
>
  <div className="w-100 text-center">
    <h3
      className="fw-bold mb-1"
      style={{ color: "#4f46e5" }}
    >
      {editingId
        ? "Modifier un utilisateur"
        : "Ajouter un utilisateur"}
    </h3>

    <small className="text-muted">
      Les champs marqués * sont obligatoires
    </small>
  </div>


          <button
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        <div className="modal-body">

          <form onSubmit={handleSubmit}>
  <div className="row g-4 mt-2">


    <div className="col-md-6">
      <label className="form-label fw-semibold">
  Prénom <span className="text-danger">*</span>
</label>

      <input
        className="form-control shadow-sm"
        placeholder="Entrez le prénom"
        value={firstName}
        onChange={(e)=>setFirstName(e.target.value)}
        required
      />
    </div>

  
    <div className="col-md-6">
      <label className="form-label fw-semibold">
  Nom <span className="text-danger">*</span>
</label>

      <input
        className="form-control shadow-sm"
        placeholder="Entrez le nom"
        value={lastName}
        onChange={(e)=>setLastName(e.target.value)}
        required
      />
    </div>

   
    <div className="col-md-6">
      <label className="form-label fw-semibold">
  Adresse e-mail <span className="text-danger">*</span>
</label>

      <input
        type="email"
        className="form-control shadow-sm"
        placeholder="exemple@email.com"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
      />
    </div>

   
    <div className="col-md-6">

  <label className="form-label fw-semibold">
    Image de profil
  </label>

  <div className="d-flex align-items-center gap-3">

  
    {image ? (

 
  <img
    src={URL.createObjectURL(image)}
    alt="preview"
    className="rounded-circle border"
    style={{
      width: "70px",
      height: "70px",
      objectFit: "cover"
    }}
  />

) : editingId ? (

  users.find(u => u.id === editingId)?.profile_image ? (

   
    <img
      src={`http://127.0.0.1:8000${
        users.find(u => u.id === editingId)?.profile_image
      }`}
      alt="profile"
      className="rounded-circle border"
      style={{
        width: "70px",
        height: "70px",
        objectFit: "cover"
      }}
    />

  ) : (

    <div
      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
      style={{
        width: "70px",
        height: "70px",
        background: "#0d6efd",
        fontSize: "26px"
      }}
    >
      {firstName?.charAt(0)?.toUpperCase()}
    </div>

  )

) : (

 
  <div
    className="rounded-circle overflow-hidden border"
    style={{
      width: "70px",
      height: "70px",
      backgroundColor: "#e5e5e5",
      border: "2px solid #d6d6d6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="45"
      height="45"
      fill="#8a8a8a"
      viewBox="0 0 16 16"
    >
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z"/>
    </svg>
  </div>

)}

   
    <div className="flex-grow-1">

      <label
        className="btn btn-outline-primary rounded-pill px-4"
      >
        Choisir une image

        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </label>


    </div>

  </div>
</div>

    {!editingId && (
      <div className="col-md-6">
        <label className="form-label fw-semibold">
  Mot de passe <span className="text-danger">*</span>
</label>

        <input
          type="password"
          className="form-control shadow-sm"
          placeholder="Entrez le mot de passe"
          onChange={(e)=>setPassword(e.target.value)}
          required
        />
      </div>
    )}

  
    <div className="col-md-6">
      <label className="form-label fw-semibold">
  Rôle <span className="text-danger">*</span>
</label>

      <select
        className="form-select"
        value={role}
        onChange={(e)=>setRole(e.target.value)}
        required
      >
        <option value="">Sélectionner un rôle</option>
{roles
  .filter((r) => r.name !== "SYSTEM_ADMIN")
  .map((r) => (
    <option key={r.id} value={r.name}>
      {r.name}
    </option>
))}
      </select>
    </div>

    


    {role === "MEMBRE" && (
      <div className="col-md-6">
        <label className="form-label fw-semibold">
  Équipe <span className="text-danger">*</span>
</label>

        <select
  className="form-select"
  value={team}
  onChange={(e)=> {
    setTeam(e.target.value);
    setSubTeam("");
  }}
  required
>
  <option value="">Sélectionner une équipe</option>

  {teams.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name}
    </option>
  ))}

</select>
      </div>
    )}

  
    {team && (
      <div className="col-md-6">
        <label className="form-label fw-semibold">
  Spécialité <span className="text-danger">*</span>
</label>

       <select
  className="form-select"
  value={subTeam}
  onChange={(e)=>setSubTeam(e.target.value)}
  required
>
          <option value="">Sélectionner une spécialité</option>

          {subTeams
  .filter(st => st.team == team)
  .map((st) => (
    <option key={st.id} value={st.id}>
      {st.name}
    </option>
))}
        </select>
      </div>
    )}

    
    {role === "MEMBRE" && (
      <div className="col-md-6">
        <label className="form-label fw-semibold">
  Salaire par heure <span className="text-danger">*</span>
</label>

        <input
  type="number"
  className="form-control shadow-sm"
  placeholder="Entrez le salaire"
  value={salary}
  onChange={(e)=>setSalary(e.target.value)}
  required
/>
      </div>
    )}
    {salary && (
  <small className="text-muted">
    Salaire mensuel ≈ {(salary * 8 * 22).toFixed(2)} DT

  </small>
)}

  
    <div className="col-12 mt-4">
  <div className="d-flex justify-content-end gap-3">

    <button
      type="button"
      className="btn btn-light px-4"
      onClick={() => setShowModal(false)}
    >
      Annuler
    </button>

    <button
      type="submit"
      className="btn px-4"
      style={{
        background: "#6366f1",
        color: "white"
      }}
    >
      {editingId ? "Enregistrer" : "Ajouter"}
    </button>

  </div>
</div>

  </div>
</form>

        </div>

      </div>
    </div>
  </div>
)}

        



<div className="row mt-4">


  <div className="col-md-3">
    <input
      type="text"
      className="form-control shadow-sm"
      placeholder="Search by name..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
    />
  </div>

 
  <div className="col-md-3">
    <select
      className="form-select"
      value={filterRole}
      onChange={(e) => {
        setFilterRole(e.target.value);
        setFilterTeam("");
        setFilterSubTeam("");
        setPage(1);
      }}
    >
      <option value="">Tous les rôles</option>
      {roles
  .filter((r) => r.name !== "SYSTEM_ADMIN")
  .map((r) => (
    <option key={r.id} value={r.name}>
      {r.name}
    </option>
))}
    </select>
  </div>

  
{filterRole === "MEMBRE" && (
  <div className="col-md-3">
    <select
      className="form-select"
      value={filterTeam}
      onChange={(e) => {
        setFilterTeam(e.target.value);
        setFilterSubTeam("")
        setPage(1);
      }}
    >
      <option value="">Toutes les équipes</option>

      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  </div>
)}



{filterTeam && (
  <div className="col-md-3">
    <select
      className="form-select"
      value={filterSubTeam}
      onChange={(e) => {
        setFilterSubTeam(e.target.value);
        setPage(1);
      }}
    >
      <option value="">Toutes les spécialités</option>

      {subTeams
        .filter((st) => st.team == filterTeam)
        .map((st) => (
          <option key={st.id} value={st.id}>
            {st.name}
          </option>
        ))}
    </select>
  </div>
)}

  <div className="col-md-3">
    <button
      className="btn btn-secondary w-100"
      onClick={() => {
        setFilterRole("");
        setFilterTeam("");
        setFilterSubTeam("");
        setSearch("");
        setPage(1);
      }}
    >
      Réinitialiser
    </button>
  </div>

</div>

<div className="saas-card mt-3">

 
  <div className="saas-table-header">
    <h4>utilisateurs</h4>
  </div>


  <div className="saas-table-wrapper">

    <table className="saas-table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          
          <th>Équipe</th>
          <th>spécialité</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>

      <tbody>
  {users.map(user => (
    <tr
      key={user.id}
      style={{
        opacity: user.is_active ? 1 : 0.5,
        backgroundColor: user.is_active ? "white" : "#f1f1f1",
        color: user.is_active ? "inherit" : "#888",
        pointerEvents: user.is_active ? "auto" : "none"
      }}
    >

   
      <td>
        {user.profile_image ? (
          <img
            src={`http://127.0.0.1:8000${user.profile_image}`}
            className="avatar-img"
            style={{
              filter: user.is_active ? "none" : "grayscale(100%)"
            }}
          />
        ) : (
          <div
            className="avatar-circle"
            style={{
              background: getColor(user.first_name),
              filter: user.is_active ? "none" : "grayscale(100%)"
            }}
          >
            {user.first_name?.charAt(0)}
          </div>
        )}
      </td>
      <td className="bold">
        {user.first_name} {user.last_name}
      </td>

      <td>{user.email}</td>

    
      <td>
        <span className="badge role">
          {user.role}
        </span>
      </td>

   
      <td>
        <span className="badge team">
          {user.team_name || "-"}
        </span>
      </td>

   
      <td>
        <span className="badge subteam">
          {user.sub_team_name || "-"}
        </span>
      </td>

      <td className="text-end">

        <div className="d-flex justify-content-end gap-2">
          <button
  className="btn btn-sm btn-info"
  onClick={() => handleResetPassword(user.id)}
>
  <FaKey />
</button>

          <button
            className="btn btn-sm btn-light"
            onClick={() => handleEdit(user)}
            disabled={!user.is_active}
            style={{
              cursor: user.is_active ? "pointer" : "not-allowed"
            }}
          >
            <FaEdit />
          </button>

          {user.is_active ? (
            

            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleDeactivate(user.id)}
            >
              <FaBan />
            </button>

          ) : (

            <button
              className="btn btn-sm btn-success"
              onClick={() => handleActivate(user.id)}
              style={{
                pointerEvents: "auto"
              }}
            >
              <FaCheckCircle />
            </button>

          )
          }

        </div>

      </td>

    </tr>
  ))}
</tbody>

    </table>

  </div>
</div>

     <div className="saas-pagination">

  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
    Précédent
  </button>

  <span>Page {page} / {totalPages}</span>

  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
    Suivant
  </button>
</div>
      </div>
    </div>
    
  ); 
}
export default AdminDashboard;