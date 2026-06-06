import { useEffect, useState } from "react";
import axios from "axios";

function NotificationHistory() {

  const [data, setData] = useState([]);
  const token = localStorage.getItem("access");

  useEffect(() => {

  axios.get(
    "http://127.0.0.1:8000/api/notifications/history/",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(res => {

    console.log(res.data);

    setData(res.data.data || []);

    

  })
  .catch(err => console.error(err));

}, []);

  return (

    <div className="container py-4">

      <h3 className="mb-4"> Historique des notifications</h3>

      {data.length === 0 ? (

        <p className="text-muted">
          Aucune notification lue pour le moment...
        </p>

      ) : (

        data.map(n => (

          <div
            key={n.id}
            className="card p-3 mb-3 shadow-sm border-0 rounded-4"
          >

            <p className="mb-1 fw-semibold">
              {n.message}
            </p>

            <small className="text-muted">
              {
                n.created_at
                  ? new Date(n.created_at).toLocaleString()
                  : ""
              }
            </small>

          </div>

        ))

      )}

    </div>

  );

}

export default NotificationHistory;