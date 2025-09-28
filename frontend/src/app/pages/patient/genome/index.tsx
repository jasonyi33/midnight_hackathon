import { Layout } from "../../../layout/Layout";
import "../patient-styles.css";

/**
 * Patient Genome Page
 */
export const PatientGenome = () => {
  return (
    <Layout role="patient">
      <div className="patient-genome">
        
        <h2>Manage Your Genomic Data</h2>
        <p>Upload, view, and manage your genomic data files securely on the Midnight blockchain.</p>
        
        <div className="upload-section">
          <h3>Upload Genomic Data</h3>
          <div className="upload-box">
            <div className="upload-icon"></div>
            <p>Drag and drop your genomic data file here, or click to select a file.</p>
            <p className="upload-note">Your data will be encrypted before being stored on the blockchain.</p>
            <button className="btn-primary">Select File</button>
          </div>
        </div>
        
        <div className="genome-files">
          <h3>Your Genomic Files</h3>
          <div className="file-item">
            <div className="file-info">
              <span className="file-name">genome_sequence_20231015.dat</span>
              <span className="file-meta">Uploaded 2 days ago • 1.2 MB • Encrypted</span>
            </div>
            <div className="file-actions">
              <button className="btn-outline btn-small">View Details</button>
              <button className="btn-danger btn-small">Delete</button>
            </div>
          </div>
          <div className="trait-summary">
            <h4>Available Traits for Zero-Knowledge Proofs</h4>
            <div className="trait-grid">
              <div className="trait-card available">
                <h5>BRCA1</h5>
                <p>Breast Cancer Susceptibility</p>
              </div>
              <div className="trait-card available">
                <h5>BRCA2</h5>
                <p>Breast Cancer Susceptibility</p>
              </div>
              <div className="trait-card available">
                <h5>CYP2D6</h5>
                <p>Drug Metabolism Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientGenome;