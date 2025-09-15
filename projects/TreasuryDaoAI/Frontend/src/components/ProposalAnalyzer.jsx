import React, { useState } from 'react';
import AIService from '../services/aiService';

const ProposalAnalyzer = ({ proposalData, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [votingRecommendation, setVotingRecommendation] = useState(null);

  const analyzeProposal = async () => {
    if (!proposalData) {
      alert('Please provide proposal data for analysis');
      return;
    }

    try {
      setLoading(true);
      console.log('🤖 Starting proposal analysis...', proposalData);
      
      const result = await AIService.scoreProposal(proposalData);
      setAnalysis(result);
      console.log('✅ Proposal analysis complete:', result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVotingAdvice = async () => {
    if (!proposalData || !analysis) {
      alert('Please analyze the proposal first');
      return;
    }

    try {
      setLoading(true);
      console.log('🗳️ Getting voting recommendation...');
      
      const votingResult = await getVotingRecommendation(proposalData, analysis);
      setVotingRecommendation(votingResult);
      console.log('✅ Voting recommendation complete:', votingResult);
    } catch (error) {
      console.error('Voting recommendation error:', error);
      alert('Failed to get voting recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setVotingRecommendation(null);
    setShowDetails(false);
    console.log('🔄 Analysis reset');
  };

  const getVotingRecommendation = async (proposalData, analysisResult) => {
    try {
      const prompt = `Based on this proposal analysis, provide a voting recommendation:

Proposal Details:
- Description: ${proposalData.description}
- Amount: ${proposalData.amount} CFX
- Destination: ${proposalData.destination}

Analysis Results:
- Overall Score: ${analysisResult.overallScore}/100
- Clarity: ${analysisResult.clarity}/10
- Feasibility: ${analysisResult.feasibility}/10
- Risk Level: ${analysisResult.riskLevel}/10
- Potential ROI: ${analysisResult.potentialROI}/10
- Community Impact: ${analysisResult.communityImpact}/10
- Innovation: ${analysisResult.innovation}/10

Please provide a JSON response with:
{
  "recommendation": "YES" | "NO" | "ABSTAIN",
  "confidence": number (1-100),
  "reasoning": "detailed explanation for the recommendation",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "risks": ["risk1", "risk2"],
  "benefits": ["benefit1", "benefit2"]
}`;

      console.log('Getting voting recommendation for:', proposalData);
      console.log('Analysis result:', analysisResult);
      
      const response = await AIService.callOpenAI(prompt, 'You are an expert DAO governance advisor. Provide clear, objective voting recommendations based on proposal analysis.');
      console.log('AI Response:', response);
      
      const parsedResponse = AIService.parseAIResponse(response);
      console.log('Parsed voting recommendation:', parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error('Voting recommendation error:', error);
      return {
        recommendation: 'ABSTAIN',
        confidence: 50,
        reasoning: 'Unable to analyze voting recommendation at this time',
        keyFactors: ['Analysis unavailable'],
        risks: ['Unable to assess'],
        benefits: ['Unable to assess']
      };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  const getVotingColor = (recommendation) => {
    switch (recommendation) {
      case 'YES': return 'text-success';
      case 'NO': return 'text-danger';
      case 'ABSTAIN': return 'text-warning';
      default: return 'text-info';
    }
  };

  const getVotingClass = (recommendation) => {
    switch (recommendation) {
      case 'YES': return 'bg-success';
      case 'NO': return 'bg-danger';
      case 'ABSTAIN': return 'bg-warning';
      default: return 'bg-info';
    }
  };

  const getVotingIcon = (recommendation) => {
    switch (recommendation) {
      case 'YES': return 'fas fa-check-circle';
      case 'NO': return 'fas fa-times-circle';
      case 'ABSTAIN': return 'fas fa-question-circle';
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
        <h6 className="m-0 font-weight-bold text-primary">
          🤖 AI Proposal Analyzer
        </h6>
        <div className="btn-group" role="group">
          <button
            className="btn btn-primary btn-sm"
            onClick={analyzeProposal}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-robot mr-2"></i>
                Analyze Proposal
              </>
            )}
          </button>
          {analysis && !votingRecommendation && (
            <button
              className="btn btn-success btn-sm"
              onClick={getVotingAdvice}
              disabled={loading}
            >
              <i className="fas fa-vote-yea mr-2"></i>
              Get Voting Advice
            </button>
          )}
          {analysis && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={resetAnalysis}
              disabled={loading}
            >
              <i className="fas fa-redo mr-2"></i>
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {analysis ? (
          <div>
            {/* Overall Score */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h4 className={`font-weight-bold ${getScoreColor(analysis.overallScore)}`}>
                  Overall Score: {analysis.overallScore}/100
                </h4>
                <div className="progress mb-2" style={{ height: '20px' }}>
                  <div
                    className={`progress-bar ${getScoreClass(analysis.overallScore)}`}
                    role="progressbar"
                    style={{ width: `${analysis.overallScore}%` }}
                    aria-valuenow={analysis.overallScore}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {analysis.overallScore}%
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-right">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>

            {/* Detailed Scores */}
            {showDetails && (
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="font-weight-bold">Detailed Analysis</h6>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>Clarity & Detail</span>
                      <span className={getScoreColor(analysis.clarity * 10)}>
                        {analysis.clarity}/10
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getScoreClass(analysis.clarity * 10)}`}
                        style={{ width: `${analysis.clarity * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>Feasibility</span>
                      <span className={getScoreColor(analysis.feasibility * 10)}>
                        {analysis.feasibility}/10
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getScoreClass(analysis.feasibility * 10)}`}
                        style={{ width: `${analysis.feasibility * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>Risk Level</span>
                      <span className={getScoreColor((10 - analysis.riskLevel) * 10)}>
                        {analysis.riskLevel}/10
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getScoreClass((10 - analysis.riskLevel) * 10)}`}
                        style={{ width: `${(10 - analysis.riskLevel) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>Potential ROI</span>
                      <span className={getScoreColor(analysis.potentialROI * 10)}>
                        {analysis.potentialROI}/10
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getScoreClass(analysis.potentialROI * 10)}`}
                        style={{ width: `${analysis.potentialROI * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>Community Impact</span>
                      <span className={getScoreColor(analysis.communityImpact * 10)}>
                        {analysis.communityImpact}/10
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getScoreClass(analysis.communityImpact * 10)}`}
                        style={{ width: `${analysis.communityImpact * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>Innovation Factor</span>
                      <span className={getScoreColor(analysis.innovation * 10)}>
                        {analysis.innovation}/10
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${getScoreClass(analysis.innovation * 10)}`}
                        style={{ width: `${analysis.innovation * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths and Weaknesses */}
            <div className="row">
              <div className="col-md-6">
                <h6 className="font-weight-bold text-success">
                  <i className="fas fa-check-circle mr-2"></i>
                  Strengths
                </h6>
                <ul className="list-unstyled">
                  {analysis.strengths?.map((strength, index) => (
                    <li key={index} className="mb-1">
                      <i className="fas fa-plus-circle text-success mr-2"></i>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="font-weight-bold text-danger">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Areas for Improvement
                </h6>
                <ul className="list-unstyled">
                  {analysis.weaknesses?.map((weakness, index) => (
                    <li key={index} className="mb-1">
                      <i className="fas fa-minus-circle text-danger mr-2"></i>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="mt-4">
                <h6 className="font-weight-bold text-info">
                  <i className="fas fa-lightbulb mr-2"></i>
                  AI Recommendations
                </h6>
                <div className="bg-light p-3 rounded">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="mb-1">
                      <i className="fas fa-arrow-right text-info mr-2"></i>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voting Recommendation */}
            {votingRecommendation && (
              <div className="mt-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h6 className="m-0 font-weight-bold">
                      <i className="fas fa-vote-yea mr-2"></i>
                      AI Voting Recommendation
                    </h6>
                  </div>
                  <div className="card-body">
                    {/* Voting Decision */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="text-center p-3 border rounded">
                          <i className={`${getVotingIcon(votingRecommendation.recommendation || 'ABSTAIN')} fa-3x ${getVotingColor(votingRecommendation.recommendation || 'ABSTAIN')} mb-2`}></i>
                          <h4 className={`font-weight-bold ${getVotingColor(votingRecommendation.recommendation || 'ABSTAIN')}`}>
                            {votingRecommendation.recommendation || 'ABSTAIN'}
                          </h4>
                          <p className="text-muted">AI Recommendation</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="text-center p-3 border rounded">
                          <h4 className="font-weight-bold text-info">
                            {votingRecommendation.confidence || 50}%
                          </h4>
                          <p className="text-muted">Confidence Level</p>
                          <div className="progress mb-2" style={{ height: '20px' }}>
                            <div
                              className="progress-bar bg-info"
                              role="progressbar"
                              style={{ width: `${votingRecommendation.confidence || 50}%` }}
                              aria-valuenow={votingRecommendation.confidence || 50}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {votingRecommendation.confidence || 50}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="mb-4">
                      <h6 className="font-weight-bold text-dark">
                        <i className="fas fa-brain mr-2"></i>
                        AI Reasoning
                      </h6>
                      <div className="bg-light p-3 rounded">
                        <p className="mb-0">{votingRecommendation.reasoning || 'Analysis in progress...'}</p>
                      </div>
                    </div>

                    {/* Key Factors, Risks, and Benefits */}
                    <div className="row">
                      <div className="col-md-4">
                        <h6 className="font-weight-bold text-success">
                          <i className="fas fa-check-circle mr-2"></i>
                          Key Factors
                        </h6>
                        <ul className="list-unstyled">
                          {(votingRecommendation.keyFactors || ['Analysis in progress...']).map((factor, index) => (
                            <li key={index} className="mb-1">
                              <i className="fas fa-plus-circle text-success mr-2"></i>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-md-4">
                        <h6 className="font-weight-bold text-danger">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Risks
                        </h6>
                        <ul className="list-unstyled">
                          {(votingRecommendation.risks || ['Analysis in progress...']).map((risk, index) => (
                            <li key={index} className="mb-1">
                              <i className="fas fa-times-circle text-danger mr-2"></i>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-md-4">
                        <h6 className="font-weight-bold text-info">
                          <i className="fas fa-star mr-2"></i>
                          Benefits
                        </h6>
                        <ul className="list-unstyled">
                          {(votingRecommendation.benefits || ['Analysis in progress...']).map((benefit, index) => (
                            <li key={index} className="mb-1">
                              <i className="fas fa-check-circle text-info mr-2"></i>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-robot fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">Ready to Analyze</h5>
            <p className="text-muted">
              Click "Analyze Proposal" to get AI-powered insights about this proposal.
            </p>
            {proposalData && (
              <div className="mt-3">
                <small className="text-info">
                  <i className="fas fa-info-circle mr-1"></i>
                  Proposal data loaded: {proposalData.description ? 'Description ✓' : 'No description'} | 
                  Amount: {proposalData.amount} CFX | 
                  Destination: {proposalData.destination}
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalAnalyzer;
