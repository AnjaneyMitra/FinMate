import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaxFilingDashboard from './components/TaxFilingDashboard';
import TaxDashboardContent from './components/TaxDashboardContent';
// Placeholders for components that will be created or refactored
const TaxFormDiscovery = () => <div>Tax Form Discovery</div>;
const TaxDocumentManager = () => <div>Tax Document Manager</div>;
const TaxGlossaryHelp = () => <div>Tax Glossary & Help</div>;
const EnhancedTaxReturnCompletion = () => <div>Enhanced Tax Return Completion</div>;

const TaxFilingRouter = ({ user }) => {
  return (
    <Routes>
      <Route path="/" element={<TaxFilingDashboard user={user} />}>
        {/* The dashboard will now act as a layout, rendering child routes */}
        {/* The default view will be handled by the dashboard component itself or an index route */}
        <Route index element={<TaxDashboardContent />} />
        <Route path="discovery" element={<TaxFormDiscovery />} />
        <Route path="documents" element={<TaxDocumentManager />} />
        <Route path="glossary" element={<TaxGlossaryHelp />} />
        <Route path="filing" element={<EnhancedTaxReturnCompletion />} />
      </Route>
    </Routes>
  );
};

export default TaxFilingRouter;
