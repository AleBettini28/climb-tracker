import { createBrowserRouter, Navigate } from 'react-router';
import { OutdoorLayout } from './components/OutdoorLayout';
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
import { AIPlan } from './pages/AIPlan';
import Auth from './pages/Auth';
import { OutdoorTrackerLegacyRedirect } from './components/LegacyRedirect';
import { outdoorPath } from './paths';
import { NewExtraActivity } from './pages/NewExtraActivity';
import { ExtraActivityList } from './pages/ExtraActivityList';
import { ExtraActivityDetail } from './pages/ExtraActivityDetail';

export const router = createBrowserRouter(
  [
    {
      path: '/',
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
        {
          path: 'nuova-attivita',
          element: (
            <ProtectedRoute>
              <NewExtraActivity />
            </ProtectedRoute>
          ),
        },
        {
          path: 'attivita-extra',
          element: (
            <ProtectedRoute>
              <ExtraActivityList />
            </ProtectedRoute>
          ),
        },
        {
          path: 'attivita-extra/:id',
          element: (
            <ProtectedRoute>
              <ExtraActivityDetail />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: '/auth',
      Component: Auth,
    },
    // Legacy redirects from /outdoor-tracker prefix
    { path: '/outdoor-tracker', element: <OutdoorTrackerLegacyRedirect /> },
    { path: '/outdoor-tracker/*', element: <OutdoorTrackerLegacyRedirect /> },
  ],
  {
    basename: '/',
  },
);
