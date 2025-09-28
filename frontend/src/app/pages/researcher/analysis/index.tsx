import { Layout } from "../../../layout/Layout";
import "../researcher-styles.css";

/**
 * Researcher Analysis Page
 */
export const ResearcherAnalysis = () => {
  return (
    <Layout title="Data Analysis" role="researcher">
      <div className="researcher-analysis">
        <h2>Genomic Data Analysis</h2>
        <p>Analyze anonymized genomic data using privacy-preserving tools.</p>
        
        <div className="analysis-tools">
          <div className="analysis-tool">
            <h3>Statistical Analysis</h3>
            <p>Run statistical tests on genomic variant distributions.</p>
            <div className="form-group">
              <label htmlFor="dataset">Select Dataset</label>
              <select id="dataset">
                <option value="">-- Select a dataset --</option>
                <option value="brca">BRCA Dataset</option>
                <option value="cyp2d6">CYP2D6 Dataset</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="analysis-type">Analysis Type</label>
              <select id="analysis-type">
                <option value="frequency">Variant Frequency</option>
                <option value="correlation">Trait Correlation</option>
                <option value="distribution">Distribution Analysis</option>
              </select>
            </div>
            <button className="btn-primary">Run Analysis</button>
          </div>
          
          <div className="analysis-tool">
            <h3>Variant Impact</h3>
            <p>Analyze the potential impact of genetic variants.</p>
            <div className="form-group">
              <label htmlFor="gene">Gene</label>
              <select id="gene">
                <option value="">-- Select a gene --</option>
                <option value="brca1">BRCA1</option>
                <option value="brca2">BRCA2</option>
                <option value="cyp2d6">CYP2D6</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="variant-id">Variant ID</label>
              <input type="text" id="variant-id" placeholder="Enter variant ID or name" />
            </div>
            <button className="btn-primary">Analyze Impact</button>
          </div>
        </div>
        
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <div className="results-placeholder">
            <p>Run an analysis to see results here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResearcherAnalysis;