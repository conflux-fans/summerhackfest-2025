import React, { useState, useEffect } from 'react';
import AIService from '../services/aiService';

const AIDashboard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading market data...');
      const data = await AIService.getMarketAnalysis();
      console.log('📊 Market data received:', data);
      setMarketData(data);
    } catch (error) {
      console.error('❌ Error loading market data:', error);
      // Set fallback data if loading fails
      setMarketData({
        marketTrend: 'Unknown',
        topPerformingAssets: [],
        riskLevel: 'Unknown',
        recommendations: ['Unable to load market data'],
        confidence: 0,
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'Error Fallback'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'Bullish': return 'text-success';
      case 'Bearish': return 'text-danger';
      case 'Volatile': return 'text-warning';
      default: return 'text-info';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-danger';
      default: return 'text-info';
    }
  };

  if (loading && !marketData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="sr-only">Loading AI Analysis...</span>
          </div>
          <h5 className="text-muted">Loading AI Market Analysis...</h5>
          <p className="text-muted">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Show error state if no data and not loading
  if (!loading && !marketData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h5 className="text-muted">Unable to Load Market Data</h5>
          <p className="text-muted">Please check your connection and try again</p>
          <button className="btn btn-primary" onClick={loadMarketData}>
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Market Overview */}
      <div className="col-xl-12 col-lg-12 mb-4">
        <div className="card shadow">
          <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 className="m-0 font-weight-bold text-primary">
              🤖 AI Market Analysis Dashboard
            </h6>
            <div className="btn-group" role="group">
              {['1h', '24h', '7d', '30d'].map(timeframe => (
                <button
                  key={timeframe}
                  type="button"
                  className={`btn btn-sm ${selectedTimeframe === timeframe ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {marketData && (
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <h4 className={`font-weight-bold ${getTrendColor(marketData.marketTrend)}`}>
                      {marketData.marketTrend}
                    </h4>
                    <p className="text-muted">Market Trend</p>
                    {marketData.source && (
                      <small className={`badge ${marketData.source === 'OpenAI Analysis' ? 'badge-success' : marketData.source === 'Mock Data' ? 'badge-warning' : 'badge-danger'} badge-sm`}>
                        {marketData.source === 'OpenAI Analysis' ? 'AI' : marketData.source === 'Mock Data' ? 'Demo' : 'Error'}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h4 className={`font-weight-bold ${getRiskColor(marketData.riskLevel)}`}>
                      {marketData.riskLevel}
                    </h4>
                    <p className="text-muted">Risk Level</p>
                    {marketData.source && (
                      <small className={`badge ${marketData.source === 'OpenAI Analysis' ? 'badge-success' : marketData.source === 'Mock Data' ? 'badge-warning' : 'badge-danger'} badge-sm`}>
                        {marketData.source === 'OpenAI Analysis' ? 'AI' : marketData.source === 'Mock Data' ? 'Demo' : 'Error'}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h4 className="font-weight-bold text-info">
                      {marketData.confidence}%
                    </h4>
                    <p className="text-muted">AI Confidence</p>
                    {marketData.source && (
                      <small className={`badge ${marketData.source === 'OpenAI Analysis' ? 'badge-success' : marketData.source === 'Mock Data' ? 'badge-warning' : 'badge-danger'} badge-sm`}>
                        {marketData.source === 'OpenAI Analysis' ? 'AI' : marketData.source === 'Mock Data' ? 'Demo' : 'Error'}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={loadMarketData}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Refresh Analysis'}
                    </button>
                    <button 
                      className="btn btn-outline-info btn-sm ml-2"
                      onClick={async () => {
                        console.log('🧪 Testing AI Service...');
                        const testResult = await AIService.testService();
                        console.log('Test result:', testResult);
                      }}
                      disabled={loading}
                    >
                      Test Service
                    </button>
                    <button 
                      className="btn btn-outline-warning btn-sm ml-2"
                      onClick={async () => {
                        console.log('🔑 Testing API Key...');
                        const apiTest = await AIService.testAPIKey();
                        console.log('API Key test result:', apiTest);
                        if (apiTest.success) {
                          alert('✅ API Key is working!');
                        } else {
                          alert(`❌ API Key issue: ${apiTest.error}`);
                        }
                      }}
                      disabled={loading}
                    >
                      Test API Key
                    </button>
                    {marketData?.lastUpdated && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Last updated: {marketData.lastUpdated}
                        </small>
                        <br />
                        <small className="text-info">
                          <i className="fas fa-info-circle mr-1"></i>
                          {marketData.source === 'OpenAI Analysis' && 'Real-time AI analysis from OpenAI'}
                          {marketData.source === 'Mock Data' && 'Demo data for testing purposes'}
                          {marketData.source === 'Error Fallback' && 'Fallback data due to service error'}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Assets */}
      <div className="col-xl-6 col-lg-6 mb-4">
        <div className="card shadow">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-weight-bold text-primary">
              📈 Top Performing Assets
            </h6>
            {marketData?.source && (
              <span className={`badge ${marketData.source === 'OpenAI Analysis' ? 'badge-success' : marketData.source === 'Mock Data' ? 'badge-warning' : 'badge-danger'} badge-sm`}>
                {marketData.source === 'OpenAI Analysis' ? 'AI Data' : marketData.source === 'Mock Data' ? 'Demo Data' : 'Error Data'}
              </span>
            )}
          </div>
          <div className="card-body">
            {marketData?.topPerformingAssets?.map((asset, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <strong>{asset.name}</strong>
                </div>
                <div className={`font-weight-bold ${asset.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                  {asset.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="col-xl-6 col-lg-6 mb-4">
        <div className="card shadow">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-weight-bold text-primary">
              💡 AI Investment Recommendations
            </h6>
            {marketData?.source && (
              <span className={`badge ${marketData.source === 'OpenAI Analysis' ? 'badge-success' : marketData.source === 'Mock Data' ? 'badge-warning' : 'badge-danger'} badge-sm`}>
                {marketData.source === 'OpenAI Analysis' ? 'AI Data' : marketData.source === 'Mock Data' ? 'Demo Data' : 'Error Data'}
              </span>
            )}
          </div>
          <div className="card-body">
            {marketData?.recommendations?.map((rec, index) => (
              <div key={index} className="mb-2">
                <i className="fas fa-lightbulb text-warning mr-2"></i>
                {rec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Market Insights */}
      <div className="col-xl-12 col-lg-12 mb-4">
        <div className="card shadow">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              🧠 AI Market Insights
            </h6>
          </div>
          <div className="card-body">
            {marketData?.marketInsights && (
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-primary">Current Market Analysis:</h6>
                  <p className="text-muted">{marketData.marketInsights}</p>
                </div>
              </div>
            )}
            {marketData?.treasuryAdvice && (
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-success">Treasury Management Advice:</h6>
                  <p className="text-muted">{marketData.treasuryAdvice}</p>
                </div>
              </div>
            )}
            <div className="row">
              <div className="col-md-4">
                <div className="text-center p-3 border rounded">
                  <i className="fas fa-chart-line fa-2x text-primary mb-2"></i>
                  <h6>Market Sentiment</h6>
                  <p className="text-muted">AI analyzes market sentiment and trends</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center p-3 border rounded">
                  <i className="fas fa-shield-alt fa-2x text-success mb-2"></i>
                  <h6>Risk Assessment</h6>
                  <p className="text-muted">Real-time risk evaluation and alerts</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center p-3 border rounded">
                  <i className="fas fa-robot fa-2x text-info mb-2"></i>
                  <h6>AI Predictions</h6>
                  <p className="text-muted">Machine learning powered forecasts</p>
                </div>
              </div>
            </div>
            {marketData?.source && (
              <div className="row mt-3">
                <div className="col-12 text-center">
                  <div className={`badge ${marketData.source === 'OpenAI Analysis' ? 'badge-success' : marketData.source === 'Mock Data' ? 'badge-warning' : 'badge-danger'} p-2`}>
                    <i className={`fas ${marketData.source === 'OpenAI Analysis' ? 'fa-robot' : marketData.source === 'Mock Data' ? 'fa-database' : 'fa-exclamation-triangle'} mr-1`}></i>
                    Data Source: {marketData.source}
                    {marketData.source === 'OpenAI Analysis' && (
                      <span className="ml-2 text-success">
                        <i className="fas fa-check-circle"></i> Real-time AI Analysis
                      </span>
                    )}
                    {marketData.source === 'Mock Data' && (
                      <span className="ml-2 text-warning">
                        <i className="fas fa-info-circle"></i> Demo Data
                      </span>
                    )}
                    {marketData.source === 'Error Fallback' && (
                      <span className="ml-2 text-danger">
                        <i className="fas fa-exclamation-triangle"></i> Service Unavailable
                      </span>
                    )}
                  </div>
                  
                  {/* API Key Status */}
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-key mr-1"></i>
                      API Key Status: {process.env.REACT_APP_OPENAI_API_KEY ? 
                        (process.env.REACT_APP_OPENAI_API_KEY.startsWith('sk-') ? 
                          <span className="text-success">✅ Configured</span> : 
                          <span className="text-warning">⚠️ Invalid Format</span>) : 
                        <span className="text-danger">❌ Not Set</span>}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
