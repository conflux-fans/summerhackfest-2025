import React, { useState } from 'react';
import AIService from '../services/aiService';

const InvestmentAnalyzer = ({ proposalData, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeInvestment = async () => {
    if (!proposalData) {
      alert('Please provide proposal data for investment analysis');
      return;
    }

    try {
      setLoading(true);
      const result = await AIService.analyzeInvestment(proposalData);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Investment analysis error:', error);
      alert('Failed to analyze investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk <= 3) return 'text-success';
    if (risk <= 6) return 'text-warning';
    return 'text-danger';
  };

  const getRiskClass = (risk) => {
    if (risk <= 3) return 'bg-success';
    if (risk <= 6) return 'bg-warning';
    return 'bg-danger';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Strong Buy': return 'text-success';
      case 'Buy': return 'text-success';
      case 'Hold': return 'text-warning';
      case 'Sell': return 'text-danger';
      case 'Strong Sell': return 'text-danger';
      default: return 'text-info';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'Strong Buy': return 'fas fa-arrow-up';
      case 'Buy': return 'fas fa-arrow-up';
      case 'Hold': return 'fas fa-minus';
      case 'Sell': return 'fas fa-arrow-down';
      case 'Strong Sell': return 'fas fa-arrow-down';
      default: return 'fas fa-question';
    }
  };

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
        <h6 className="m-0 font-weight-bold text-primary">
          💰 AI Investment Analysis
        </h6>
        <button
          className="btn btn-primary btn-sm"
          onClick={analyzeInvestment}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
              Analyzing...
            </>
          ) : (
            <>
              <i className="fas fa-chart-line mr-2"></i>
              Analyze Investment
            </>
          )}
        </button>
      </div>
      <div className="card-body">
        {analysis ? (
          <div>
            {/* Investment Recommendation */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="text-center p-3 border rounded">
                  <i className={`${getRecommendationIcon(analysis.recommendation)} fa-3x ${getRecommendationColor(analysis.recommendation)} mb-2`}></i>
                  <h4 className={`font-weight-bold ${getRecommendationColor(analysis.recommendation)}`}>
                    {analysis.recommendation}
                  </h4>
                  <p className="text-muted">AI Recommendation</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text-center p-3 border rounded">
                  <h4 className={`font-weight-bold ${getRiskColor(analysis.riskAssessment)}`}>
                    {analysis.riskAssessment}/10
                  </h4>
                  <p className="text-muted">Risk Assessment</p>
                  <div className="progress mb-2" style={{ height: '20px' }}>
                    <div
                      className={`progress-bar ${getRiskClass(analysis.riskAssessment)}`}
                      role="progressbar"
                      style={{ width: `${analysis.riskAssessment * 10}%` }}
                      aria-valuenow={analysis.riskAssessment}
                      aria-valuemin="0"
                      aria-valuemax="10"
                    >
                      {analysis.riskAssessment}/10
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="row mb-4">
              <div className="col-md-12">
                <h6 className="font-weight-bold">AI Confidence Score</h6>
                <div className="progress mb-2" style={{ height: '25px' }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${analysis.confidenceScore}%` }}
                    aria-valuenow={analysis.confidenceScore}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {analysis.confidenceScore}%
                  </div>
                </div>
                <small className="text-muted">
                  Based on market analysis, historical data, and proposal details
                </small>
              </div>
            </div>

            {/* Market Context */}
            {analysis.marketContext && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <h6 className="font-weight-bold text-info">
                    <i className="fas fa-globe mr-2"></i>
                    Market Context
                  </h6>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0">{analysis.marketContext}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Risks and Opportunities */}
            <div className="row">
              <div className="col-md-6">
                <h6 className="font-weight-bold text-danger">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Key Risks
                </h6>
                <ul className="list-unstyled">
                  {analysis.keyRisks?.map((risk, index) => (
                    <li key={index} className="mb-2">
                      <i className="fas fa-times-circle text-danger mr-2"></i>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="font-weight-bold text-success">
                  <i className="fas fa-star mr-2"></i>
                  Opportunities
                </h6>
                <ul className="list-unstyled">
                  {analysis.opportunities?.map((opportunity, index) => (
                    <li key={index} className="mb-2">
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Analysis Toggle */}
            <div className="row mt-4">
              <div className="col-md-12 text-center">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Detailed Analysis' : 'Show Detailed Analysis'}
                </button>
              </div>
            </div>

            {/* Detailed Analysis */}
            {showDetails && (
              <div className="row mt-4">
                <div className="col-md-12">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="font-weight-bold">Detailed AI Analysis</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Technical Analysis</h6>
                          <p className="text-muted">
                            The AI has analyzed the technical aspects of this proposal including 
                            implementation feasibility, resource requirements, and potential technical challenges.
                          </p>
                        </div>
                        <div className="col-md-6">
                          <h6>Market Analysis</h6>
                          <p className="text-muted">
                            Market conditions, trends, and competitive landscape have been evaluated 
                            to provide context for this investment decision.
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Risk Assessment</h6>
                          <p className="text-muted">
                            Multiple risk factors including market risk, execution risk, and 
                            regulatory risk have been considered in the analysis.
                          </p>
                        </div>
                        <div className="col-md-6">
                          <h6>ROI Projection</h6>
                          <p className="text-muted">
                            Based on historical data and market conditions, the AI has projected 
                            potential returns and timeline for this investment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">Ready for Investment Analysis</h5>
            <p className="text-muted">
              Click "Analyze Investment" to get AI-powered insights about this investment opportunity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentAnalyzer;
