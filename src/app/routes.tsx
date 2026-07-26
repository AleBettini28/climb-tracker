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
    ],
  },
], {
  basename: '/',
});
