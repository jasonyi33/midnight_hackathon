import { Layout } from "../../../layout/Layout";
import "../doctor-styles.css";

/**
 * Doctor Dashboard Page
 */
export const DoctorDashboard = () => {
  return (
    <Layout role="doctor">
      <div className="doctor-dashboard">
        <div className="gradient-orb top-left"></div>
        <div className="gradient-orb bottom-right"></div>
        
        <h2>Welcome, Doctor</h2>
        <p>Access patient genetic information through privacy-preserving verification requests. Verify specific traits without accessing full genomic data.</p>
        
        <div className="patient-stats">
          <div className="stat-card">
            <div className="stat-icon patients-icon"></div>
            <h3>Total Patients</h3>
            <p className="stat-value">5</p>
            <p className="stat-description">Patients under your care</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending-icon"></div>
            <h3>Pending Verifications</h3>
            <p className="stat-value">2</p>
            <p className="stat-description">Awaiting patient approval</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon completed-icon"></div>
            <h3>Completed Verifications</h3>
            <p className="stat-value">12</p>
            <p className="stat-description">Successfully verified traits</p>
          </div>
        </div>
        
        <div className="verification-stats">
          <h3>Recent Verification Requests</h3>
          {/* Uncomment for empty state
          <div className="activity-empty">
            <div className="empty-icon"></div>
            <p>No recent verification activities.</p>
            <p className="subtext">Your verification requests will appear here</p>
          </div>
          */}
          
          <ul className="verification-list">
            <li className="verification-item">
              <div className="verification-header">
                <span className="verification-title">Diabetes Risk Factor Verification</span>
                <span className="verification-time">1 day ago</span>
              </div>
              <p className="verification-description">
                Request sent to John Smith for zero-knowledge verification of diabetes risk markers.
              </p>
              <div className="verification-meta">
                <span className="verification-status status-pending">Awaiting Patient Approval</span>
                <span>Request ID: VRQ-20231015-002</span>
              </div>
            </li>
            
            <li className="verification-item">
              <div className="verification-header">
                <span className="verification-title">Medication Response Profile</span>
                <span className="verification-time">2 days ago</span>
              </div>
              <p className="verification-description">
                Request sent to Emily Johnson for verification of response to cholesterol medication.
              </p>
              <div className="verification-meta">
                <span className="verification-status status-approved">Approved</span>
                <span>Patient: Emily Johnson</span>
              </div>
              <div className="verification-actions">
                <button className="verification-button approve-button">View Results</button>
              </div>
            </li>
            
            <li className="verification-item">
              <div className="verification-header">
                <span className="verification-title">Genetic Heart Condition Risk</span>
                <span className="verification-time">5 days ago</span>
              </div>
              <p className="verification-description">
                Request sent to Maria Garcia for verification of genetic markers related to heart conditions.
              </p>
              <div className="verification-meta">
                <span className="verification-status status-approved">Completed</span>
                <span>ZKP ID: ZKP-20231011-005</span>
              </div>
              <div className="verification-actions">
                <button className="verification-button approve-button">View Results</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;