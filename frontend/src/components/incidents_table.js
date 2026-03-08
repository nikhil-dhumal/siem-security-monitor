import React,{useEffect,useState} from "react";

import {fetchIncidents} from "../api/api_client";

function IncidentsTable(){

const [incidents,setIncidents]=useState([]);

useEffect(()=>{

fetchIncidents().then(res=>{

setIncidents(res.data)

})

},[])

return(

<div className="incidents-section">

<h2>Active Incidents</h2>

<table className="incidents-table">

<thead>

<tr>

<th>ID</th>

<th>Description</th>

<th>Alerts</th>

<th>Severity</th>

<th>Status</th>

</tr>

</thead>

<tbody>

{incidents.map(incident => (

<tr key={incident.id}>

<td>{incident.id}</td>

<td>{incident.title}</td>

<td><span className="badge badge-info">{incident.alerts}</span></td>

<td>

<span className={`badge badge-${incident.severity.toLowerCase()}`}>

{incident.severity}

</span>

</td>

<td>

<span className={`status-badge status-${incident.status.toLowerCase().replace(' ', '-')}`}>

{incident.status}

</span>

</td>

</tr>

))}

</tbody>

</table>

<div className="pagination">

<span>Page 1 of 1</span>

<div className="pagination-buttons">

<button>&lsaquo;</button>

<button>1</button>

<button className="active">1</button>

<button>2</button>

<button>&rsaquo;</button>

</div>

</div>

</div>

)

}

export default IncidentsTable