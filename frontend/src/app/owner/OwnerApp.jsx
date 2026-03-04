// src/app/owner/OwnerApp.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import OwnerLayout    from './OwnerLayout';
import OwnerDashboard from './OwnerDashboard';
import OwnerFiles     from './OwnerFiles';
import OwnerRequests  from './OwnerRequests';
import OwnerAudit     from './OwnerAudit';

export default function OwnerApp() {
  return (
    <Routes>
      <Route element={<OwnerLayout />}>
        {/* /owner/ → /owner/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="files"     element={<OwnerFiles />} />
        <Route path="requests"  element={<OwnerRequests />} />
        <Route path="audit"     element={<OwnerAudit />} />
      </Route>
    </Routes>
  );
}