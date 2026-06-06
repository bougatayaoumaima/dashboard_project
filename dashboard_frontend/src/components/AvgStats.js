import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

function AvgStats() {

  const [stats, setStats] = useState(null);

  useEffect(() => {

    axios
      .get("http://127.0.0.1:8000/api/projects_avg_stats/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      })
      .then(res => setStats(res.data));

  }, []);

  if (!stats) {
    return (
      <p className="text-center mt-4">
        Chargement...
      </p>
    );
  }

  const data = [
    {
      name: "Projets",
      progress: stats.avg_progress,
      cost: stats.avg_cost
    }
  ];

  return (

    <div className="row mt-4">


      <div className="col-md-4">

        <div className="card p-3 shadow-sm text-center rounded-4 border-0">

          <h6 className="text-muted">
            Progression Moyenne
          </h6>

          <h2 style={{ color: "#00C853" }}>
            {stats.avg_progress}%
          </h2>

        </div>

      </div>

      <div className="col-md-4">

        <div className="card p-3 shadow-sm text-center rounded-4 border-0">

          <h6 className="text-muted">
            Budget Moyen
          </h6>

          <h2 style={{ color: "#FF3D00" }}>
            {stats.avg_cost} DT
          </h2>

        </div>

      </div>

      <div className="col-md-4">

        <div className="card p-3 shadow-sm text-center rounded-4 border-0">

          <h6 className="text-muted">
            Nombre Total des Projets
          </h6>

          <h2>
            {stats.total_projects}
          </h2>

        </div>

      </div>



    </div>
  );
}

export default AvgStats;