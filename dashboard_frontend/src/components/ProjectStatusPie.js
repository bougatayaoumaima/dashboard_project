import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Sector
} from "recharts";

import axios from "axios";
import { useEffect, useState } from "react";

export default function ProjectStatusPie() {

  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {

    axios.get(
      "http://127.0.0.1:8000/api/project_stats/",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      }
    ).then(res => {

      const d = res.data;

      setData([
        {
          name: "En attente",
          value: d.en_attente_pct
        },
        {
          name: "En cours",
          value: d.en_cours_pct
        },
        {
          name: "Terminés",
          value: d.terminee_pct
        }
      ]);
    });

  }, []);

  const COLORS = [
    "#fbc02d",
    "#29b6f6",
    "#66bb6a"
  ];


  const renderActiveShape = (props) => {

    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill
    } = props;

    return (

      <g>

        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter:
              "drop-shadow(0px 0px 12px rgba(0,0,0,0.4))"
          }}
        />

      </g>
    );
  };

  const activeItem = data[activeIndex] || {};

  return (

    <div
      className="d-flex flex-column align-items-center p-3"
      style={{
        borderRadius: "20px",
        background:
          "linear-gradient(145deg, #f0f0f0, #ffffff)",
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.1)"
      }}
    >


      <h5 className="mb-3 fw-bold text-primary">
        Statut des Projets
      </h5>

      <div style={{ position: "relative" }}>


        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center"
          }}
        >

          <h4 className="fw-bold mb-0">
            {activeItem.value?.toFixed(0)}%
          </h4>

          <small className="text-muted">
            {activeItem.name}
          </small>

        </div>

        <PieChart width={320} height={320}>


          <defs>

            <linearGradient
              id="color1"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#FFD54F"
              />

              <stop
                offset="100%"
                stopColor="#FFB300"
              />
            </linearGradient>

            <linearGradient
              id="color2"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#4FC3F7"
              />

              <stop
                offset="100%"
                stopColor="#0288D1"
              />
            </linearGradient>

            <linearGradient
              id="color3"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#81C784"
              />

              <stop
                offset="100%"
                stopColor="#388E3C"
              />
            </linearGradient>

          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            dataKey="value"
            animationDuration={800}
            onMouseEnter={(_, index) =>
              setActiveIndex(index)
            }
          >

            {data.map((entry, index) => {

              const gradients = [
                "url(#color1)",
                "url(#color2)",
                "url(#color3)"
              ];

              return (
                <Cell
                  key={index}
                  fill={gradients[index]}
                />
              );
            })}

          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              background: "#fff",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.2)"
            }}
          />

          <Legend iconType="circle" />

        </PieChart>

      </div>

    </div>
  );
}