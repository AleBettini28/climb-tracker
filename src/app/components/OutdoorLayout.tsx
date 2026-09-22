import { Outlet } from 'react-router';
import { OutdoorNavigation } from './OutdoorNavigation';
import { Toaster } from './ui/sonner';

export function OutdoorLayout() {
  return (
    <div className="min-h-screen bg-background">
      <OutdoorNavigation />
      <main>
        <Outlet />
      </main>
      <Toaster position="bottom-center" />
    </div>
  );
}
