// src/app/vendor/VendorApp.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import VendorLayout   from './VendorLayout';
import VendorBrowse   from './VendorBrowse';
import VendorRequests from './VendorRequests';
import VendorAudit    from './VendorAudit';

export default function VendorApp() {
  return (
    <Routes>
      <Route element={<VendorLayout />}>
        <Route index element={<Navigate to="browse" replace />} />
        <Route path="browse"   element={<VendorBrowse />} />
        <Route path="requests" element={<VendorRequests />} />
        <Route path="audit"    element={<VendorAudit />} />
      </Route>
    </Routes>
  );
}