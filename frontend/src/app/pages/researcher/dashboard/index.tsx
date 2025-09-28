import { Layout } from "../../../layout/Layout";
import "../researcher-styles.css";

/**
 * Researcher Dashboard Page
 */
export const ResearcherDashboard = () => {
  return (
    <Layout role="researcher">
      <div className="researcher-dashboard">
        <div className="gradient-orb top-left"></div>
        <div className="gradient-orb bottom-right"></div>
        
        <h2>Welcome, Researcher</h2>
        <p>Access anonymized genomic data for your research while preserving patient privacy. Analyze aggregated data without accessing individual genomic profiles.</p>
        
        <div className="data-stats">
          <div className="stat-card">
            <div className="stat-icon datasets-icon"></div>
            <h3>Available Datasets</h3>
            <p className="stat-value">8</p>
            <p className="stat-description">Anonymized genomic datasets</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon studies-icon"></div>
            <h3>Analyzed Samples</h3>
            <p className="stat-value">25</p>
            <p className="stat-description">With verified genetic markers</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon insights-icon"></div>
            <h3>Research Projects</h3>
            <p className="stat-value">3</p>
            <p className="stat-description">Active research initiatives</p>
          </div>
        </div>
        
        <div className="recent-data">
          <h3>Available Research Datasets</h3>
          {/* Uncomment for empty state
          <div className="activity-empty">
            <div className="empty-icon"></div>
            <p>No recent research activities.</p>
            <p className="subtext">Your data analysis activities will appear here</p>
          </div>
          */}
          
          <ul className="data-list">
            <li className="data-item">
              <div className="data-header">
                <span className="data-title">Type 2 Diabetes Cohort Study</span>
                <span className="data-time">Updated 3 days ago</span>
              </div>
              <p className="data-description">
                Anonymous genetic markers from 125 individuals with type 2 diabetes and 125 control subjects.
              </p>
              <div className="data-meta">
                <span className="data-tag">Diabetes</span>
                <span className="data-tag">Metabolic</span>
                <span>250 samples</span>
              </div>
              <div className="data-actions">
                <button className="data-button view-button">View Details</button>
                <button className="data-button access-button">Request Access</button>
              </div>
            </li>
            
            <li className="data-item">
              <div className="data-header">
                <span className="data-title">Cardiovascular Disease Risk Factors</span>
                <span className="data-time">Updated 1 week ago</span>
              </div>
              <p className="data-description">
                Genetic markers related to cardiovascular disease risk factors from 180 anonymized patient samples.
              </p>
              <div className="data-meta">
                <span className="data-tag">Cardiovascular</span>
                <span className="data-tag">Risk Factors</span>
                <span>180 samples</span>
              </div>
              <div className="data-actions">
                <button className="data-button view-button">View Details</button>
                <button className="data-button access-button">Request Access</button>
              </div>
            </li>
            
            <li className="data-item">
              <div className="data-header">
                <span className="data-title">Pharmacogenomic Response Dataset</span>
                <span className="data-time">Updated 2 weeks ago</span>
              </div>
              <p className="data-description">
                Zero-knowledge verified data on patient responses to common medications based on genetic markers.
              </p>
              <div className="data-meta">
                <span className="data-tag">Pharmacogenomics</span>
                <span className="data-tag">Drug Response</span>
                <span>95 samples</span>
              </div>
              <div className="data-actions">
                <button className="data-button view-button">View Details</button>
                <button className="data-button access-button">Request Access</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ResearcherDashboard;