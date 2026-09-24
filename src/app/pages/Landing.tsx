import { Link } from 'react-router';
import { Mountain } from 'lucide-react';
import { outdoorPath } from '../paths';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-200 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight mb-3">
          Alessandro Bettini applications
        </h1>
        <p className="text-stone-600 mb-10 text-sm sm:text-base">
          Accedi all&apos;applicazione.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={outdoorPath('esplora')}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold transition-colors shadow-md"
          >
            <Mountain className="w-5 h-5" />
            Accedi a outdoor-tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
