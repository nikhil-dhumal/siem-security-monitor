// Shown when an API call fails
export default function ErrorMsg({ msg }) {
  return <div style={{ padding:16, fontSize:11, color:"var(--red)", opacity:.7 }}>Error: {msg}</div>;
}
