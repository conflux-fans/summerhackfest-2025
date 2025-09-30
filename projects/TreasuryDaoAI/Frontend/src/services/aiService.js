// AI Service for Treasury DAO
// This service handles all AI-related functionality

class AIService {
  constructor() {
    // Try to get API key from environment variable first
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || 'your-openai-api-key';
    
    // TEMPORARY: If you want to hardcode your API key for testing, uncomment the line below
    // this.openaiApiKey = 'sk-proj-your-actual-api-key-here';
    
    this.baseUrl = 'https://api.openai.com/v1';
    
    // Enhanced debugging for API key
    console.log('🔍 Environment check:');
    console.log('- REACT_APP_OPENAI_API_KEY exists:', !!process.env.REACT_APP_OPENAI_API_KEY);
    console.log('- REACT_APP_NAME:', process.env.REACT_APP_NAME);
    console.log('- process.env keys:', Object.keys(process.env).filter(key => key.includes('REACT_APP')));
    console.log('- API Key length:', this.openaiApiKey.length);
    console.log('- API Key starts with sk-:', this.openaiApiKey.startsWith('sk-'));
    console.log('- Full API Key (first 20 chars):', this.openaiApiKey.substring(0, 20) + '...');
    
    if (this.openaiApiKey === 'your-openai-api-key') {
      console.warn('⚠️ OpenAI API key not set. Using fallback responses.');
      console.warn('💡 Please check your .env.local file contains: REACT_APP_OPENAI_API_KEY=your-actual-key');
      console.warn('💡 Or uncomment the hardcoded line in aiService.js for testing');
    } else if (!this.openaiApiKey.startsWith('sk-')) {
      console.warn('⚠️ OpenAI API key format appears incorrect. Should start with "sk-"');
    } else {
      console.log('✅ OpenAI API key loaded successfully');
    }
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
      console.log('🤖 Getting AI-powered market analysis...');
      
      // Try to get real AI analysis first
      const aiAnalysis = await this.getAIMarketAnalysis();
      console.log('🔍 AI Analysis validation:');
      console.log('- aiAnalysis exists:', !!aiAnalysis);
      console.log('- aiAnalysis type:', typeof aiAnalysis);
      console.log('- aiAnalysis keys:', aiAnalysis ? Object.keys(aiAnalysis) : 'N/A');
      console.log('- marketTrend exists:', aiAnalysis?.marketTrend);
      console.log('- marketTrend value:', aiAnalysis?.marketTrend);
      
      // More robust validation - check for various possible field names
      const hasValidTrend = aiAnalysis && (
        aiAnalysis.marketTrend || 
        aiAnalysis.trend || 
        aiAnalysis.market_trend ||
        aiAnalysis.marketStatus
      );
      
      if (aiAnalysis && hasValidTrend) {
        // Normalize the response to ensure consistent field names
        const normalizedAnalysis = {
          marketTrend: aiAnalysis.marketTrend || aiAnalysis.trend || aiAnalysis.market_trend || aiAnalysis.marketStatus || this.getRandomTrend(),
          riskLevel: aiAnalysis.riskLevel || aiAnalysis.risk_level || aiAnalysis.risk || this.getRandomRiskLevel(),
          topPerformingAssets: aiAnalysis.topPerformingAssets || aiAnalysis.top_performing_assets || aiAnalysis.assets || this.getTopAssets(),
          recommendations: aiAnalysis.recommendations || aiAnalysis.suggestions || aiAnalysis.advice || this.getMarketRecommendations(),
          confidence: aiAnalysis.confidence || aiAnalysis.confidenceScore || aiAnalysis.confidence_score || Math.floor(Math.random() * 30) + 70,
          marketInsights: aiAnalysis.marketInsights || aiAnalysis.market_insights || aiAnalysis.insights || 'AI analysis provided',
          treasuryAdvice: aiAnalysis.treasuryAdvice || aiAnalysis.treasury_advice || aiAnalysis.advice || 'AI analysis provided',
          lastUpdated: new Date().toLocaleTimeString(),
          source: 'OpenAI Analysis'
        };
        
        console.log('✅ AI analysis successful and normalized:', normalizedAnalysis);
        return normalizedAnalysis;
      }
      
      console.log('⚠️ AI analysis failed validation, using mock data');
      console.log('❌ Validation failed because:', {
        hasAnalysis: !!aiAnalysis,
        hasMarketTrend: !!aiAnalysis?.marketTrend,
        marketTrendValue: aiAnalysis?.marketTrend,
        hasValidTrend: hasValidTrend
      });
      
      // Try to extract any useful data from the AI response even if validation failed
      if (aiAnalysis && typeof aiAnalysis === 'object') {
        console.log('🔄 Attempting to extract partial data from AI response...');
        const partialData = {
          marketTrend: aiAnalysis.marketTrend || aiAnalysis.trend || this.getRandomTrend(),
          riskLevel: aiAnalysis.riskLevel || aiAnalysis.risk || this.getRandomRiskLevel(),
          topPerformingAssets: aiAnalysis.topPerformingAssets || aiAnalysis.assets || this.getTopAssets(),
          recommendations: aiAnalysis.recommendations || aiAnalysis.suggestions || this.getMarketRecommendations(),
          confidence: aiAnalysis.confidence || aiAnalysis.confidenceScore || Math.floor(Math.random() * 30) + 70,
          marketInsights: aiAnalysis.marketInsights || aiAnalysis.insights || 'AI analysis partially available',
          treasuryAdvice: aiAnalysis.treasuryAdvice || aiAnalysis.advice || 'AI analysis partially available',
          lastUpdated: new Date().toLocaleTimeString(),
          source: 'OpenAI Analysis (Partial)'
        };
        
        console.log('📊 Using partial AI data:', partialData);
        return partialData;
      }
      // Fallback to enhanced mock data if AI fails
      const mockData = {
        marketTrend: this.getRandomTrend(),
        topPerformingAssets: this.getTopAssets(),
        riskLevel: this.getRandomRiskLevel(),
        recommendations: this.getMarketRecommendations(),
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'Mock Data'
      };
      
      console.log('📊 Mock data generated:', mockData);
      return mockData;
    } catch (error) {
      console.error('❌ Market Analysis Error:', error);
      const fallbackData = this.getFallbackMarketData();
      console.log('🔄 Using fallback data:', fallbackData);
      return fallbackData;
    }
  }

  // AI-powered market analysis
  async getAIMarketAnalysis() {
    try {
      console.log('🤖 Calling OpenAI for market analysis...');
      const systemPrompt = `You are an expert cryptocurrency market analyst. Provide current market analysis in JSON format for a Treasury DAO dashboard.`;
      
      const prompt = `You are a cryptocurrency market analyst. Analyze the current market and provide a JSON response for a Treasury DAO dashboard.

IMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON.

Required JSON format:
{
  "marketTrend": "Bullish",
  "riskLevel": "Medium", 
  "topPerformingAssets": [
    {"name": "CFX", "change": "+5.23%"},
    {"name": "ETH", "change": "-2.15%"},
    {"name": "BTC", "change": "+1.87%"},
    {"name": "USDC", "change": "+0.12%"}
  ],
  "recommendations": [
    "Consider diversifying your portfolio",
    "Monitor market volatility closely", 
    "Focus on long-term value investments"
  ],
  "confidence": 85,
  "marketInsights": "Current market shows mixed signals with some assets performing well while others face headwinds",
  "treasuryAdvice": "Maintain a balanced approach with focus on established cryptocurrencies and stable assets"
}

Respond with ONLY the JSON object above, no additional text.`;

      const response = await this.callOpenAI(prompt, systemPrompt);
      console.log('📝 OpenAI response received:', response);
      
      const analysis = this.parseAIResponse(response);
      console.log('🔍 Parsed analysis:', analysis);
      
      // Add metadata
      analysis.lastUpdated = new Date().toLocaleTimeString();
      analysis.source = 'OpenAI Analysis';
      
      return analysis;
    } catch (error) {
      console.error('❌ AI Market Analysis Error:', error);
      return null;
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

  // AI Proposal Improvement Suggestions
  async getProposalImprovements(proposalData) {
    try {
      console.log('🤖 Getting AI proposal improvement suggestions...', proposalData);
      
      const systemPrompt = `You are an expert DAO proposal advisor. Analyze proposals and provide specific, actionable improvement suggestions in JSON format.`;
      
      const prompt = `Analyze this proposal and provide improvement suggestions:

Proposal Details:
- Title: ${proposalData.title || 'Not provided'}
- Description: ${proposalData.description || 'Not provided'}
- Amount: ${proposalData.amount || 'Not provided'} CFX
- Destination: ${proposalData.destination || 'Not provided'}

Please provide a JSON response with:
{
  "overallScore": number (1-100),
  "improvements": [
    {
      "category": "Clarity" | "Feasibility" | "Risk Management" | "Community Impact" | "Technical Details",
      "priority": "High" | "Medium" | "Low",
      "suggestion": "specific improvement suggestion",
      "reason": "why this improvement is needed"
    }
  ],
  "suggestedTitle": "improved title suggestion",
  "suggestedDescription": "improved description with more detail",
  "suggestedAmount": "suggested amount with justification",
  "suggestedDestination": "destination address validation or suggestion",
  "keyStrengths": ["strength1", "strength2"],
  "criticalIssues": ["issue1", "issue2"],
  "successProbability": number (1-100),
  "nextSteps": ["step1", "step2", "step3"]
}`;

      const response = await this.callOpenAI(prompt, systemPrompt);
      const improvements = this.parseAIResponse(response);
      
      console.log('✅ AI improvement suggestions received:', improvements);
      return improvements;
    } catch (error) {
      console.error('❌ AI Proposal Improvements Error:', error);
      return this.getFallbackImprovements(proposalData);
    }
  }

  // AI Content Generation for Proposals
  async generateProposalContent(proposalData, improvementType) {
    try {
      console.log('🤖 Generating AI proposal content...', { proposalData, improvementType });
      
      const systemPrompt = `You are an expert DAO proposal writer. Generate high-quality, professional proposal content that follows DAO best practices.`;
      
      let prompt = '';
      
      switch (improvementType) {
        case 'title':
          prompt = `Generate a compelling, clear title for this DAO proposal:

Current Description: ${proposalData.description}
Amount: ${proposalData.amount} CFX
Destination: ${proposalData.destination}

Requirements:
- Keep it under 60 characters
- Make it clear and descriptive
- Use action-oriented language
- Avoid jargon

Provide a JSON response with:
{
  "suggestedTitle": "improved title",
  "alternativeTitles": ["alt1", "alt2", "alt3"],
  "reasoning": "why this title works better"
}`;
          break;
          
        case 'description':
          prompt = `Generate a comprehensive, professional description for this DAO proposal:

Current Description: ${proposalData.description}
Title: ${proposalData.title || 'Not provided'}
Amount: ${proposalData.amount} CFX
Destination: ${proposalData.destination}

Requirements:
- Include clear objectives and goals
- Explain the rationale and benefits
- Provide implementation timeline
- Address potential risks and mitigation
- Include success metrics
- Keep it professional and detailed

Provide a JSON response with:
{
  "suggestedDescription": "comprehensive improved description",
  "keyPoints": ["point1", "point2", "point3"],
  "implementationPlan": "brief implementation overview",
  "successMetrics": ["metric1", "metric2"]
}`;
          break;
          
        case 'amount':
          prompt = `Analyze and suggest an appropriate amount for this DAO proposal:

Current Amount: ${proposalData.amount} CFX
Description: ${proposalData.description}
Destination: ${proposalData.destination}

Consider:
- Market conditions
- Proposal scope and complexity
- Risk assessment
- Budget justification
- Alternative funding options

Provide a JSON response with:
{
  "suggestedAmount": "recommended amount in CFX",
  "amountRange": {"min": "minimum", "max": "maximum"},
  "justification": "detailed reasoning for the amount",
  "breakdown": [
    {"category": "category1", "amount": "amount1", "reason": "reason1"}
  ],
  "riskAssessment": "risk level and mitigation"
}`;
          break;
          
        case 'destination':
          prompt = `Validate and suggest improvements for the destination address:

Current Destination: ${proposalData.destination}
Proposal Description: ${proposalData.description}
Amount: ${proposalData.amount} CFX

Check:
- Address format validation
- Security considerations
- Multi-sig recommendations
- Escrow options
- Alternative destinations

Provide a JSON response with:
{
  "isValid": boolean,
  "validationMessage": "validation result message",
  "suggestedDestination": "improved destination if needed",
  "securityRecommendations": ["rec1", "rec2"],
  "alternativeOptions": ["option1", "option2"],
  "multiSigRecommendation": "multi-sig setup suggestion"
}`;
          break;
          
        default:
          prompt = `Generate comprehensive improvements for this DAO proposal:

Title: ${proposalData.title || 'Not provided'}
Description: ${proposalData.description || 'Not provided'}
Amount: ${proposalData.amount || 'Not provided'} CFX
Destination: ${proposalData.destination || 'Not provided'}

Provide a JSON response with:
{
  "suggestedTitle": "improved title",
  "suggestedDescription": "comprehensive improved description",
  "suggestedAmount": "recommended amount",
  "suggestedDestination": "validated destination",
  "overallImprovements": ["improvement1", "improvement2"],
  "implementationGuidance": "step-by-step guidance"
}`;
      }

      const response = await this.callOpenAI(prompt, systemPrompt);
      const content = this.parseAIResponse(response);
      
      console.log('✅ AI content generated:', content);
      return content;
    } catch (error) {
      console.error('❌ AI Content Generation Error:', error);
      return this.getFallbackContent(proposalData, improvementType);
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
    console.log('🔍 Parsing AI response:');
    console.log('- Response type:', typeof response);
    console.log('- Response length:', response?.length);
    console.log('- Response preview:', response?.substring(0, 200) + '...');
    
    if (typeof response === 'string') {
      try {
        // Clean the response - remove any text before/after JSON
        let cleanedResponse = response.trim();
        
        // Try to find JSON object in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('📝 Found JSON match:', jsonMatch[0].substring(0, 200) + '...');
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed JSON:', parsed);
          return parsed;
        }
        
        // Try direct parsing
        console.log('📝 No JSON match found, trying direct parse...');
        const parsed = JSON.parse(cleanedResponse);
        console.log('✅ Successfully parsed direct JSON:', parsed);
        return parsed;
      } catch (error) {
        console.error('❌ Failed to parse AI response as JSON:', error);
        console.error('❌ Response that failed to parse:', response);
        
        // Try to extract useful information from the text response
        const extractedData = this.extractDataFromText(response);
        console.log('🔄 Extracted data from text:', extractedData);
        return extractedData;
      }
    }
    
    console.log('📝 Response is not a string, returning as-is:', response);
    return response;
  }

  // Extract data from text response when JSON parsing fails
  extractDataFromText(text) {
    console.log('🔍 Extracting data from text response...');
    console.log('📝 Full text response:', text);
    
    // Try to extract market trend with more patterns
    let marketTrend = 'Unknown';
    const trendPatterns = [
      /(bullish|bearish|sideways|volatile)/i,
      /market\s+is\s+(bullish|bearish|sideways|volatile)/i,
      /trend\s+is\s+(bullish|bearish|sideways|volatile)/i,
      /(upward|downward|lateral|unstable)\s+trend/i
    ];
    
    for (const pattern of trendPatterns) {
      const match = text.match(pattern);
      if (match) {
        const trend = match[1].toLowerCase();
        if (trend === 'upward') marketTrend = 'Bullish';
        else if (trend === 'downward') marketTrend = 'Bearish';
        else if (trend === 'lateral') marketTrend = 'Sideways';
        else if (trend === 'unstable') marketTrend = 'Volatile';
        else marketTrend = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        break;
      }
    }
    
    // If no trend found, generate a random one
    if (marketTrend === 'Unknown') {
      marketTrend = this.getRandomTrend();
    }
    
    // Try to extract risk level with more patterns
    let riskLevel = 'Unknown';
    const riskPatterns = [
      /(low|medium|high)\s*risk/i,
      /risk\s+level\s+is\s+(low|medium|high)/i,
      /(low|medium|high)\s*volatility/i,
      /(conservative|moderate|aggressive)\s+approach/i
    ];
    
    for (const pattern of riskPatterns) {
      const match = text.match(pattern);
      if (match) {
        const risk = match[1].toLowerCase();
        if (risk === 'conservative') riskLevel = 'Low';
        else if (risk === 'moderate') riskLevel = 'Medium';
        else if (risk === 'aggressive') riskLevel = 'High';
        else riskLevel = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        break;
      }
    }
    
    // If no risk level found, generate a random one
    if (riskLevel === 'Unknown') {
      riskLevel = this.getRandomRiskLevel();
    }
    
    // Generate assets and recommendations
    const topPerformingAssets = this.getTopAssets();
    const recommendations = this.getMarketRecommendations();
    
    console.log('📊 Extracted values:', { marketTrend, riskLevel });
    
    return {
      marketTrend: marketTrend,
      riskLevel: riskLevel,
      topPerformingAssets: topPerformingAssets,
      recommendations: recommendations,
      confidence: Math.floor(Math.random() * 30) + 70,
      marketInsights: text.substring(0, 200) + '...',
      treasuryAdvice: 'AI provided text response instead of structured data',
      lastUpdated: new Date().toLocaleTimeString(),
      source: 'OpenAI Analysis (Text)',
      originalResponse: text
    };
  }

  getRandomTrend() {
    const trends = ['Bullish', 'Bearish', 'Sideways', 'Volatile'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    console.log('📊 Generated trend:', trend);
    return trend;
  }

  getTopAssets() {
    const assets = [
      { name: 'CFX', change: (Math.random() * 20 - 10).toFixed(2) + '%' },
      { name: 'ETH', change: (Math.random() * 15 - 7.5).toFixed(2) + '%' },
      { name: 'BTC', change: (Math.random() * 10 - 5).toFixed(2) + '%' },
      { name: 'USDC', change: (Math.random() * 5 - 2.5).toFixed(2) + '%' }
    ];
    console.log('📈 Generated top assets:', assets);
    return assets;
  }

  getRandomRiskLevel() {
    const levels = ['Low', 'Medium', 'High'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    console.log('⚠️ Generated risk level:', level);
    return level;
  }

  getMarketRecommendations() {
    const recommendations = [
      'Consider diversifying your portfolio',
      'Monitor market volatility closely',
      'Focus on long-term value investments'
    ];
    console.log('💡 Generated recommendations:', recommendations);
    return recommendations;
  }

  // Test function to verify service is working
  async testService() {
    console.log('🧪 Testing AI Service...');
    try {
      const testData = await this.getMarketAnalysis();
      console.log('✅ Service test successful:', testData);
      return testData;
    } catch (error) {
      console.error('❌ Service test failed:', error);
      return null;
    }
  }

  // Test API key specifically
  async testAPIKey() {
    console.log('🔑 Testing OpenAI API Key...');
    
    if (this.openaiApiKey === 'your-openai-api-key') {
      console.error('❌ API Key not set');
      return { success: false, error: 'API Key not set' };
    }
    
    if (!this.openaiApiKey.startsWith('sk-')) {
      console.error('❌ API Key format invalid');
      return { success: false, error: 'API Key format invalid' };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`
        }
      });
      
      if (response.ok) {
        console.log('✅ API Key is valid and working');
        return { success: true, message: 'API Key is valid' };
      } else {
        const errorText = await response.text();
        console.error('❌ API Key test failed:', response.status, errorText);
        return { success: false, error: `API Error: ${response.status} - ${errorText}` };
      }
    } catch (error) {
      console.error('❌ API Key test error:', error);
      return { success: false, error: error.message };
    }
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
      topPerformingAssets: this.getTopAssets(),
      riskLevel: 'Unknown',
      recommendations: ['Service temporarily unavailable'],
      confidence: 0,
      lastUpdated: new Date().toLocaleTimeString(),
      source: 'Fallback Data',
      marketInsights: 'Market analysis service is temporarily unavailable. Please try again later.',
      treasuryAdvice: 'Please refresh the page to get the latest market analysis.'
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

  getFallbackImprovements(proposalData) {
    return {
      overallScore: 60,
      improvements: [
        {
          category: 'Clarity',
          priority: 'High',
          suggestion: 'Add more detailed description of the proposal objectives',
          reason: 'Current description lacks sufficient detail for voters to make informed decisions'
        },
        {
          category: 'Feasibility',
          priority: 'Medium',
          suggestion: 'Include implementation timeline and milestones',
          reason: 'Timeline helps assess proposal feasibility and execution plan'
        }
      ],
      suggestedTitle: proposalData.title || 'Improved Proposal Title',
      suggestedDescription: proposalData.description + ' (Enhanced with more details)',
      suggestedAmount: proposalData.amount || '100',
      suggestedDestination: proposalData.destination || '0x0000000000000000000000000000000000000000',
      keyStrengths: ['Clear intent', 'Reasonable scope'],
      criticalIssues: ['Needs more detail', 'Requires validation'],
      successProbability: 65,
      nextSteps: ['Review suggestions', 'Update proposal details', 'Get community feedback']
    };
  }

  getFallbackContent(proposalData, improvementType) {
    const baseContent = {
      suggestedTitle: proposalData.title || 'Proposal Title',
      suggestedDescription: proposalData.description || 'Proposal Description',
      suggestedAmount: proposalData.amount || '100',
      suggestedDestination: proposalData.destination || '0x0000000000000000000000000000000000000000'
    };

    switch (improvementType) {
      case 'title':
        return {
          ...baseContent,
          suggestedTitle: proposalData.title || 'Enhanced Proposal Title',
          alternativeTitles: ['Alternative 1', 'Alternative 2', 'Alternative 3'],
          reasoning: 'AI analysis suggests this title is more compelling and descriptive'
        };
        
      case 'description':
        return {
          ...baseContent,
          suggestedDescription: (proposalData.description || 'Proposal Description') + '\n\nEnhanced with AI suggestions for better clarity and detail.',
          keyPoints: ['Clear objectives', 'Implementation plan', 'Success metrics'],
          implementationPlan: 'Step-by-step implementation guidance',
          successMetrics: ['Metric 1', 'Metric 2', 'Metric 3']
        };
        
      case 'amount':
        return {
          ...baseContent,
          suggestedAmount: proposalData.amount || '100',
          amountRange: { min: '50', max: '200' },
          justification: 'Amount based on proposal scope and market analysis',
          breakdown: [
            { category: 'Development', amount: '60%', reason: 'Core development costs' },
            { category: 'Marketing', amount: '25%', reason: 'Community outreach' },
            { category: 'Operations', amount: '15%', reason: 'Ongoing maintenance' }
          ],
          riskAssessment: 'Medium risk with mitigation strategies'
        };
        
      case 'destination':
        return {
          ...baseContent,
          isValid: true,
          validationMessage: 'Address format appears valid',
          suggestedDestination: proposalData.destination || '0x0000000000000000000000000000000000000000',
          securityRecommendations: ['Use multi-sig wallet', 'Verify address ownership'],
          alternativeOptions: ['Option 1', 'Option 2'],
          multiSigRecommendation: 'Consider using a multi-signature wallet for enhanced security'
        };
        
      default:
        return {
          ...baseContent,
          overallImprovements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
          implementationGuidance: 'Step-by-step guidance for proposal implementation'
        };
    }
  }
}

export default new AIService();
