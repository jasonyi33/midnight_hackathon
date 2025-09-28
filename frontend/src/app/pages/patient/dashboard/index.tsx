import { Layout } from "../../../layout/Layout";
import "../patient-styles.css";

/**
 * Patient Dashboard Page
 */
export const PatientDashboard = () => {
  return (
    <Layout title="Dashboard" role="patient">
      <div className="patient-dashboard">
        <h2>Welcome to your Patient Dashboard</h2>
        <p>Your genomic data overview and recent activities will appear here.</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Genomic Data</h3>
            <p className="stat-value">1 File</p>
          </div>
          
          <div className="stat-card">
            <h3>Pending Requests</h3>
            <p className="stat-value">0</p>
          </div>
          
          <div className="stat-card">
            <h3>Shared Access</h3>
            <p className="stat-value">0 Doctors</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <p>No recent activities to display.</p>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;