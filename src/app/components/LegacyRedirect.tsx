import { Navigate, useParams, useLocation } from 'react-router';
import { outdoorPath } from '../paths';

export function OutdoorLegacyRedirect({ suffix }: { suffix: string }) {
  const params = useParams();
  const location = useLocation();

  let resolved = suffix;
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      resolved = resolved.replace(`:${key}`, value);
    }
  }

  const target = outdoorPath(resolved);
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}
