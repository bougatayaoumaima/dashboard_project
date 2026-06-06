import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineHistory } from "react-icons/ai";
function PmoNotifications() {

  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/notifications/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
  console.log(res.data);
  setNotifications(res.data.data || []);
});
  }, []);

  


  const dangers = Array.isArray(notifications)
  ? notifications.filter(n => n.type === "danger")
  : [];

   const delays = Array.isArray(notifications)
  ? notifications.filter(n => n.type === "delay")
  : [];


  const markAsRead = (id) => {
  axios.post(`http://127.0.0.1:8000/api/notifications/read/${id}/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  });
};

const renderGroupCard = (title, type, list) => {
const markAllAsRead = (type) => {

  axios.post("http://127.0.0.1:8000/api/notifications/mark-all-read/", {
    type: type   
  }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => {

    setNotifications(prev =>
      prev.filter(n => n.type !== type)
    );

  });
};
  const colors = {
    danger: "bg-danger text-white",
    delay: "bg-info text-white"
  };

  return (
    <div className="card mb-4 shadow">


      <div className={`card-header d-flex justify-content-between ${colors[type]}`}>
        <strong>{title}</strong>

        <div>
          <span className="badge bg-dark me-2">{list.length}</span>

          <button
            className="btn btn-sm btn-light"
            onClick={() => markAllAsRead(type)}
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>


      <div className="card-body">

        {list.map(n => (
          <div key={n.id} className="border-bottom mb-2 pb-2">

            <p className="mb-1">{n.message}</p>

            <small className="text-muted">
              {new Date(n.created_at).toLocaleString()}
            </small>

            <br />

            <button
              className="btn btn-sm btn-outline-success mt-1"
              onClick={() => markAsRead(n.id)}
            >
               Marquer comme lu
            </button>

          </div>
        ))}

      </div>
    </div>
  );
};

return (
  <div className="container py-4">
    <button
  className="d-flex align-items-center gap-2 px-3 py-2"
  style={{
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    background: "#fff",
    transition: "0.2s"
  }}
  onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"}
onMouseLeave={e => e.currentTarget.style.background = "#fff"}
  onClick={() => navigate("/pmo/notifications/history")}
>
  <AiOutlineHistory  size={20} />
  <span className="fw-semibold">Historique</span>
</button><br></br>

    

{dangers.length > 0 &&
  renderGroupCard(" Dépassement de budget", "danger", dangers)
}

{delays.length > 0 &&
  renderGroupCard(" Retards", "delay", delays)
}

    

  </div>
);
}

export default PmoNotifications;