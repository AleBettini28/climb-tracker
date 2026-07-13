import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ClimbList } from './pages/ClimbList';
import { NewClimb } from './pages/NewClimb';
import { ClimbDetail } from './pages/ClimbDetail';
import { AllRoutesList } from './pages/AllRoutesList';
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
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'esplora', Component: Explore },
      { path: 'falesia/:id', Component: CragDetail },
      { path: 'nuova-falesia', Component: NewCrag },
      { path: 'vie', Component: ClimbList },
      { path: 'vie/:id', Component: ClimbDetail },
      { path: 'nuova-salita/:id', Component: NewClimb },
      { path: 'tutte-le-vie', Component: AllRoutesList },
      { path: 'via/:id', Component: RouteDetail },
      { path: 'nuova-via/:id', Component: NewRoute },
    ],
  },
], {
  basename: '/',
});
