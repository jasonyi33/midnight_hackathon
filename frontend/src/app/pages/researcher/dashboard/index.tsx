import { Layout } from "../../../layout/Layout";
import "../researcher-styles.css";

/**
 * Researcher Dashboard Page
 */
export const ResearcherDashboard = () => {
  return (
    <Layout title="Dashboard" role="researcher">
      <div className="researcher-dashboard">
        <h2>Welcome, Researcher</h2>
        <p>Access anonymized genomic data for your research.</p>
        
        <div className="data-stats">
          <div className="stat-card">
            <h3>Available Datasets</h3>
            <p className="stat-value">8</p>
          </div>
          
          <div className="stat-card">
            <h3>Analyzed Samples</h3>
            <p className="stat-value">25</p>
          </div>
          
          <div className="stat-card">
            <h3>Research Projects</h3>
            <p className="stat-value">3</p>
          </div>
        </div>
        
        <div className="recent-data">
          <h3>Recent Activity</h3>
          <p>No recent research activities.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ResearcherDashboard;