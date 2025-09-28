import { Layout } from "../../../layout/Layout";
import "../patient-styles.css";

/**
 * Patient Requests Page
 */
export const PatientRequests = () => {
  return (
    <Layout role="patient">
      <div className="patient-requests">
        
        <h2>Access Requests</h2>
        <p>Manage requests from doctors and researchers to access your genomic data using zero-knowledge proofs.</p>
        
        <div className="requests-tabs">
          <button className="tab active">Pending (1)</button>
          <button className="tab">Approved (1)</button>
          <button className="tab">Rejected (0)</button>
        </div>
        
        <div className="requests-list">
          <div className="request-item">
            <div className="request-header">
              <div className="request-info">
                <span className="request-from">From: Dr. Sarah Johnson</span>
                <span className="request-time">Requested 1 day ago</span>
              </div>
              <span className="request-status status-pending">Pending</span>
            </div>
            <div className="request-content">
              <p>Requesting access to verify the following traits:</p>
              <div className="trait-chips">
                <span className="trait-chip">BRCA1</span>
                <span className="trait-chip">BRCA2</span>
              </div>
              <p className="request-message">
                "I'd like to verify these markers for your diabetes risk assessment. This will help determine the most effective treatment plan for your condition."
              </p>
            </div>
            <div className="request-footer">
              <div className="request-actions">
                <button className="btn-primary">Approve</button>
                <button className="btn-danger">Deny</button>
              </div>
              <div className="request-detail">
                <span className="request-id">Request ID: REQ-20231016-001</span>
                <span className="request-expires">Expires in 6 days</span>
              </div>
            </div>
          </div>
          
          <div className="privacy-note">
            <div className="privacy-icon"></div>
            <div className="privacy-text">
              <h4>Privacy Protection</h4>
              <p>When you approve a request, a zero-knowledge proof will be generated that only reveals whether you have a specific trait, without sharing your complete genomic data.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientRequests;