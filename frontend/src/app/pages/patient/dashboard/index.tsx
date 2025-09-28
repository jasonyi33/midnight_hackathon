import { Layout } from "../../../layout/Layout";
import "../patient-styles.css";

/**
 * Patient Dashboard Page
 */
export const PatientDashboard = () => {
  return (
    <Layout role="patient">
      <div className="patient-dashboard">
        
        <h2>Welcome to your Patient Dashboard</h2>
        <p>Your genomic data overview and recent activities will appear here. Control access to your genomic information with zero-knowledge proofs.</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon genomic-icon"></div>
            <h3>Genomic Data</h3>
            <p className="stat-value">1 File</p>
            <p className="stat-description">Securely stored and encrypted</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon requests-icon"></div>
            <h3>Pending Requests</h3>
            <p className="stat-value">0</p>
            <p className="stat-description">No pending verification requests</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon access-icon"></div>
            <h3>Shared Access</h3>
            <p className="stat-value">0 Doctors</p>
            <p className="stat-description">No active data sharing</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {/* Uncomment for empty state
          <div className="activity-empty">
            <div className="empty-icon"></div>
            <p>No recent activities to display.</p>
            <p className="subtext">Your genomic data activity log will appear here</p>
          </div>
          */}
          
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-header">
                <span className="activity-title">Genomic Data Uploaded</span>
                <span className="activity-time">2 days ago</span>
              </div>
              <p className="activity-description">
                Your genomic data file was successfully uploaded and encrypted on the Midnight blockchain.
              </p>
              <div className="activity-meta">
                <span className="activity-status status-approved">Completed</span>
                <span>File: genome_sequence_20231015.dat</span>
              </div>
            </li>
            
            <li className="activity-item">
              <div className="activity-header">
                <span className="activity-title">Access Request Received</span>
                <span className="activity-time">1 day ago</span>
              </div>
              <p className="activity-description">
                Dr. Sarah Johnson has requested access to specific markers in your genomic data for diabetes risk assessment.
              </p>
              <div className="activity-meta">
                <span className="activity-status status-pending">Awaiting Approval</span>
                <span>Request ID: REQ-20231016-001</span>
              </div>
            </li>
            
            <li className="activity-item">
              <div className="activity-header">
                <span className="activity-title">Zero-Knowledge Proof Generated</span>
                <span className="activity-time">12 hours ago</span>
              </div>
              <p className="activity-description">
                A zero-knowledge proof was generated for Dr. Johnson's diabetes risk assessment without revealing your full genomic data.
              </p>
              <div className="activity-meta">
                <span className="activity-status status-approved">Completed</span>
                <span>ZKP ID: ZKP-20231016-001</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;