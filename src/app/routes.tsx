import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { ClimbList } from './pages/ClimbList';
import { NewClimb } from './pages/NewClimb';
import { ClimbDetail } from './pages/ClimbDetail';
import { BoulderList } from './pages/BoulderList';
import { NewBoulder } from './pages/NewBoulder';
import { BoulderDetail } from './pages/BoulderDetail';
import { AllRoutesList } from './pages/AllRoutesList';
import { RouteDetail } from './pages/RouteDetail';
import { NewRoute } from './pages/NewRoute';
import { AllBouldersList } from './pages/AllBouldersList';
import { BoulderArchiveDetail } from './pages/BoulderArchiveDetail';
import { NewBoulderArchive } from './pages/NewBoulderArchive';
import { Explore } from './pages/Explore';
import { CragDetail } from './pages/CragDetail';
import { ZoneDetail } from './pages/ZoneDetail';
import { NewCrag } from './pages/NewCrag';
import { NewZone } from './pages/NewZone';
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
      { path: 'falesia/:name', Component: CragDetail },
      { path: 'zona/:name', Component: ZoneDetail },
      { path: 'nuova-falesia', Component: NewCrag },
      { path: 'nuova-zona', Component: NewZone },
      { path: 'vie', Component: ClimbList },
      { path: 'vie/:id', Component: ClimbDetail },
      { path: 'nuova-salita', Component: NewClimb },
      { path: 'boulder', Component: BoulderList },
      { path: 'boulder/:id', Component: BoulderDetail },
      { path: 'nuovo-boulder', Component: NewBoulder },
      { path: 'tutte-le-vie', Component: AllRoutesList },
      { path: 'via/:id', Component: RouteDetail },
      { path: 'nuova-via', Component: NewRoute },
      { path: 'tutti-i-boulder', Component: AllBouldersList },
      { path: 'boulder-archivio/:id', Component: BoulderArchiveDetail },
      { path: 'nuovo-boulder-archivio', Component: NewBoulderArchive },
    ],
  },
], {
  basename: '/climb-tracker',
});
