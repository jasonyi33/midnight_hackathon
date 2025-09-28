import { Layout } from "../../../layout/Layout";
import "../researcher-styles.css";

/**
 * Researcher Data Page
 */
export const ResearcherData = () => {
  return (
    <Layout role="researcher">
      <div className="researcher-data">
        <h2>Anonymized Genomic Data</h2>
        <p>Access and analyze privacy-preserving genomic data shared through zero-knowledge proofs.</p>
        
        <div className="data-stats-summary">
          <div className="data-stat">
            <div className="stat-number">128</div>
            <div className="stat-label">Total Samples</div>
          </div>
          <div className="data-stat">
            <div className="stat-number">37</div>
            <div className="stat-label">BRCA1 Variants</div>
          </div>
          <div className="data-stat">
            <div className="stat-number">42</div>
            <div className="stat-label">BRCA2 Variants</div>
          </div>
          <div className="data-stat">
            <div className="stat-number">49</div>
            <div className="stat-label">CYP2D6 Variants</div>
          </div>
        </div>
        
        <div className="data-filter">
          <h3>Filter Data</h3>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="trait">Genetic Trait</label>
              <select id="trait" className="select-styled">
                <option value="">All Traits</option>
                <option value="BRCA1">BRCA1</option>
                <option value="BRCA2">BRCA2</option>
                <option value="CYP2D6">CYP2D6</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="variant">Variant Type</label>
              <select id="variant" className="select-styled">
                <option value="">All Variants</option>
                <option value="pathogenic">Pathogenic</option>
                <option value="benign">Benign</option>
                <option value="vus">VUS</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="date-range">Date Range</label>
              <select id="date-range" className="select-styled">
                <option value="all">All Time</option>
                <option value="month">Past Month</option>
                <option value="quarter">Past Quarter</option>
                <option value="year">Past Year</option>
              </select>
            </div>
            
            <button className="btn-primary">Apply Filter</button>
          </div>
        </div>
        
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Sample ID</th>
                <th>Trait</th>
                <th>Variant</th>
                <th>Classification</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GEN-12345</td>
                <td>BRCA1</td>
                <td>c.5266dupC</td>
                <td><span className="tag-pathogenic">Pathogenic</span></td>
                <td>May 10, 2023</td>
                <td>
                  <button className="btn-outline btn-small">Details</button>
                  <button className="btn-primary btn-small">Add to Analysis</button>
                </td>
              </tr>
              <tr>
                <td>GEN-23456</td>
                <td>BRCA2</td>
                <td>c.6275_6276delTT</td>
                <td><span className="tag-pathogenic">Pathogenic</span></td>
                <td>May 12, 2023</td>
                <td>
                  <button className="btn-outline btn-small">Details</button>
                  <button className="btn-primary btn-small">Add to Analysis</button>
                </td>
              </tr>
              <tr>
                <td>GEN-34567</td>
                <td>CYP2D6</td>
                <td>*4 allele</td>
                <td><span className="tag-metabolizer">Poor metabolizer</span></td>
                <td>May 15, 2023</td>
                <td>
                  <button className="btn-outline btn-small">Details</button>
                  <button className="btn-primary btn-small">Add to Analysis</button>
                </td>
              </tr>
              <tr>
                <td>GEN-45678</td>
                <td>BRCA1</td>
                <td>c.181T&gt;G</td>
                <td><span className="tag-benign">Benign</span></td>
                <td>May 18, 2023</td>
                <td>
                  <button className="btn-outline btn-small">Details</button>
                  <button className="btn-primary btn-small">Add to Analysis</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="table-pagination">
            <button className="pagination-btn">Previous</button>
            <span className="pagination-info">Page 1 of 3 (showing 1-4 of 12 records)</span>
            <button className="pagination-btn active">Next</button>
          </div>
        </div>
        
        <div className="privacy-notice">
          <div className="notice-icon"></div>
          <p>All data shown has been anonymized and was shared with explicit consent through zero-knowledge proofs. No raw genomic data is accessible.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ResearcherData;