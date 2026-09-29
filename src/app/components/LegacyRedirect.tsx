import { Navigate, useLocation } from 'react-router';

const OUTDOOR_TRACKER_PREFIX = '/outdoor-tracker';

export function OutdoorTrackerLegacyRedirect() {
  const location = useLocation();
  const rest = location.pathname.slice(OUTDOOR_TRACKER_PREFIX.length).replace(/^\//, '');
  const target = rest ? `/${rest}` : '/esplora';
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}
