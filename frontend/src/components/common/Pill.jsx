const SEV_COLOR = { Critical:"var(--red)", High:"var(--orange)", Medium:"var(--yellow)", Low:"var(--blue)", Info:"var(--text3)", auth:"var(--purple)", network:"var(--blue)", endpoint:"var(--orange)", file:"var(--yellow)" };
export default function Pill({ color, text }) {
  const c = color || SEV_COLOR[text] || "var(--text3)";
  return <span style={{ background:c+"22", color:c, border:`1px solid ${c}44`, fontSize:10, padding:"1px 7px", borderRadius:99, fontWeight:500, whiteSpace:"nowrap" }}>{text}</span>;
}
