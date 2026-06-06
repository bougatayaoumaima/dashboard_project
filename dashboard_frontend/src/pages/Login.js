import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username,
          password
        }
      );

      const data = response.data;

      localStorage.setItem("access", data.access);

      localStorage.setItem("role", data.role);

      localStorage.setItem("username", data.username);

      localStorage.setItem(
        "must_change_password",
        data.must_change_password
      );

      toast.success("Bienvenue", {
        theme: "dark",
      });

      if (data.must_change_password) {

        navigate("/change-password");

        return;
      }

      if (data.role === "SYSTEM_ADMIN") {

        navigate("/admin");

      } else if (data.role === "PMO") {

        navigate("/pmo");

      } else if (data.role === "CHEF_PROJET") {

        navigate("/user");

      } else if (data.role === "MEMBRE") {

        navigate("/my-tasks");
      }

    } catch (error) {

      toast.error(
        "Email ou mot de passe invalide",
        {
          theme: "dark",
        }
      );

    }
  };

  return (

    <div>

      <div className="card p-3 shadow border-0 bg-transparent text-white">

     
        <p
          className="text-center mb-4"
          style={{
            color: "rgba(255,255,255,0.75)"
          }}
        >
          Connectez-vous pour accéder à votre tableau de bord
        </p>

      
        <div className="mb-3">

          <label className="form-label text-light">
            Adresse Email
          </label>

          <input
            type="text"
            className="form-control glass-input"
            placeholder="Entrez votre email"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

        </div>

    
        <div className="mb-3">

          <label className="form-label text-light">
            Mot de passe
          </label>

          <input
            type="password"
            className="form-control glass-input"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

        </div>

        
        <button
          className="btn btn-gradient w-100 mt-3"
          onClick={handleLogin}
        >
          Se connecter
        </button>

      </div>

    </div>
  );
}

export default Login;