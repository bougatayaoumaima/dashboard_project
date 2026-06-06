import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function TasksEvolutionChart() {

  const [data, setData] = useState([]);

  useEffect(() => {

    axios.get(
      "http://127.0.0.1:8000/api/dashboard/tasks-evolution/",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      }
    )
    .then(res => {
      setData(res.data);
    })
    .catch(err => {
      console.log(err);
    });

  }, []);

  return (

    <div className="card shadow-sm border-0 p-3 rounded-4">

      <h4 className="mb-4 fw-bold text-primary">
        Évolution des Tâches
      </h4>

      <ResponsiveContainer width="100%" height={400}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="week" />

          <YAxis />

          <Tooltip />

          <Legend />

          
          <Line
            type="monotone"
            dataKey="created"
            stroke="#1976d2"
            strokeWidth={3}
            name="Tâches Créées"
          />

          
          <Line
            type="monotone"
            dataKey="terminee"
            stroke="#2e7d32"
            strokeWidth={3}
            name="Tâches Terminées"
          />

          
          <Line
            type="monotone"
            dataKey="delayed"
            stroke="#d32f2f"
            strokeWidth={3}
            name="Tâches En Retard"
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}