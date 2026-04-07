// Loading spinner shown while API data is in-flight
export default function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:18, height:18, border:"2px solid var(--border2)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
    </div>
  );
}
