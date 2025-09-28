import { Layout } from "../../../layout/Layout";
import "../doctor-styles.css";

/**
 * Doctor Patients Page
 */
export const DoctorPatients = () => {
  return (
    <Layout title="My Patients" role="doctor">
      <div className="doctor-patients">
        <h2>Patient Management</h2>
        <p>View and manage your patients' information.</p>
        
        <div className="patients-list">
          <div className="patient-card">
            <div className="patient-info">
              <p className="patient-name">John Doe</p>
              <p className="patient-id">ID: PAT123456</p>
            </div>
            <div className="patient-actions">
              <button className="btn-outline">View Profile</button>
              <button className="btn-primary">Request Verification</button>
            </div>
          </div>
          
          <div className="patient-card">
            <div className="patient-info">
              <p className="patient-name">Jane Smith</p>
              <p className="patient-id">ID: PAT789012</p>
            </div>
            <div className="patient-actions">
              <button className="btn-outline">View Profile</button>
              <button className="btn-primary">Request Verification</button>
            </div>
          </div>
          
          <div className="patient-card">
            <div className="patient-info">
              <p className="patient-name">Robert Johnson</p>
              <p className="patient-id">ID: PAT345678</p>
            </div>
            <div className="patient-actions">
              <button className="btn-outline">View Profile</button>
              <button className="btn-primary">Request Verification</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorPatients;