import { Layout } from "../../../layout/Layout";
import "../doctor-styles.css";

/**
 * Doctor Verification Page
 */
export const DoctorVerification = () => {
  return (
    <Layout title="Verification" role="doctor">
      <div className="doctor-verification">
        <h2>Genomic Verification</h2>
        <p>Request and verify genomic traits from your patients.</p>
        
        <div className="verification-request-form">
          <h3>New Verification Request</h3>
          
          <form>
            <div className="form-group">
              <label htmlFor="patient">Select Patient</label>
              <select id="patient">
                <option value="">-- Select a patient --</option>
                <option value="pat1">John Doe</option>
                <option value="pat2">Jane Smith</option>
                <option value="pat3">Robert Johnson</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="traits">Traits to Verify</label>
              <select id="traits" multiple>
                <option value="BRCA1">BRCA1</option>
                <option value="BRCA2">BRCA2</option>
                <option value="CYP2D6">CYP2D6</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message (Optional)</label>
              <textarea id="message" rows={3} placeholder="Enter a message for the patient"></textarea>
            </div>
            
            <button type="submit" className="btn-primary">Send Request</button>
          </form>
        </div>
        
        <div className="verification-history">
          <h3>Verification History</h3>
          
          <div className="history-entry">
            <div className="history-header">
              <span className="history-patient">John Doe</span>
              <span className="history-status status-approved">Approved</span>
            </div>
            <div className="history-traits">Traits: BRCA1, BRCA2</div>
            <div className="history-date">Verified on: May 15, 2023</div>
          </div>
          
          <div className="history-entry">
            <div className="history-header">
              <span className="history-patient">Jane Smith</span>
              <span className="history-status status-pending">Pending</span>
            </div>
            <div className="history-traits">Traits: CYP2D6</div>
            <div className="history-date">Requested on: May 18, 2023</div>
          </div>
          
          <div className="history-entry">
            <div className="history-header">
              <span className="history-patient">Robert Johnson</span>
              <span className="history-status status-denied">Denied</span>
            </div>
            <div className="history-traits">Traits: BRCA1</div>
            <div className="history-date">Requested on: May 10, 2023</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorVerification;