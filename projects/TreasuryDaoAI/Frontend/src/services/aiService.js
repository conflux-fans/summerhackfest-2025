// AI Service for Treasury DAO
// This service handles all AI-related functionality

class AIService {
  constructor() {
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || 'your-openai-api-key';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  // AI Investment Analysis
  async analyzeInvestment(proposalData) {
    try {
      const systemPrompt = `You are an expert AI investment analyst for a Treasury DAO. Provide detailed, professional analysis in JSON format.`;
      
      const prompt = `Analyze this investment proposal for a Treasury DAO:

Proposal Details:
- Amount: ${proposalData.amount} CFX
- Destination: ${proposalData.destination}
- Description: ${proposalData.description}
- Club ID: ${proposalData.clubId}

Please provide a JSON response with:
{
  "riskAssessment": number (1-10 scale),
  "recommendation": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
  "keyRisks": ["risk1", "risk2", "risk3"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "marketContext": "brief market analysis",
  "confidenceScore": number (1-100)
}`;

      const response = await this.callOpenAI(prompt, systemPrompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI Investment Analysis Error:', error);
      return this.getFallbackAnalysis(proposalData);
    }
  }

  // Smart Proposal Scoring
  async scoreProposal(proposalData) {
    try {
      const systemPrompt = `You are an expert DAO proposal evaluator. Analyze proposals objectively and provide detailed scoring in JSON format.`;
      
      const prompt = `Score this DAO proposal on multiple criteria (1-10 scale):

Proposal: ${proposalData.description}
Amount: ${proposalData.amount} CFX
Destination: ${proposalData.destination}

Please provide a JSON response with:
{
  "clarity": number (1-10),
  "feasibility": number (1-10),
  "riskLevel": number (1-10, lower is better),
  "potentialROI": number (1-10),
  "communityImpact": number (1-10),
  "innovation": number (1-10),
  "overallScore": number (1-100),
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

      const response = await this.callOpenAI(prompt, systemPrompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI Proposal Scoring Error:', error);
      return this.getFallbackScore(proposalData);
    }
  }

  // AI Chat Assistant
  async chatWithAI(message, context = {}) {
    try {
      const systemPrompt = `You are an AI assistant for a Treasury DAO platform on Conflux eSpace testnet. You help users with:
- Understanding DAO operations and governance
- Creating and evaluating investment proposals
- Investment analysis and risk assessment
- Technical support and guidance
- Market insights and recommendations

Current context: ${JSON.stringify(context)}

Be helpful, concise, and professional. Provide specific, actionable advice. If you don't know something, say so and offer to help with related topics.`;

      const response = await this.callOpenAI(message, systemPrompt);
      return response;
    } catch (error) {
      console.error('AI Chat Error:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  }

  // Market Analysis
  async getMarketAnalysis() {
    try {
      // Simulate market data analysis
      const mockData = {
        marketTrend: this.getRandomTrend(),
        topPerformingAssets: this.getTopAssets(),
        riskLevel: this.getRandomRiskLevel(),
        recommendations: this.getMarketRecommendations(),
        confidence: Math.floor(Math.random() * 30) + 70 // 70-100
      };
      
      return mockData;
    } catch (error) {
      console.error('Market Analysis Error:', error);
      return this.getFallbackMarketData();
    }
  }

  // Predictive Analytics
  async predictProposalSuccess(proposalData, historicalData = []) {
    try {
      const systemPrompt = `You are an expert DAO analyst specializing in proposal success prediction. Provide data-driven insights in JSON format.`;
      
      const prompt = `Predict the success probability of this DAO proposal:

Current Proposal:
- Amount: ${proposalData.amount} CFX
- Description: ${proposalData.description}
- Type: ${proposalData.type || 'Investment'}

Historical Success Rate: ${historicalData.length > 0 ? (historicalData.filter(d => d.success).length / historicalData.length * 100).toFixed(1) : 'No data'}%

Please provide a JSON response with:
{
  "successProbability": number (0-100),
  "keySuccessFactors": ["factor1", "factor2", "factor3"],
  "potentialObstacles": ["obstacle1", "obstacle2", "obstacle3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

      const response = await this.callOpenAI(prompt, systemPrompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Prediction Error:', error);
      return this.getFallbackPrediction(proposalData);
    }
  }

  // Helper Methods
  async callOpenAI(prompt, systemPrompt = null) {
    try {
      console.log('🤖 OpenAI API Call:', {
        apiKey: this.openaiApiKey ? `${this.openaiApiKey.substring(0, 10)}...` : 'NOT SET',
        prompt: prompt.substring(0, 100) + '...',
        systemPrompt: systemPrompt ? systemPrompt.substring(0, 100) + '...' : 'None'
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI API Success:', data.choices[0].message.content.substring(0, 100) + '...');
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      console.log('🔄 Falling back to mock response...');
      // Fallback to mock responses if API fails
      return this.getMockAIResponse(prompt, systemPrompt);
    }
  }

  getMockAIResponse(prompt, systemPrompt) {
    // Mock AI responses for demo
    if (prompt.includes('Risk Assessment')) {
      return {
        riskAssessment: Math.floor(Math.random() * 5) + 3,
        recommendation: ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][Math.floor(Math.random() * 5)],
        keyRisks: ['Market volatility', 'Regulatory changes', 'Technical risks'],
        opportunities: ['High growth potential', 'Diversification benefits', 'Innovation factor'],
        marketContext: 'Current market conditions suggest moderate risk with growth potential',
        confidenceScore: Math.floor(Math.random() * 30) + 70
      };
    }
    
    if (prompt.includes('Score this DAO proposal')) {
      return {
        clarity: Math.floor(Math.random() * 3) + 7,
        feasibility: Math.floor(Math.random() * 3) + 6,
        riskLevel: Math.floor(Math.random() * 4) + 3,
        potentialROI: Math.floor(Math.random() * 3) + 6,
        communityImpact: Math.floor(Math.random() * 3) + 6,
        innovation: Math.floor(Math.random() * 3) + 5,
        overallScore: Math.floor(Math.random() * 20) + 70,
        strengths: ['Clear objectives', 'Detailed implementation plan', 'Community benefit'],
        weaknesses: ['High risk', 'Unclear timeline', 'Limited budget justification'],
        recommendations: ['Add more detail to timeline', 'Include risk mitigation strategies', 'Provide clearer ROI projections']
      };
    }
    
    if (prompt.includes('Success probability')) {
      return {
        successProbability: Math.floor(Math.random() * 40) + 50,
        keySuccessFactors: ['Clear communication', 'Community support', 'Realistic goals'],
        potentialObstacles: ['Low voter turnout', 'Competing proposals', 'Technical issues'],
        recommendations: ['Engage community early', 'Provide detailed documentation', 'Address potential concerns']
      };
    }
    
    if (prompt.includes('voting recommendation')) {
      const recommendations = ['YES', 'NO', 'ABSTAIN'];
      const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
      const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      return {
        recommendation: recommendation,
        confidence: confidence,
        reasoning: `Based on the analysis, this proposal ${recommendation === 'YES' ? 'shows strong potential' : recommendation === 'NO' ? 'has significant concerns' : 'requires more information'}. The overall score and risk assessment suggest ${recommendation === 'YES' ? 'favorable outcomes' : recommendation === 'NO' ? 'potential issues' : 'uncertainty'} for the DAO.`,
        keyFactors: [
          'Clear implementation roadmap',
          'Community impact potential',
          'Budget justification quality'
        ],
        risks: [
          'Market volatility impact',
          'Implementation timeline risks',
          'Technical execution challenges'
        ],
        benefits: [
          'Potential treasury growth',
          'Community engagement boost',
          'Innovation advancement'
        ]
      };
    }
    
    // Chat responses based on message content
    const message = prompt.toLowerCase();
    
    if (message.includes('proposal') || message.includes('create proposal')) {
      return "To create a proposal in our Treasury DAO:\n\n1. Click 'Create Proposal' in the sidebar\n2. Fill in the proposal details (description, amount, destination)\n3. Submit the proposal for review\n4. Once approved, it will be available for voting\n\nProposals require a clear description, reasonable amount, and valid destination address. The AI will analyze your proposal for clarity, feasibility, and risk level.";
    }
    
    if (message.includes('vote') || message.includes('voting')) {
      return "The voting process in our DAO works as follows:\n\n1. Proposals are created and reviewed\n2. Members can vote YES, NO, or ABSTAIN\n3. Voting power is based on your stake in the DAO\n4. Proposals need majority approval to pass\n5. Results are transparent and recorded on-chain\n\nUse the AI analysis feature to get voting recommendations based on proposal details.";
    }
    
    if (message.includes('join') || message.includes('club')) {
      return "To join a club in our Treasury DAO:\n\n1. Go to 'Available Clubs' to see existing clubs\n2. Review club details and requirements\n3. Click 'Join Club' if you meet the criteria\n4. Pay any required membership fees\n5. Start participating in club governance\n\nEach club may have different membership requirements and benefits.";
    }
    
    if (message.includes('risk') || message.includes('risks')) {
      return "Key risks in Treasury DAO operations include:\n\n• Smart contract risks - bugs or vulnerabilities\n• Market volatility - asset value fluctuations\n• Governance risks - poor decision making\n• Liquidity risks - difficulty selling assets\n• Regulatory risks - changing laws\n\nOur AI analysis helps identify and assess these risks for each proposal.";
    }
    
    if (message.includes('ai') || message.includes('analysis')) {
      return "Our AI analysis system provides:\n\n• Proposal scoring (clarity, feasibility, risk, ROI)\n• Investment analysis with risk assessment\n• Market insights and trends\n• Voting recommendations\n• Predictive analytics for success probability\n\nClick 'Analyze This Proposal' on any proposal to see AI-powered insights and recommendations.";
    }
    
    if (message.includes('treasury') || message.includes('funds')) {
      return "The Treasury DAO manages community funds through:\n\n• Decentralized governance by token holders\n• Proposal-based fund allocation\n• AI-powered risk assessment\n• Transparent voting mechanisms\n• Multi-signature security\n\nAll transactions are recorded on-chain for full transparency.";
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help you with:\n\n• Creating and managing proposals\n• Understanding the voting process\n• Joining clubs and communities\n• Risk assessment and analysis\n• Market insights and trends\n• Technical support and guidance\n\nWhat specific topic would you like to know more about?";
    }
    
    // Default response for general questions
    return "I'm here to help you with your Treasury DAO questions. You can ask me about:\n\n• How to create proposals\n• The voting process\n• Joining clubs\n• Risk assessment\n• AI analysis features\n• Treasury management\n\nWhat would you like to know more about?";
  }

  parseAIResponse(response) {
    if (typeof response === 'string') {
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
      } catch (error) {
        console.warn('Failed to parse AI response as JSON:', error);
        // Return a structured response if JSON parsing fails
        return {
          message: response,
          error: 'Failed to parse AI response'
        };
      }
    }
    return response;
  }

  getRandomTrend() {
    const trends = ['Bullish', 'Bearish', 'Sideways', 'Volatile'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  getTopAssets() {
    return [
      { name: 'CFX', change: (Math.random() * 20 - 10).toFixed(2) + '%' },
      { name: 'CFX', change: (Math.random() * 15 - 7.5).toFixed(2) + '%' },
      { name: 'BTC', change: (Math.random() * 10 - 5).toFixed(2) + '%' }
    ];
  }

  getRandomRiskLevel() {
    const levels = ['Low', 'Medium', 'High'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  getMarketRecommendations() {
    return [
      'Consider diversifying your portfolio',
      'Monitor market volatility closely',
      'Focus on long-term value investments'
    ];
  }

  getFallbackAnalysis(proposalData) {
    return {
      riskAssessment: 5,
      recommendation: 'Hold',
      keyRisks: ['Unable to analyze at this time'],
      opportunities: ['Analysis unavailable'],
      marketContext: 'Analysis service temporarily unavailable',
      confidenceScore: 50
    };
  }

  getFallbackScore(proposalData) {
    return {
      clarity: 5,
      feasibility: 5,
      riskLevel: 5,
      potentialROI: 5,
      communityImpact: 5,
      innovation: 5,
      overallScore: 50,
      strengths: ['Analysis unavailable'],
      weaknesses: ['Unable to analyze'],
      recommendations: ['Please try again later']
    };
  }

  getFallbackMarketData() {
    return {
      marketTrend: 'Unknown',
      topPerformingAssets: [],
      riskLevel: 'Unknown',
      recommendations: ['Service temporarily unavailable'],
      confidence: 0
    };
  }

  getFallbackPrediction(proposalData) {
    return {
      successProbability: 50,
      keySuccessFactors: ['Analysis unavailable'],
      potentialObstacles: ['Unable to predict'],
      recommendations: ['Please try again later']
    };
  }
}

export default new AIService();
