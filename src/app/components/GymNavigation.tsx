import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Building2, LogOut, LogIn, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';
import { gymPath, authPath, zoneHomeFromPath } from '../paths';

export function GymNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutDialog(false);
    navigate(zoneHomeFromPath(location.pathname));
  };

  const palestrePath = gymPath('palestre');
  const isPalestreActive =
    location.pathname === palestrePath || location.pathname.startsWith(gymPath('palestra'));

  return (
    <>
      <nav className="gym-nav sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-5">
          <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
            <Link to={palestrePath} className="min-w-0">
              <p className="gym-eyebrow">Gym Tracker</p>
              <span className="gym-title text-2xl sm:text-3xl block truncate">Palestre</span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to={palestrePath}
                className={`gym-nav-link flex items-center gap-1.5 px-3 py-2 ${
                  isPalestreActive ? 'is-active' : ''
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden md:inline">Palestre</span>
              </Link>

              <Link
                to="/"
                className="gym-nav-link flex items-center gap-1.5 px-3 py-2"
                title="Applicazioni"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Apps</span>
              </Link>

              {user ? (
                <>
                  <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[100px]">
                    {user.name || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLogoutDialog(true)}
                    className="gym-nav-link flex items-center gap-1.5 px-3 py-2"
                    title="Esci"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Esci</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(authPath(location.pathname))}
                  className="gym-send-btn !py-2 !px-3 !text-xs !shadow-none"
                  title="Accedi"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <LogIn className="w-4 h-4" />
                    Accedi
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <ConfirmDialog
        open={showLogoutDialog}
        title="Conferma uscita"
        message="Sei sicuro di voler uscire?"
        confirmLabel="Esci"
        icon={LogOut}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutDialog(false)}
      />
    </>
  );
}
