import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ClimbList } from './pages/ClimbList';
import { NewClimb } from './pages/NewClimb';
import { ClimbDetail } from './pages/ClimbDetail';
import { RouteDetail } from './pages/RouteDetail';
import { NewRoute } from './pages/NewRoute';
import { Explore } from './pages/Explore';
import { CragDetail } from './pages/CragDetail';
import { NewCrag } from './pages/NewCrag';
import { BoulderAreaDetail } from './pages/BoulderAreaDetail';
import { NewBoulderArea } from './pages/NewBoulderArea';
import { BoulderDetail } from './pages/BoulderDetail';
import { NewBoulder } from './pages/NewBoulder';
import { BoulderRouteDetail } from './pages/BoulderRouteDetail';
import { NewBoulderRoute } from './pages/NewBoulderRoute';
import { NewBoulderSend } from './pages/NewBoulderSend';
import { BoulderSendList } from './pages/BoulderSendList';
import { BoulderSendDetail } from './pages/BoulderSendDetail';
import { Workouts } from './pages/Workouts';
import { NewWorkout } from './pages/NewWorkout';
import { WorkoutList } from './pages/WorkoutList';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { AIPlan } from './pages/AIPlan';
import Auth from './pages/Auth';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: Auth,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      // Public routes: browsable without an account.
      // The app lands on Explore by default; Auth is only reached explicitly
      // (e.g. via the login button) instead of forcing an auth redirect.
      { index: true, element: <Navigate to="/esplora" replace /> },
      { path: 'esplora', Component: Explore },
      { path: 'dashboard', Component: Dashboard },
      { path: 'falesia/:id', Component: CragDetail },
      { path: 'via/:id', Component: RouteDetail },
      { path: 'area-boulder/:id', Component: BoulderAreaDetail },
      { path: 'masso/:id', Component: BoulderDetail },
      { path: 'blocco/:id', Component: BoulderRouteDetail },

      // Protected routes: require an authenticated user.
      {
        path: 'nuova-falesia',
        element: (
          <ProtectedRoute>
            <NewCrag />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vie',
        element: (
          <ProtectedRoute>
            <ClimbList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vie/:id',
        element: (
          <ProtectedRoute>
            <ClimbDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nuova-salita/:id',
        element: (
          <ProtectedRoute>
            <NewClimb />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nuova-via/:id',
        element: (
          <ProtectedRoute>
            <NewRoute />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nuova-area-boulder',
        element: (
          <ProtectedRoute>
            <NewBoulderArea />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nuovo-masso/:id',
        element: (
          <ProtectedRoute>
            <NewBoulder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nuovo-blocco/:id',
        element: (
          <ProtectedRoute>
            <NewBoulderRoute />
          </ProtectedRoute>
        ),
      },
      {
        path: 'nuovo-invio/:id',
        element: (
          <ProtectedRoute>
            <NewBoulderSend />
          </ProtectedRoute>
        ),
      },
      {
        path: 'boulder',
        element: (
          <ProtectedRoute>
            <BoulderSendList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'boulder/:id',
        element: (
          <ProtectedRoute>
            <BoulderSendDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'allenamenti',
        element: (
          <ProtectedRoute>
            <Workouts />
          </ProtectedRoute>
        ),
      },
      {
        path: 'allenamenti/nuovo',
        element: (
          <ProtectedRoute>
            <NewWorkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'allenamenti/lista',
        element: (
          <ProtectedRoute>
            <WorkoutList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'allenamenti/piano-ai',
        element: (
          <ProtectedRoute>
            <AIPlan />
          </ProtectedRoute>
        ),
      },
      {
        path: 'allenamento/:id',
        element: (
          <ProtectedRoute>
            <WorkoutDetail />
          </ProtectedRoute>
        ),
      },
    ],
  },
], {
  basename: '/',
});
