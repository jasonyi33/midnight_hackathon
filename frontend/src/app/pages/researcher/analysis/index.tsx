import { Layout } from "../../../layout/Layout";
import "../researcher-styles.css";

/**
 * Researcher Analysis Page
 */
export const ResearcherAnalysis = () => {
  return (
    <Layout role="researcher">
      <div className="researcher-analysis">
        <h2>Genomic Data Analysis</h2>
        <p>Analyze anonymized genomic data using privacy-preserving tools while protecting patient identities.</p>
        
        <div className="analysis-container">
          <div className="analysis-tools">
            <h3>Analysis Tools</h3>
            
            <div className="form-group">
              <label htmlFor="dataset">Select Dataset</label>
              <select id="dataset" className="select-styled">
                <option value="brca1" selected>BRCA1 Dataset</option>
                <option value="brca2">BRCA2 Dataset</option>
                <option value="cyp2d6">CYP2D6 Dataset</option>
                <option value="all">All Variants</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="analysis-type">Analysis Type</label>
                <select id="analysis-type" className="select-styled">
                  <option value="frequency" selected>Variant Frequency</option>
                  <option value="distribution">Distribution Analysis</option>
                  <option value="correlation">Trait Correlation</option>
                  <option value="timeseries">Time Series Analysis</option>
                </select>
              </div>
              
              <div className="form-col">
                <label htmlFor="visualization">Visualization</label>
                <select id="visualization" className="select-styled">
                  <option value="barchart" selected>Bar Chart</option>
                  <option value="piechart">Pie Chart</option>
                  <option value="linechart">Line Chart</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="table">Data Table</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button className="btn-outline">Reset</button>
              <button className="btn-primary">Run Analysis</button>
            </div>
          </div>
          
          <div className="analysis-results">
            <h3>BRCA1 Variant Frequency Distribution</h3>
            
            <div className="results-chart">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  <div className="chart-bar" style={{height: "65%"}}><span>c.5266dupC</span></div>
                  <div className="chart-bar" style={{height: "42%"}}><span>c.181T&gt;G</span></div>
                  <div className="chart-bar" style={{height: "78%"}}><span>c.68_69delAG</span></div>
                  <div className="chart-bar" style={{height: "35%"}}><span>c.4327C&gt;T</span></div>
                  <div className="chart-bar" style={{height: "51%"}}><span>c.5123C&gt;A</span></div>
                </div>
                <div className="chart-legend">
                  <span>Pathogenic</span>
                  <span>Benign</span>
                  <span>VUS</span>
                </div>
              </div>
            </div>
            
            <div className="result-stats">
              <div className="result-stat">
                <h4>37</h4>
                <p>Total Samples</p>
              </div>
              <div className="result-stat">
                <h4>53.4%</h4>
                <p>Pathogenic</p>
              </div>
              <div className="result-stat">
                <h4>29.7%</h4>
                <p>Benign</p>
              </div>
              <div className="result-stat">
                <h4>16.9%</h4>
                <p>VUS</p>
              </div>
            </div>
            
            <div className="result-actions">
              <button className="btn-outline">Export Data (CSV)</button>
              <button className="btn-outline">Save Analysis</button>
              <button className="btn-primary">Generate Report</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResearcherAnalysis;