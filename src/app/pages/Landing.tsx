import { Link } from 'react-router';
import { Mountain, Building2 } from 'lucide-react';
import { outdoorPath, gymPath } from '../paths';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-200 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight mb-3">
          Alessandro Bettini applications
        </h1>
        <p className="text-stone-600 mb-10 text-sm sm:text-base">
          Scegli l&apos;applicazione a cui accedere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={outdoorPath('esplora')}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold transition-colors shadow-md"
          >
            <Mountain className="w-5 h-5" />
            Accedi a outdoor-tracker
          </Link>
          <Link
            to={gymPath('palestre')}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold transition-colors shadow-md"
          >
            <Building2 className="w-5 h-5" />
            Accedi a gym-tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
