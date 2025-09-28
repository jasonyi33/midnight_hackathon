import { Layout } from "../../../layout/Layout";
import "../researcher-styles.css";

/**
 * Researcher Data Page
 */
export const ResearcherData = () => {
  return (
    <Layout title="Genomic Data" role="researcher">
      <div className="researcher-data">
        <h2>Available Genomic Data</h2>
        <p>Browse and filter anonymized genomic data available for research.</p>
        
        <div className="data-filter">
          <h3>Filter Data</h3>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="trait">Genetic Trait</label>
              <select id="trait">
                <option value="">All Traits</option>
                <option value="BRCA1">BRCA1</option>
                <option value="BRCA2">BRCA2</option>
                <option value="CYP2D6">CYP2D6</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="variant">Variant Type</label>
              <select id="variant">
                <option value="">All Variants</option>
                <option value="pathogenic">Pathogenic</option>
                <option value="benign">Benign</option>
                <option value="vus">VUS</option>
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
                <td>Pathogenic</td>
                <td>May 10, 2023</td>
                <td>
                  <button className="btn-outline">View</button>
                </td>
              </tr>
              <tr>
                <td>GEN-23456</td>
                <td>BRCA2</td>
                <td>c.6275_6276delTT</td>
                <td>Pathogenic</td>
                <td>May 12, 2023</td>
                <td>
                  <button className="btn-outline">View</button>
                </td>
              </tr>
              <tr>
                <td>GEN-34567</td>
                <td>CYP2D6</td>
                <td>*4 allele</td>
                <td>Poor metabolizer</td>
                <td>May 15, 2023</td>
                <td>
                  <button className="btn-outline">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ResearcherData;