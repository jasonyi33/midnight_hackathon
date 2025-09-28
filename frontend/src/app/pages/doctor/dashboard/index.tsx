import { Layout } from "../../../layout/Layout";
import "../doctor-styles.css";

/**
 * Doctor Dashboard Page
 */
export const DoctorDashboard = () => {
  return (
    <Layout title="Dashboard" role="doctor">
      <div className="doctor-dashboard">
        <h2>Welcome, Doctor</h2>
        <p>View your patient information and verification requests.</p>
        
        <div className="patient-stats">
          <div className="stat-card">
            <h3>Total Patients</h3>
            <p className="stat-value">5</p>
          </div>
          
          <div className="stat-card">
            <h3>Pending Verifications</h3>
            <p className="stat-value">2</p>
          </div>
          
          <div className="stat-card">
            <h3>Completed Verifications</h3>
            <p className="stat-value">12</p>
          </div>
        </div>
        
        <div className="verification-stats">
          <h3>Recent Activity</h3>
          <p>No recent verification activities.</p>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;