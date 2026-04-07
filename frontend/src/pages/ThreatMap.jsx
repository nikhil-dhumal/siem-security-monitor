import WorldThreatMap from '../components/WorldThreatMap.jsx';

export default function ThreatMap({ hours }) {
  // The onIPClick prop is optional in WorldThreatMap, so we can omit it here
  // if this page is just for displaying the map without drill-down.
  return <WorldThreatMap hours={hours} />;
}
