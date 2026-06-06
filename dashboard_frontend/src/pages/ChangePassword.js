import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function ChangePassword() {

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const validate = () => {

    let errs = {};

    if (!password) {

      errs.password = "Le mot de passe est obligatoire";

    } else {

      if (password.length < 6) {
        errs.password =
          "Le mot de passe doit contenir au moins 6 caractères";
      }

      else if (!/[A-Z]/.test(password)) {
        errs.password =
          "Le mot de passe doit contenir au moins une majuscule";
      }

      else if (!/[0-9]/.test(password)) {
        errs.password =
          "Le mot de passe doit contenir au moins un chiffre";
      }

      else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
        errs.password =
          "Le mot de passe doit contenir au moins un caractère spécial";
      }
    }

    if (password !== confirm) {
      errs.confirm =
        "Les mots de passe ne correspondent pas";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {

    if (!validate()) {
      return;
    }

    try {

      setLoading(true);

      await axios.put(
        "http://127.0.0.1:8000/api/change-password/",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "must_change_password",
        "false"
      );

      toast.success(
        "Mot de passe mis à jour avec succès 🔐",
        {
          theme: "dark",
        }
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {

      toast.error(
        "Erreur lors de la mise à jour du mot de passe",
        {
          theme: "dark",
        }
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        <h2 style={styles.title}>
          Changer le mot de passe
        </h2>

        <p style={styles.subtitle}>
          Sécurisez votre compte avec un nouveau mot de passe
        </p>

       
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errors.password && (
          <small style={styles.error}>
            {errors.password}
          </small>
        )}

       
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          style={styles.input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {errors.confirm && (
          <small style={styles.error}>
            {errors.confirm}
          </small>
        )}

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Enregistrement..."
            : "Mettre à jour le mot de passe"}
        </button>

      </div>

    </div>
  );
}

const styles = {

  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },

  card: {
    backdropFilter: "blur(15px)",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "40px",
    width: "350px",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "14px",
    opacity: 0.8,
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "8px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
  },

  error: {
    display: "block",
    color: "#ffb3b3",
    textAlign: "left",
    marginBottom: "12px",
    fontSize: "13px",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    marginTop: "10px",
  },

};

export default ChangePassword;