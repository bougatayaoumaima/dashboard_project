import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function AddMembers() {

  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("access");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedSubTeam, setSelectedSubTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [subTeams, setSubTeams] = useState([]);
  const { id } = useParams();

  const fetchProjects = () => {
    fetch("http://127.0.0.1:8000/api/projects/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProjects(data.results || data))
      .catch(err => console.log(err));
  };

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/api/users-membres/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();

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

  }, []);

  useEffect(() => {
    const savedProject = localStorage.getItem("activeProject");
    if (savedProject) {
      setProjectId(savedProject);
    }
  }, []);

  useEffect(() => {

    if (id) {

      fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {

          setProjectId(data.id);

          const existingMembers = data.members.map(m => m.id);

          setSelectedMembers(existingMembers);

        })
        .catch(err => console.log(err));

    }

  }, [id]);

  const filteredUsers = users.filter((u) => {
    if (selectedTeam && u.team_name !== selectedTeam) return false;

    if (selectedSubTeam && u.sub_team_name !== selectedSubTeam) return false;
    return true;
  });

  const groupedUsers = teams.reduce((acc, team) => {

    acc[team.name] = filteredUsers.filter(
      u => u.team_name === team.name
    );

    return acc;

  }, {});

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const saveTeam = async () => {

  const confirmSave = window.confirm(
    "Êtes-vous sûr de vouloir mettre à jour l’équipe ?"
  );

  if (!confirmSave) return;

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/api/projects/add-members/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          members: selectedMembers,
          project_id: id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      alert(data.error || "Erreur");

      return;
    }

    alert("Équipe mise à jour avec succès");

  } catch (err) {

    console.log(err);

    alert("Erreur du serveur");
  }
};
  const renderUserCard = (u) => (
    <div
      key={u.id}
      onClick={() => toggleMember(u.id)}
      className={`p-3 mb-3 rounded-4 shadow-sm d-flex align-items-center justify-content-between ${
        selectedMembers.includes(u.id)
          ? "border border-primary bg-light"
          : "bg-white"
      }`}
      style={{ cursor: "pointer", transition: "0.2s" }}
    >

      <div className="d-flex align-items-center gap-3">

        <div
          className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
        >
          {u.first_name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <div className="fw-semibold">{u.first_name}</div>

          <small className="text-muted">{u.sub_team_name}</small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">

        <span className="badge bg-light text-dark">
          {u.team_name}
        </span>

        <input
          type="checkbox"
          checked={selectedMembers.includes(u.id)}
          onChange={() => toggleMember(u.id)}
        />

      </div>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">

      <div className="mb-4">
        <h3 className="fw-bold"> Ajouter des membres au projet</h3>
        <p className="text-muted">
           Assignez des membres de l’équipe
        </p>
      </div>

      <div className="card p-3 mb-4">
        <div className="d-flex gap-2 mb-4">

          {["TOUS", ...teams.map(t => t.name)].map((team) => (
            <button
              key={team}
              className={`btn rounded-pill px-4 ${
                selectedTeam === team ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => {
                setSelectedTeam(team === "TOUS" ? "" : team);
                setSelectedSubTeam("");
              }}
            >
              {team}
            </button>
          ))}

        </div>

        {selectedTeam && (
          <div className="d-flex gap-2 flex-wrap mb-4">

            {subTeams
              .filter(st => st.team_name === selectedTeam)
              .map((sub) => (
                <button
                  key={sub.id}
                  className={`btn btn-sm rounded-pill ${
                    selectedSubTeam === sub.name
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedSubTeam(sub.name)}
                >
                  {sub.name}
                </button>
              ))}

          </div>
        )}

      </div>

      <div className="row g-4">

        {teams.map((team) => (

          <div className="col-md-4" key={team.id}>

            <div className="card border-0 shadow-sm rounded-4 p-3">

              <h5 className="mb-3">
                {team.name}
              </h5>

              {groupedUsers[team.name]?.map(renderUserCard)}

            </div>

          </div>

        ))}

      </div>

      <div className="mt-4 text-end">
        <button
          className="btn btn-success rounded-pill px-4"
          onClick={saveTeam}
        >
          Enregistrer l’équipe
        </button>
      </div>

    </div>
  );
}

export default AddMembers;