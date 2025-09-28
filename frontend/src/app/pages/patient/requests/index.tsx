import { Layout } from "../../../layout/Layout";
import "../patient-styles.css";

/**
 * Patient Requests Page
 */
export const PatientRequests = () => {
  return (
    <Layout title="Requests" role="patient">
      <div className="patient-requests">
        <h2>Access Requests</h2>
        <p>Manage requests from doctors and researchers to access your genomic data.</p>
        
        <div className="requests-tabs">
          <button className="tab active">Pending (0)</button>
          <button className="tab">Approved (0)</button>
          <button className="tab">Rejected (0)</button>
        </div>
        
        <div className="requests-list">
          <p className="empty-state">You have no pending access requests.</p>
        </div>
      </div>
    </Layout>
  );
};

export default PatientRequests;