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
      const data = await AIService.getMarketAnalysis();
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
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
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading AI Analysis...</span>
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
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h4 className={`font-weight-bold ${getRiskColor(marketData.riskLevel)}`}>
                      {marketData.riskLevel}
                    </h4>
                    <p className="text-muted">Risk Level</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h4 className="font-weight-bold text-info">
                      {marketData.confidence}%
                    </h4>
                    <p className="text-muted">AI Confidence</p>
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
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              📈 Top Performing Assets
            </h6>
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
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              💡 AI Investment Recommendations
            </h6>
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

      {/* AI Insights */}
      <div className="col-xl-12 col-lg-12 mb-4">
        <div className="card shadow">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              🧠 AI Market Insights
            </h6>
          </div>
          <div className="card-body">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
