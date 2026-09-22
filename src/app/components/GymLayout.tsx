import { Outlet } from 'react-router';
import { GymNavigation } from './GymNavigation';
import { Toaster } from './ui/sonner';

export function GymLayout() {
  return (
    <div className="gym-zone">
      <GymNavigation />
      <main>
        <Outlet />
      </main>
      <Toaster position="bottom-center" theme="dark" />
    </div>
  );
}
