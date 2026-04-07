export function Card({ children, style={} }) {
  return (
    <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--rl)", padding:"12px 14px", animation:"fadeUp .3s ease", ...style }}>
      {children}
    </div>
  );
}
export function CardTitle({ children, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <span style={{ fontSize:10, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".08em" }}>{children}</span>
      {right && <span style={{ fontSize:10, color:"var(--text3)" }}>{right}</span>}
    </div>
  );
}
export default Card;
