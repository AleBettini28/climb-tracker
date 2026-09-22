import { Navigate, useParams, useLocation } from 'react-router';
import { outdoorPath, gymPath } from '../paths';

type Zone = 'outdoor' | 'gym';

function LegacyRedirect({ zone, suffix }: { zone: Zone; suffix: string }) {
  const params = useParams();
  const location = useLocation();

  let resolved = suffix;
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      resolved = resolved.replace(`:${key}`, value);
    }
  }

  const target = zone === 'outdoor' ? outdoorPath(resolved) : gymPath(resolved);
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}

export function OutdoorLegacyRedirect({ suffix }: { suffix: string }) {
  return <LegacyRedirect zone="outdoor" suffix={suffix} />;
}

export function GymLegacyRedirect({ suffix }: { suffix: string }) {
  return <LegacyRedirect zone="gym" suffix={suffix} />;
}
