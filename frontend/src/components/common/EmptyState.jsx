export default function EmptyState({ message }) {
  return <div style={{padding:24,color:'var(--text3)',textAlign:'center'}}>{message || 'No data available.'}</div>;
}
