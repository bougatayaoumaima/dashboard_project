import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Profile() {

const [errors,setErrors] = useState({});
const [loadingProfile, setLoadingProfile] = useState(false);
const [loadingPassword, setLoadingPassword] = useState(false);

const [firstName,setFirstName] = useState("");
const [lastName,setLastName] = useState("");
const [email,setEmail] = useState("");

const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");

const token = localStorage.getItem("access");

const [image, setImage] = useState(null);
const [preview, setPreview] = useState(null);

const [showMenu, setShowMenu] = useState(false);
const [showViewer, setShowViewer] = useState(false);

useEffect(()=>{

axios.get("http://127.0.0.1:8000/api/profile/", {
  headers:{
    Authorization:`Bearer ${token}`
  }
})
.then(res=>{

  setFirstName(res.data.first_name);
  setLastName(res.data.last_name);
  setEmail(res.data.email);

  if (res.data.profile_image) {
    setPreview(
      `http://127.0.0.1:8000${res.data.profile_image}?t=${new Date().getTime()}`
    );
  }

})
.catch(()=>{
  toast.error("Échec du chargement du profil ");
});

},[]);

useEffect(() => {

  const handleClick = () => setShowMenu(false);

  if (showMenu) {
    window.addEventListener("click", handleClick);
  }

  return () => window.removeEventListener("click", handleClick);

}, [showMenu]);

const updateProfile = async () => {

  if(!validate()){
    return;
  }

  setLoadingProfile(true);

  try {

    const formData = new FormData();

    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);

    if (image) {
      formData.append("profile_image", image);
    }

    const res = await axios.put(
      "http://127.0.0.1:8000/api/profile/",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    if (res.data.profile_image) {
      setPreview(
        `http://127.0.0.1:8000${res.data.profile_image}?t=${Date.now()}`
      );
    }

    toast.success("Profil mis à jour avec succès ");

  } catch(err){

    toast.error("Échec de la mise à jour ");

  } finally {

    setLoadingProfile(false);

  }
};

const changePassword = async () => {

if(!validate()){
  return;
}

if(password !== confirmPassword){

  toast.error("Les mots de passe ne correspondent pas ");
  return;

}

setLoadingPassword(true);

try{

await axios.put(
  "http://127.0.0.1:8000/api/change-password/",
  {password},
  {
    headers:{
      Authorization:`Bearer ${token}`
    }
  }
);

toast.success("Mot de passe mis à jour ");

setTimeout(()=>{

  localStorage.clear();
  window.location.href="/";

},1500);

}catch(err){

  toast.error("Erreur lors de la mise à jour du mot de passe ");

} finally {

  setLoadingPassword(false);

}

};

const validate = () => {

  let errs = {};

  if(!firstName)
    errs.firstName = "Le prénom est obligatoire";

  if(!lastName)
    errs.lastName = "Le nom est obligatoire";

  if(!email.includes("@"))
    errs.email = "Adresse e-mail invalide";

  if (password) {

    if (password.length < 6) {

      errs.password =
        "Le mot de passe doit contenir au moins 6 caractères";

    }

    else if (!/[A-Z]/.test(password)) {

      errs.password =
        "Le mot de passe doit contenir au moins une majuscule";

    }

    else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {

      errs.password =
        "Le mot de passe doit contenir au moins un caractère spécial";

    }
  }

  if(password !== confirmPassword){

    errs.confirmPassword =
      "Les mots de passe ne correspondent pas";

  }

  setErrors(errs);

  return Object.keys(errs).length === 0;
};

const getColor = (name) => {

  const colors = [
    "#0d6efd",
    "#20c997",
    "#ffc107",
    "#dc3545",
    "#6f42c1"
  ];

  const index = name?.charCodeAt(0) % colors.length;

  return colors[index];
};

return(

<div className="container py-5">

  <div className="row justify-content-center">

    <div className="col-lg-8">

      <div className="card shadow-lg border-0 rounded-4">

        <div className="card-body p-4">

          <h3 className="text-center mb-4 fw-bold">
             Mon Profil
          </h3>

          <div className="text-center mb-4 position-relative">

{preview ? (

  <img
    src={preview}
    alt="profil"
    className="rounded-circle mb-2"
    width="120"
    height="120"
    style={{
      objectFit: "cover",
      cursor: "pointer"
    }}
    onClick={() => setShowViewer(true)}
  />

) : (

  <div
    className="rounded-circle mb-2 d-flex align-items-center justify-content-center text-white"
    style={{
      width: "120px",
      height: "120px",
      margin: "auto",
      fontSize: "40px",
      fontWeight: "bold",
      backgroundColor: getColor(firstName),
      cursor: "pointer"
    }}
    onClick={() => setShowViewer(true)}
  >
    {firstName?.charAt(0) || "A"}
  </div>

)}


{showViewer && (

  <div
    onClick={() => setShowViewer(false)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 3000
    }}
  >

    <img
      src={preview}
      alt="photo"
      style={{
        maxWidth: "90%",
        maxHeight: "90%",
        borderRadius: "12px",
        boxShadow: "0 0 30px rgba(0,0,0,0.5)"
      }}
      onClick={(e) => e.stopPropagation()}
    />

  </div>

)}

</div>

<div className="mb-4">

  <h5 className="mb-3">
    Informations du profil
  </h5>

  <div className="row">

    <div className="col-md-6 mb-2">

      <label className="form-label">
        Prénom
      </label>

      <input
        className="form-control"
        value={firstName}
        onChange={(e)=>setFirstName(e.target.value)}
      />

    </div>

    <div className="col-md-6 mb-2">

      <label className="form-label">
        Nom
      </label>

      <input
        className="form-control"
        value={lastName}
        onChange={(e)=>setLastName(e.target.value)}
      />

    </div>

  </div>

  <div className="mb-3">

    <label className="form-label">
      Adresse e-mail
    </label>

    <input
      type="email"
      className="form-control"
      value={email}
      disabled
      style={{
        backgroundColor: "#e9ecef",
        cursor: "not-allowed"
      }}
    />

  </div>

  <button
    className="btn btn-success w-100"
    onClick={updateProfile}
    disabled={loadingProfile}
  >

    {loadingProfile ? (
      <>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Mise à jour...
      </>
    ) : " Mettre à jour les informations"}

  </button>

</div>

<hr/>

<div>

  <h5 className="mb-3">
    Changer le mot de passe
  </h5>

  <div className="mb-2">

    <label className="form-label">
      Nouveau mot de passe
    </label>

    <input
      type="password"
      className="form-control"
      onChange={(e)=>setPassword(e.target.value)}
    />

    {errors.password && (
      <small className="text-danger">
        {errors.password}
      </small>
    )}

  </div>

  <div className="mb-3">

    <label className="form-label">
      Confirmer le mot de passe
    </label>

    <input
      type="password"
      className="form-control"
      onChange={(e)=>setConfirmPassword(e.target.value)}
    />

    {errors.confirmPassword && (
      <small className="text-danger">
        {errors.confirmPassword}
      </small>
    )}

  </div>

  <button
    className="btn btn-primary w-100"
    onClick={changePassword}
    disabled={loadingPassword}
  >

    {loadingPassword ? (
      <>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Mise à jour...
      </>
    ) : " Mettre à jour le mot de passe"}

  </button>

</div>

        </div>
      </div>
    </div>
  </div>
</div>

)

}

export default Profile;