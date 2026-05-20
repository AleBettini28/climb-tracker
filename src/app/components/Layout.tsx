import { Outlet } from 'react-router';
import { Navigation } from './Navigation';
import { Toaster } from './ui/sonner';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Toaster position="bottom-center" />
    </div>
  );
}
