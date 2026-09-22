import { createBrowserRouter, Navigate } from 'react-router';
import { OutdoorLayout } from './components/OutdoorLayout';
import { GymLayout } from './components/GymLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
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
import { AIPlan } from './pages/AIPlan';
import { GymList } from './pages/GymList';
import { GymDetail } from './pages/GymDetail';
import { NewGym } from './pages/NewGym';
import { NewGymBoulder } from './pages/NewGymBoulder';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import { OutdoorLegacyRedirect, GymLegacyRedirect } from './components/LegacyRedirect';
import { outdoorPath, gymPath, OUTDOOR_BASE, GYM_BASE } from './paths';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Landing,
    },
    {
      path: '/auth',
      Component: Auth,
    },
    {
      path: OUTDOOR_BASE,
      Component: OutdoorLayout,
      children: [
        { index: true, element: <Navigate to={outdoorPath('esplora')} replace /> },
        { path: 'esplora', Component: Explore },
        { path: 'dashboard', Component: Dashboard },
        { path: 'falesia/:id', Component: CragDetail },
        { path: 'via/:id', Component: RouteDetail },
        { path: 'area-boulder/:id', Component: BoulderAreaDetail },
        { path: 'masso/:id', Component: BoulderDetail },
        { path: 'blocco/:id', Component: BoulderRouteDetail },
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
          path: 'piano-ai',
          element: (
            <ProtectedRoute>
              <AIPlan />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: GYM_BASE,
      Component: GymLayout,
      children: [
        { index: true, element: <Navigate to={gymPath('palestre')} replace /> },
        { path: 'palestre', Component: GymList },
        { path: 'palestra/:id', Component: GymDetail },
        {
          path: 'nuova-palestra',
          element: (
            <AdminRoute>
              <NewGym />
            </AdminRoute>
          ),
        },
        {
          path: 'nuovo-boulder-palestra/:gymId',
          element: (
            <AdminRoute>
              <NewGymBoulder />
            </AdminRoute>
          ),
        },
      ],
    },
    // Legacy redirects from old root paths
    { path: '/esplora', element: <Navigate to={outdoorPath('esplora')} replace /> },
    { path: '/dashboard', element: <Navigate to={outdoorPath('dashboard')} replace /> },
    { path: '/falesia/:id', element: <OutdoorLegacyRedirect suffix="falesia/:id" /> },
    { path: '/via/:id', element: <OutdoorLegacyRedirect suffix="via/:id" /> },
    { path: '/area-boulder/:id', element: <OutdoorLegacyRedirect suffix="area-boulder/:id" /> },
    { path: '/masso/:id', element: <OutdoorLegacyRedirect suffix="masso/:id" /> },
    { path: '/blocco/:id', element: <OutdoorLegacyRedirect suffix="blocco/:id" /> },
    { path: '/vie', element: <Navigate to={outdoorPath('vie')} replace /> },
    { path: '/vie/:id', element: <OutdoorLegacyRedirect suffix="vie/:id" /> },
    { path: '/boulder', element: <Navigate to={outdoorPath('boulder')} replace /> },
    { path: '/boulder/:id', element: <OutdoorLegacyRedirect suffix="boulder/:id" /> },
    { path: '/piano-ai', element: <Navigate to={outdoorPath('piano-ai')} replace /> },
    { path: '/nuova-falesia', element: <Navigate to={outdoorPath('nuova-falesia')} replace /> },
    { path: '/nuova-area-boulder', element: <Navigate to={outdoorPath('nuova-area-boulder')} replace /> },
    { path: '/nuova-salita/:id', element: <OutdoorLegacyRedirect suffix="nuova-salita/:id" /> },
    { path: '/nuova-via/:id', element: <OutdoorLegacyRedirect suffix="nuova-via/:id" /> },
    { path: '/nuovo-masso/:id', element: <OutdoorLegacyRedirect suffix="nuovo-masso/:id" /> },
    { path: '/nuovo-blocco/:id', element: <OutdoorLegacyRedirect suffix="nuovo-blocco/:id" /> },
    { path: '/nuovo-invio/:id', element: <OutdoorLegacyRedirect suffix="nuovo-invio/:id" /> },
    { path: '/palestre', element: <Navigate to={gymPath('palestre')} replace /> },
    { path: '/palestra/:id', element: <GymLegacyRedirect suffix="palestra/:id" /> },
    { path: '/nuova-palestra', element: <Navigate to={gymPath('nuova-palestra')} replace /> },
    {
      path: '/nuovo-boulder-palestra/:gymId',
      element: <GymLegacyRedirect suffix="nuovo-boulder-palestra/:gymId" />,
    },
  ],
  {
    basename: '/',
  },
);
