import React,{useEffect,useState} from "react";

import {fetchAnalytics} from "../api/api_client";

function AnalyticsCharts(){

const [data,setData]=useState(null);

useEffect(()=>{

fetchAnalytics().then(res=>{

setData(res.data)

})

},[])

if(!data) return <p>Loading analytics...</p>

return(

<div className="analytics-section">

<h2>Security Analytics</h2>
<div style={{padding: '24px', textAlign: 'center', color: '#888'}}>
No analytics data available.
</div>
</div>

)

}

export default AnalyticsCharts