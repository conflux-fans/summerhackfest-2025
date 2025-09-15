import React, { useState } from 'react';
import AIService from '../services/aiService';

const AIProposalSuggestions = ({ proposalData, onUpdateProposal }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const analyzeProposal = async () => {
    if (!proposalData || (!proposalData.description && !proposalData.title)) {
      alert('Please fill in at least the title or description to get AI suggestions');
      return;
    }

    try {
      setLoading(true);
      console.log('🤖 Analyzing proposal for improvements...', proposalData);
      
      const result = await AIService.getProposalImprovements(proposalData);
      setSuggestions(result);
      setShowSuggestions(true);
      console.log('✅ AI suggestions received:', result);
    } catch (error) {
      console.error('❌ Analysis error:', error);
      alert('Failed to analyze proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (type) => {
    try {
      setLoading(true);
      console.log(`🤖 Generating ${type} content...`);
      
      const result = await AIService.generateProposalContent(proposalData, type);
      console.log(`✅ ${type} content generated:`, result);
      
      // Update the specific field with AI-generated content
      if (onUpdateProposal) {
        switch (type) {
          case 'title':
            onUpdateProposal({ title: result.suggestedTitle });
            break;
          case 'description':
            onUpdateProposal({ description: result.suggestedDescription });
            break;
          case 'amount':
            onUpdateProposal({ amount: result.suggestedAmount });
            break;
          case 'destination':
            onUpdateProposal({ destination: result.suggestedDestination });
            break;
          default:
            onUpdateProposal({
              title: result.suggestedTitle,
              description: result.suggestedDescription,
              amount: result.suggestedAmount,
              destination: result.suggestedDestination
            });
        }
      }
    } catch (error) {
      console.error(`❌ ${type} generation error:`, error);
      alert(`Failed to generate ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const applyAllSuggestions = () => {
    if (suggestions && onUpdateProposal) {
      onUpdateProposal({
        title: suggestions.suggestedTitle,
        description: suggestions.suggestedDescription,
        amount: suggestions.suggestedAmount,
        destination: suggestions.suggestedDestination
      });
      alert('All AI suggestions have been applied to your proposal!');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-danger';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-success';
      default: return 'text-info';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return 'fas fa-exclamation-triangle';
      case 'Medium': return 'fas fa-exclamation-circle';
      case 'Low': return 'fas fa-info-circle';
      default: return 'fas fa-lightbulb';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Clarity': return 'fas fa-eye';
      case 'Feasibility': return 'fas fa-cogs';
      case 'Risk Management': return 'fas fa-shield-alt';
      case 'Community Impact': return 'fas fa-users';
      case 'Technical Details': return 'fas fa-code';
      default: return 'fas fa-star';
    }
  };

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
        <h6 className="m-0 font-weight-bold text-primary">
          <i className="fas fa-robot mr-2"></i>
          AI Proposal Assistant
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
                <i className="fas fa-magic mr-2"></i>
                Get AI Suggestions
              </>
            )}
          </button>
          {suggestions && (
            <button
              className="btn btn-success btn-sm"
              onClick={applyAllSuggestions}
              disabled={loading}
            >
              <i className="fas fa-check-double mr-2"></i>
              Apply All
            </button>
          )}
        </div>
      </div>
      
      <div className="card-body">
        {!showSuggestions ? (
          <div className="text-center py-4">
            <i className="fas fa-magic fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">AI-Powered Proposal Enhancement</h5>
            <p className="text-muted">
              Get intelligent suggestions to improve your proposal's clarity, feasibility, and success probability.
            </p>
            <div className="mt-3">
              <small className="text-info">
                <i className="fas fa-info-circle mr-1"></i>
                Fill in your proposal details and click "Get AI Suggestions" to start
              </small>
            </div>
          </div>
        ) : suggestions ? (
          <div>
            {/* Overview Tab */}
            <div className="mb-4">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="font-weight-bold text-primary">
                    <i className="fas fa-chart-line mr-2"></i>
                    Proposal Score: {suggestions.overallScore}/100
                  </h5>
                  <div className="progress mb-2" style={{ height: '20px' }}>
                    <div
                      className={`progress-bar ${
                        suggestions.overallScore >= 80 ? 'bg-success' : 
                        suggestions.overallScore >= 60 ? 'bg-warning' : 'bg-danger'
                      }`}
                      role="progressbar"
                      style={{ width: `${suggestions.overallScore}%` }}
                    >
                      {suggestions.overallScore}%
                    </div>
                  </div>
                </div>
                <div className="col-md-6 text-right">
                  <h5 className="font-weight-bold text-info">
                    <i className="fas fa-target mr-2"></i>
                    Success Probability: {suggestions.successProbability}%
                  </h5>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-3" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="fas fa-chart-pie mr-2"></i>
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'improvements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('improvements')}
                >
                  <i className="fas fa-tools mr-2"></i>
                  Improvements
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'suggestions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('suggestions')}
                >
                  <i className="fas fa-lightbulb mr-2"></i>
                  AI Suggestions
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="font-weight-bold text-success">
                        <i className="fas fa-check-circle mr-2"></i>
                        Key Strengths
                      </h6>
                      <ul className="list-unstyled">
                        {suggestions.keyStrengths?.map((strength, index) => (
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
                        Critical Issues
                      </h6>
                      <ul className="list-unstyled">
                        {suggestions.criticalIssues?.map((issue, index) => (
                          <li key={index} className="mb-1">
                            <i className="fas fa-times-circle text-danger mr-2"></i>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h6 className="font-weight-bold text-info">
                      <i className="fas fa-list-check mr-2"></i>
                      Next Steps
                    </h6>
                    <ol>
                      {suggestions.nextSteps?.map((step, index) => (
                        <li key={index} className="mb-1">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* Improvements Tab */}
              {activeTab === 'improvements' && (
                <div>
                  <h6 className="font-weight-bold mb-3">
                    <i className="fas fa-tools mr-2"></i>
                    Detailed Improvement Suggestions
                  </h6>
                  {suggestions.improvements?.map((improvement, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">
                            <i className={`${getCategoryIcon(improvement.category)} mr-2`}></i>
                            {improvement.category}
                          </h6>
                          <span className={`badge ${getPriorityColor(improvement.priority)}`}>
                            <i className={`${getPriorityIcon(improvement.priority)} mr-1`}></i>
                            {improvement.priority} Priority
                          </span>
                        </div>
                        <p className="card-text">
                          <strong>Suggestion:</strong> {improvement.suggestion}
                        </p>
                        <p className="card-text text-muted">
                          <strong>Reason:</strong> {improvement.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <div>
                  <h6 className="font-weight-bold mb-3">
                    <i className="fas fa-lightbulb mr-2"></i>
                    AI-Generated Content
                  </h6>
                  
                  <div className="row">
                    {/* Title Suggestion */}
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-heading mr-2"></i>
                            Title Suggestion
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text">
                            <strong>Suggested:</strong> {suggestions.suggestedTitle}
                          </p>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => generateContent('title')}
                            disabled={loading}
                          >
                            <i className="fas fa-magic mr-2"></i>
                            Apply Title
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Description Suggestion */}
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-align-left mr-2"></i>
                            Description Suggestion
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text">
                            <strong>Suggested:</strong> {suggestions.suggestedDescription?.substring(0, 100)}...
                          </p>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => generateContent('description')}
                            disabled={loading}
                          >
                            <i className="fas fa-magic mr-2"></i>
                            Apply Description
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Amount Suggestion */}
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-coins mr-2"></i>
                            Amount Suggestion
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text">
                            <strong>Suggested:</strong> {suggestions.suggestedAmount} CFX
                          </p>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => generateContent('amount')}
                            disabled={loading}
                          >
                            <i className="fas fa-magic mr-2"></i>
                            Apply Amount
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Destination Suggestion */}
                    <div className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Destination Suggestion
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text">
                            <strong>Suggested:</strong> {suggestions.suggestedDestination?.substring(0, 20)}...
                          </p>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => generateContent('destination')}
                            disabled={loading}
                          >
                            <i className="fas fa-magic mr-2"></i>
                            Apply Destination
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AIProposalSuggestions;
