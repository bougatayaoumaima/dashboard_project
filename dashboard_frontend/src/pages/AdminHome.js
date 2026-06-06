import { useEffect, useState } from "react";
import axios from "axios";
import ProjectStatusPie from "../components/ProjectStatusPie";
import { PieChart, Pie, Cell, Tooltip, Legend, Sector } from "recharts";
import AvgStats from "../components/AvgStats";
import UsersDistributionPie from "../components/UsersStats";
import MonthlyProjectsTrend from "../components/TaskEvolutionChart";
import TasksEvolutionChart from "../components/TaskEvolutionChart";

export default function AdminDashboard() {

  const [userStats, setUserStats] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/users-stats/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`
      }
    }).then(res => {
      setUserStats(res.data);
    });
  }, []);

  const userData = userStats ? [
    { name: "PMO", value: userStats.PMO },
    { name: "Chef de projet", value: userStats.CHEF_PROJET },
    { name: "Membre", value: userStats.MEMBRE },
  ] : [];

  return (

    <div className="container mt-4">

      <h1 className="saas-title mb-1">
        Tableau de bord administrateur
      </h1>

      <br></br>

      <div className="row">

        <div className="col-md-6">
          <ProjectStatusPie />
        </div>

        <div className="col-md-6">
          <UsersDistributionPie />
        </div>

      </div>

      <AvgStats></AvgStats>

      <div className="row mt-4">

        <div className="col-md-12">
          <TasksEvolutionChart />
        </div>

      </div>

    </div>
  );
}