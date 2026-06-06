import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Login from "./Login";

function Acceuil() {
  const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef();
  const buttonRef = useRef();

  const handleToggle = () => {
    if (!showLogin) {
    }

    setShowLogin(!showLogin);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowLogin(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="main-container min-vh-100 d-flex flex-column">

      <nav className="navbar glass-nav fixed-top">
        <div className="container d-flex justify-content-between align-items-center">

          <div className="d-flex align-items-center">
            <img
              src="/mae.png"
              alt="logo"
              style={{ height: "36px", marginRight: "10px" }}
            />
            <span className="fw-bold">
              <span style={{ color: "white" }}>MA</span>
              <span style={{ color: "#22c55e" }}>E</span>
            </span>
          </div>

          <div className="position-relative">
            <button
              ref={buttonRef}
              className="btn btn-glass text-white"
              onClick={handleToggle}
            >
              Se connecter
            </button>

            {showLogin && (
              <div className="login-dropdown" ref={loginRef}>
                <Login />
              </div>
            )}
          </div>

        </div>
      </nav>

      <div className="container flex-grow-1 d-flex align-items-center">
        <div className="row align-items-center w-100">

          <div className="col-md-6 text-white">
            <h1 className="display-3 fw-bold mb-3">
              Gestion intelligente <br />
              <span className="gradient-text">des projets</span>
            </h1>

            <p className="lead mb-4 opacity-75">
              Une expérience moderne inspirée des meilleures plateformes pour analyser, suivre et optimiser vos projets en temps réel.
            </p>

          </div>

          <div className="col-md-6 text-center">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
              alt="gestion de projet"
              className="img-fluid dashboard-img"
            />
          </div>

        </div>
      </div>

      <div className="container my-5">
        <div className="row g-4">

          <div className="col-md-4">
            <div className="glass-card p-4 h-100 text-white">
              <h5> Analyses</h5>
              <p className="opacity-75">
                Visualisez vos données avec des tableaux de bord interactifs.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card p-4 h-100 text-white">
              <h5> Performance</h5>
              <p className="opacity-75">
                Suivi en temps réel et optimisation intelligente.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card p-4 h-100 text-white">
              <h5> Sécurité</h5>
              <p className="opacity-75">
                Protection avancée et accès sécurisé.
              </p>
            </div>
          </div>

        </div>
      </div>

      <footer className="text-center text-white py-3 opacity-75">
        © 2026 — réalisé par Oumaima & Ferdaous
      </footer>

    </div>
  );
}

export default Acceuil;