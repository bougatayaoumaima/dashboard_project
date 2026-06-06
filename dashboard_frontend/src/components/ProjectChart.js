import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ProjectChart({ projectId, projectName }) {

  const [data, setData] = useState([]);
  const [prediction, setPrediction] = useState({});
  const [alerts, setAlerts] = useState([]);

  const recentTasks = data
    .slice(-3)
    .reduce((sum, d) => sum + (d.tasks_added || 0), 0);

  useEffect(() => {

    const fetchData = () => {

      axios.get(
        `http://127.0.0.1:8000/api/project-analytics/${projectId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
          }
        }
      ).then(res => {

        const history = res.data.history;
        const future = res.data.future;

        const historyFormatted = history.map(d => ({
  date: d.date,

  progressReal: Number(d.execution_progress.toFixed(1)),
  progressPredicted: null,

  total_cost: Number(d.total_cost.toFixed(2)),
  predictedCost: null
}));

        const futureFormatted = future.map(d => ({
  date: d.date,

  progressReal: null,
  progressPredicted: Number(d.execution_progress.toFixed(1)),

  total_cost: null,
  predictedCost: Number(d.total_cost.toFixed(2))
}));

        if (history.length > 0 && future.length > 0) {

          const last = history[history.length - 1];

          futureFormatted.unshift({
  date: last.date,

  progressReal: last.execution_progress,
  progressPredicted: last.execution_progress,

  total_cost: last.total_cost,
  predictedCost: last.total_cost
});
        }

        setPrediction({
          progress: res.data.prediction_progress,
          cost: res.data.prediction_cost
        });

        setData([
          ...historyFormatted,
          ...futureFormatted
        ]);
      });

      axios.get(
        `http://127.0.0.1:8000/api/alerts/${projectId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`
          }
        }
      )
      .then(res =>
        setAlerts(
          Array.isArray(res.data) ? res.data : []
        )
      )
      .catch(() => setAlerts([]));
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);

  }, [projectId]);

  return (

    <div
      style={{
        borderRadius: "20px",
        padding: "20px",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}
    >

   

      <div className="mb-4">

        <h4 className="fw-bold">
           {projectName}
        </h4>

        <center>
          <h5 className="mb-3 fw-bold text-primary">
            Analyses en Temps Réel & Prévisions
          </h5>
        </center>

      </div>

  

      <div className="row g-3 mb-4">

        <KPI
          title="Progression"
          value={`${prediction.progress?.toFixed(1)}%`}
          color="#4CAF50"
        />

        <KPI
          title="Coût"
          value={`${prediction.cost || 0} DT`}
          color="#FF5722"
        />

      </div>


      {alerts.map((a, i) => (

        <div
          key={i}
          style={{
            padding: "10px 15px",
            borderLeft: "4px solid #F44336",
            background: "#fff",
            borderRadius: "10px",
            marginBottom: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
          }}
        >
           {a.message}
        </div>

      ))}


      {recentTasks > 0 && (

        <div
          style={{
            padding: "10px 15px",
            borderLeft: "4px solid #FFC107",
            background: "#fff8e1",
            borderRadius: "10px",
            marginBottom: "15px"
          }}
        >
           +{recentTasks} tâches ajoutées
          (changement de périmètre)
        </div>

      )}


      <center>
        <h5 className="mb-3 fw-bold text-primary">
          Avancement du projet
        </h5>
      </center>

      <ResponsiveContainer width="100%" height={280}>
  <LineChart data={data}>

    <CartesianGrid
      strokeDasharray="3 3"
      opacity={0.1}
    />

    <XAxis dataKey="date" />

    <YAxis domain={[0, 100]} />

    <Tooltip />

    <Legend />

    <Line
  type="monotone"
  dataKey="progressReal"
  stroke="#4CAF50"
  strokeWidth={3}
  dot={false}
  connectNulls={true}
  name="Progression Réelle"
/>

<Line
  type="monotone"
  dataKey="progressPredicted"
  stroke="#2196F3"
  strokeWidth={3}
  strokeDasharray="6 6"
  dot={false}
  connectNulls={true}
  name="Progression Prévue"
/>

  </LineChart>
</ResponsiveContainer>


      <center>
        <h5 className="mb-3 fw-bold text-primary">
          Évolution des Coûts
        </h5>
      </center>

      <ResponsiveContainer width="100%" height={280}>
  <LineChart data={data}>

    <CartesianGrid
      strokeDasharray="3 3"
      opacity={0.1}
    />

    <XAxis dataKey="date" />

    <YAxis />

    <Tooltip />

    <Legend />
<Line
  type="monotone"
  dataKey="total_cost"
  stroke="#FF9800"
  strokeWidth={3}
  dot={false}
  connectNulls={true}
  name="Coût Réel"
/>

<Line
  type="monotone"
  dataKey="predictedCost"
  stroke="#F44336"
  strokeWidth={3}
  strokeDasharray="6 6"
  dot={false}
  connectNulls={true}
  name="Coût Prévu"
/>

  </LineChart>
</ResponsiveContainer>

    </div>
  );
}


function KPI({ title, value, color }) {

  return (

    <div className="col-md-6">

      <div
        style={{
          padding: "15px",
          borderRadius: "15px",
          background: "#fff",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
        }}
      >

        <h6 className="text-muted">
          {title}
        </h6>

        <h3 style={{ color }}>
          {value || 0}
        </h3>

      </div>

    </div>
  );
}