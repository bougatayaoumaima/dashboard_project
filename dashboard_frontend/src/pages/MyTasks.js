import { useEffect, useState } from "react";
import axios from "axios";

function MyTasks() {

const [tasks, setTasks] = useState([]);

const token = localStorage.getItem("access");

const fetchTasks = () => {

axios.get(
"http://127.0.0.1:8000/api/my-tasks/",
{
headers:{
Authorization:`Bearer ${token}`
}
}
)
.then(res => setTasks(res.data))
.catch(err => console.log(err));

};

useEffect(() => {
fetchTasks();
}, []);

const updateStatus = async(id, status) => {

await axios.put(
`http://127.0.0.1:8000/api/tasks/${id}/status/`,
{ status },
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

fetchTasks();

};

return(

<div className="container mt-5">

<h2>Mes tâches</h2>

<table className="table">

<thead>
<tr>
<th>Titre</th>
<th>Description</th>
<th>Statut</th>
<th>Mise à jour</th>
</tr>
</thead>

<tbody>

{tasks.map(t => (

<tr key={t.id}>

<td>{t.title}</td>

<td>{t.description}</td>

<td>
{
t.status === "en_attente"
? "En attente"
: t.status === "en_cours"
? "En cours"
: "Terminée"
}
</td>

<td>

<select
className="form-select"
value={t.status}
onChange={(e) => updateStatus(t.id, e.target.value)}
>

{t.status === "en_attente" && (
<>
<option value="en_attente">En attente</option>
<option value="en_cours">En cours</option>
</>
)}

{t.status === "en_cours" && (
<>
<option value="en_cours">En cours</option>
<option value="terminee">Terminée</option>
</>
)}

{t.status === "terminee" && (
<option value="terminee">Terminée</option>
)}

</select>

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}

export default MyTasks;