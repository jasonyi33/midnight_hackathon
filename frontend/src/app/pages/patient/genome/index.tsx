import { Layout } from "../../../layout/Layout";
import "../patient-styles.css";

/**
 * Patient Genome Page
 */
export const PatientGenome = () => {
  return (
    <Layout title="My Genome" role="patient">
      <div className="patient-genome">
        <h2>Manage Your Genomic Data</h2>
        <p>Upload, view, and manage your genomic data files.</p>
        
        <div className="upload-section">
          <h3>Upload Genomic Data</h3>
          <div className="upload-box">
            <p>Drag and drop your genomic data file here, or click to select a file.</p>
            <button className="btn-primary">Select File</button>
          </div>
        </div>
        
        <div className="genome-files">
          <h3>Your Genomic Files</h3>
          <div className="file-list">
            <p>No genomic files uploaded yet.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientGenome;