import React,{useEffect,useState} from "react";

import {fetchAlerts} from "../api/api_client";

function AlertsTable(){

const [alerts,setAlerts]=useState([]);

useEffect(()=>{

fetchAlerts().then(res=>{

setAlerts(res.data)

})

},[])

return(

<div>

<h2>Alerts</h2>

<table border="1">

<thead>

<tr>
<th>User</th>
<th>IP</th>
<th>Rule</th>
<th>Severity</th>
</tr>

</thead>

<tbody>

{alerts.map(alert=>(
<tr key={alert.id}>
<td>{alert.user}</td>
<td>{alert.ip_address}</td>
<td>{alert.rule}</td>
<td>{alert.severity}</td>
</tr>
))}

</tbody>

</table>

</div>

)

}

export default AlertsTable