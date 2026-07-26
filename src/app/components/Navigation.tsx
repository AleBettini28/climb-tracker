import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Home, LayoutDashboardIcon, Compass, List, ChevronDown, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutDialog(false);
    navigate('/esplora');
  };

  const isActivityActive = location.pathname === '/vie' || location.pathname === '/boulder';

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <Link to="/esplora" className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <span className="text-base sm:text-xl font-bold text-foreground">ClimbTracker</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex gap-1">
                {/* Dashboard */}
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <LayoutDashboardIcon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">Dashboard</span>
                </Link>

                {/* Esplora */}
                <Link
                  to="/esplora"
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/esplora'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">Esplora</span>
                </Link>

                {/* Attività Dropdown (solo per utenti autenticati) */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActivityMenu(!showActivityMenu)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                        isActivityActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden md:inline text-sm font-medium">Attività</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showActivityMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowActivityMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                          <Link
                            to="/vie"
                            onClick={() => setShowActivityMenu(false)}
                            className="block px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border"
                          >
                            Le Mie Vie
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 border-l border-border pl-2 sm:pl-4">
                {user ? (
                  <>
                    <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline truncate max-w-[120px]">
                      {user.name || user.email}
                    </span>
                    <button
                      onClick={() => setShowLogoutDialog(true)}
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Esci"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Esci</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    title="Accedi"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">Accedi</span>
                  </button>
                )}
              </div>
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
