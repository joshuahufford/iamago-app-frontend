import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute, PublicOnlyRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { PublicLayout } from '@/components/PublicLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RecommendationsPage } from '@/pages/RecommendationsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PortalEnquiries } from '@/portal/PortalEnquiries';
import { PortalGuard } from '@/portal/PortalGuard';
import { PortalLayout } from '@/portal/PortalLayout';
import { PortalListing } from '@/portal/PortalListing';
import { PortalOverview } from '@/portal/PortalOverview';

export function App() {
  return (
    <Routes>
      {/* Public: the discovery flow must work with no account at all. */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/recommendations/:id" element={<RecommendationsPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Practitioner portal: signed in *and* linked to a listing. */}
      <Route element={<PortalGuard />}>
        <Route element={<PortalLayout />}>
          <Route path="/portal" element={<PortalOverview />} />
          <Route path="/portal/enquiries" element={<PortalEnquiries />} />
          <Route path="/portal/listing" element={<PortalListing />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
