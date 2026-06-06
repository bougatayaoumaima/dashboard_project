import { useEffect, useState } from "react";
import axios from "axios";

function AdminProjects() {

  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("access");
  const [pmos, setPmos] = useState([]);
  const [selectedPmo, setSelectedPmo] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState("");

  const fetchPmos = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/users-pmo/",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPmos(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProjects = async (customUrl = null) => {
    try {

      let url = customUrl || "http://127.0.0.1:8000/api/projects/";

      if (selectedPmo && !customUrl) {
        url += `?pmo_id=${selectedPmo}`;
      }

      if (selectedChef && !customUrl) {
        url += `${selectedPmo ? "&" : "?"}chef_projet=${selectedChef}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjects(res.data.results);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);

    } catch (err) {
      console.log(err);
    }
  };

  const fetchChefs = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/users-chef/",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setChefs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPmos();
    fetchChefs();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedPmo, selectedChef]);

  return (

    <div className="container-fluid px-4 py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
             Gestion des projets
          </h2>

          <small className="text-muted">
            &nbsp;&nbsp;Suivez tous les projets
          </small>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">

        <div className="row g-3">

          <div className="col-md-6">

            <label className="form-label fw-semibold mb-2">
              Filtrer par PMO
            </label>

            <select
              className="form-select modern-input"
              value={selectedPmo}
              onChange={(e) => setSelectedPmo(e.target.value)}
            >
              <option value="">Tous les PMO</option>

              {pmos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.username}
                </option>
              ))}

            </select>

          </div>

          <div className="col-md-6">

            <label className="form-label fw-semibold mb-2">
              Filtrer par Chef de projet
            </label>

            <select
              className="form-select modern-input"
              value={selectedChef}
              onChange={(e) => setSelectedChef(e.target.value)}
            >
              <option value="">
                Tous les chefs de projet
              </option>

              {chefs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.username}
                </option>
              ))}
            </select>

          </div>

          <div className="col-md-3">

            <button
              className="btn btn-gradient w-100"
              onClick={() => {
                setSelectedPmo("");
                setSelectedChef("");
              }}
            >
              Réinitialiser
            </button>

          </div>

        </div>

      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3">

        <div className="table-responsive">

          <table className="table align-middle modern-table">

            <thead>
              <tr>
                <th>Projet</th>
                <th>Description</th>
                <th>Chef de projet</th>
                <th>Statut</th>
              </tr>
            </thead>

            <tbody>

              {projects.map(p => (

                <tr key={p.id}>

                  <td className="fw-semibold">
                    {p.name}
                  </td>

                  <td className="text-muted">
                    {p.description || "-"}
                  </td>

                  <td>
                    <span className="text-primary">
                      {p.chef_projet_username}
                    </span>
                  </td>

                  <td>
                    <span className={`badge bg-warning ${p.status}`}>
                      {p.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          <div className="d-flex justify-content-between mt-3">

            <button
              className="btn btn-outline-primary"
              disabled={!prevPage}
              onClick={() => fetchProjects(prevPage)}
            >
              Précédent
            </button>

            <button
              className="btn btn-outline-primary"
              disabled={!nextPage}
              onClick={() => fetchProjects(nextPage)}
            >
              Suivant
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default AdminProjects;