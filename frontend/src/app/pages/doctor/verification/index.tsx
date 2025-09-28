import { Layout } from "../../../layout/Layout";
import "../doctor-styles.css";
import { useState } from 'react';

/**
 * Doctor Verification Page
 */
export const DoctorVerification = () => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const handleTraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const trait = e.target.value;
    if (e.target.checked) {
      setSelectedTraits([...selectedTraits, trait]);
    } else {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would handle form submission in a real implementation
    console.log('Request submitted:', { selectedPatient, selectedTraits, message });
    alert('Verification request sent successfully!');
  };
  
  return (
    <Layout role="doctor">
      <div className="doctor-verification">
        <div className="gradient-orb top-left"></div>
        <div className="gradient-orb bottom-right"></div>
        
        <h2>Genomic Verification</h2>
        <p>Request and verify genomic traits from your patients using zero-knowledge proofs, protecting patient privacy.</p>
        
        <div className="doctor-sections">
          <div className="verification-request-form">
            <h3>New Verification Request</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="patient">Select Patient</label>
                <select 
                  id="patient" 
                  className="select-styled"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  <option value="">-- Select a patient --</option>
                  <option value="pat1">John Doe</option>
                  <option value="pat2">Jane Smith</option>
                  <option value="pat3">Robert Johnson</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Traits to Verify</label>
                <div className="trait-checkboxes">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="BRCA1" 
                      name="traits" 
                      value="BRCA1" 
                      onChange={handleTraitChange}
                      checked={selectedTraits.includes('BRCA1')}
                    />
                    <label htmlFor="BRCA1">BRCA1 (Breast Cancer Susceptibility)</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="BRCA2" 
                      name="traits" 
                      value="BRCA2" 
                      onChange={handleTraitChange}
                      checked={selectedTraits.includes('BRCA2')}
                    />
                    <label htmlFor="BRCA2">BRCA2 (Breast Cancer Susceptibility)</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="CYP2D6" 
                      name="traits" 
                      value="CYP2D6" 
                      onChange={handleTraitChange}
                      checked={selectedTraits.includes('CYP2D6')}
                    />
                    <label htmlFor="CYP2D6">CYP2D6 (Drug Metabolism Status)</label>
                  </div>
                </div>
                {selectedTraits.length === 0 && (
                  <p className="error-text">Please select at least one trait</p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message to Patient</label>
                <textarea 
                  id="message" 
                  rows={3} 
                  className="textarea-styled" 
                  placeholder="Explain why you need to verify these genetic traits..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              
              <div className="privacy-note">
                <div className="privacy-icon"></div>
                <p>Zero-knowledge proofs allow verification of specific genetic traits without revealing the patient's complete genomic data.</p>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={selectedPatient === '' || selectedTraits.length === 0}
              >
                Send Verification Request
              </button>
            </form>
          </div>
          
          <div className="verification-history">
            <h3>Verification History</h3>
            
            <div className="history-tabs">
              <button 
                className={`history-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={`history-tab ${activeTab === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                Approved
              </button>
              <button 
                className={`history-tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button 
                className={`history-tab ${activeTab === 'denied' ? 'active' : ''}`}
                onClick={() => setActiveTab('denied')}
              >
                Denied
              </button>
            </div>
            
            <div className="history-entry">
              <div className="history-header">
                <span className="history-patient">John Doe</span>
                <span className="history-status status-approved">Approved</span>
              </div>
              <div className="history-traits">
                <span className="trait-result positive">BRCA1: Negative</span>
                <span className="trait-result positive">BRCA2: Negative</span>
              </div>
              <div className="history-meta">
                <span className="history-date">Verified: May 15, 2023</span>
                <span className="wallet-address">0x74e3...8f9c</span>
              </div>
            </div>
            
            <div className="history-entry">
              <div className="history-header">
                <span className="history-patient">Jane Smith</span>
                <span className="history-status status-pending">Pending</span>
              </div>
              <div className="history-traits">
                <span className="trait-result">CYP2D6: Awaiting verification</span>
              </div>
              <div className="history-meta">
                <span className="history-date">Requested: May 18, 2023</span>
                <span className="wallet-address">0x83c6...4e2a</span>
              </div>
            </div>
            
            <div className="history-entry">
              <div className="history-header">
                <span className="history-patient">Robert Johnson</span>
                <span className="history-status status-denied">Denied</span>
              </div>
              <div className="history-traits">
                <span className="trait-result denied">BRCA1: Access denied</span>
              </div>
              <div className="history-meta">
                <span className="history-date">Requested: May 10, 2023</span>
                <span className="wallet-address">0x91a5...7e3b</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorVerification;