# Submission Checklist & Requirements

## Overview

This document outlines everything you need to submit your hackathon project successfully. Follow this checklist to ensure your submission meets all requirements and maximizes your chances of success.

## 📋 Pre-Submission Checklist

### ✅ Project Requirements

- [ ] **Project is functional** - Core features work as demonstrated
- [ ] **Built during hackathon** - Code written within the 4-week period
- [ ] **Uses Conflux features** - Integrates with Conflux network capabilities
- [ ] **Team size compliant** - Up to 5 members per team
- [ ] **Original work** - No plagiarism or unauthorized code reuse

### ✅ Repository Setup

- [ ] **Public GitHub repository** - Accessible to judges and community
- [ ] **Clear repository name** - Descriptive and professional
- [ ] **Complete README.md** - Following the template provided
- [ ] **MIT or Apache 2.0 license** - Open source licensing
- [ ] **Clean commit history** - Meaningful commit messages
- [ ] **Working build** - Code compiles and runs successfully

### ✅ Documentation

- [ ] **Project README** - Complete project documentation
- [ ] **Setup instructions** - Clear installation and running guide
- [ ] **API documentation** - If applicable
- [ ] **Architecture overview** - System design explanation
- [ ] **User guide** - How to use the application
- [ ] **Known issues** - Limitations and future improvements

### ✅ Demo Materials

- [ ] **Demo video** - 3-5 minute project showcase
- [ ] **Live demo link** - Deployed application (if applicable)
- [ ] **Screenshots** - Key features and user interface
- [ ] **Presentation slides** - For finalist presentations
- [ ] **Test data** - Sample data for judges to test with

## 📝 Submission Process

### Step 1: Prepare Your Repository

Ensure your GitHub repository includes all required files and follows best practices:

```
your-project-repo/
├── README.md                 # Project overview and setup
├── LICENSE                   # Open source license
├── package.json             # Dependencies (if applicable)
├── src/                     # Source code
├── docs/                    # Additional documentation
├── demo/                    # Demo materials
│   ├── video.mp4           # Demo video
│   ├── screenshots/        # UI screenshots
│   └── presentation.pdf    # Slides (if applicable)
├── contracts/              # Smart contracts (if applicable)
├── tests/                  # Test files
└── deployment/             # Deployment scripts/configs
```

### Step 2: Add to Projects Folder

1. **Fork the hackathon repository**: [summerhackfest-2025](https://github.com/conflux-fans/summerhackfest-2025)
2. **Navigate to the projects folder**: `/projects/`
3. **Create your project folder**: Use kebab-case naming (e.g., `my-awesome-project`)
4. **Add your project files**: Include README, demo video, and any additional materials
5. **Submit a pull request**: With your project addition

### Step 3: Create Submission Issue

1. **Go to the hackathon repository**: [summerhackfest-2025](https://github.com/conflux-fans/summerhackfest-2025)
2. **Click "Issues"** → **"New Issue"**
3. **Select "Hackathon Submission"** template
4. **Fill out all required fields** completely and accurately
5. **Submit the issue** before the deadline (September 15, 2025 @ 11:59 PM UTC)


## 📄 Required Documentation

### README.md Template

Your project README must include the following sections:

```markdown
# Project Name

## Overview
Brief description of your project and its purpose.

## Hackathon
Code Without Borders - SummerHackfest 2025 (August 18 – September 22, 2025)

## Team
- Team Member 1 (GitHub: @username, Discord: username#1234)
- Team Member 2 (GitHub: @username, Discord: username#1234)
- Team Member 3 (GitHub: @username, Discord: username#1234)
- Team Member 4 (GitHub: @username, Discord: username#1234)
- Team Member 5 (GitHub: @username, Discord: username#1234)

## Problem Statement
What problem does your project solve?

## Solution
How does your project address the problem?

## Conflux Integration
How does your project use Conflux features?
- [ ] Core Space
- [ ] eSpace
- [ ] Cross-Space Bridge
- [ ] Gas Sponsorship
- [ ] Built-in Contracts
- [ ] Partner Integrations (Privy/Pyth/LayerZero)

## Features
- Feature 1
- Feature 2
- Feature 3

## Technology Stack
- Frontend: React, Next.js, etc.
- Backend: Node.js, Python, etc.
- Blockchain: Conflux Core/eSpace
- Smart Contracts: Solidity
- Other: Additional tools and libraries

## Setup Instructions

### Prerequisites
- Node.js v18+
- Git
- Conflux wallet (Fluent, MetaMask)

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/your-project
   cd your-project
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the application
   ```bash
   npm start
   ```

### Testing
```bash
npm test
```

## Usage
Step-by-step guide on how to use your application.

## Demo
- **Live Demo**: [https://your-demo-link.com](https://your-demo-link.com)
- **Demo Video**: [Link to video](https://youtube.com/watch?v=your-video)
- **Screenshots**: See `/demo/screenshots/` folder

## Architecture
High-level overview of your system architecture.

## Smart Contracts
If applicable, list deployed contracts with addresses:
- Contract Name: `0x123...` (Testnet)
- Contract Name: `0x456...` (Mainnet)

## Future Improvements
- Planned feature 1
- Planned feature 2
- Known limitations to address

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Conflux Network
- Partner acknowledgments
- Third-party libraries used
```

### Demo Video Requirements

Your demo video should:
- **Duration**: 3-5 minutes maximum
- **Format**: MP4, MOV, or YouTube/Vimeo link
- **Quality**: 720p minimum, 1080p preferred
- **Audio**: Clear narration explaining the project
- **Content**: Cover all sections below

**Video Structure:**
1. **Introduction** (30 seconds)
   - Team introduction
   - Project name and hackathon
   - Problem statement

2. **Solution Overview** (60 seconds)
   - High-level solution explanation
   - Key features and benefits
   - Conflux integration highlights

3. **Live Demo** (2-3 minutes)
   - User journey walkthrough
   - Key features demonstration
   - Technical highlights

4. **Technical Implementation** (60 seconds)
   - Architecture overview
   - Conflux features used
   - Challenges overcome

5. **Conclusion** (30 seconds)
   - Impact and future plans
   - Call to action



### Presentation
- **Demo Quality**: Professional and engaging demonstration
- **Communication**: Clear explanation of project value
- **Storytelling**: Compelling narrative and vision

## 🚨 Common Submission Mistakes

### Avoid These Issues:
- **Late submission** - Submit well before deadline
- **Broken links** - Test all URLs and demo links
- **Missing demo video** - Required for all submissions
- **Incomplete README** - Follow template completely
- **Non-functional code** - Ensure everything works
- **Missing license** - Include open source license
- **Private repository** - Must be publicly accessible
- **Oversized files** - Use external hosting for large assets

### Best Practices:
- **Test everything** - Verify all links and functionality
- **Get feedback** - Have others review your submission
- **Document thoroughly** - Assume judges are unfamiliar with your project
- **Show, don't tell** - Use screenshots and videos effectively
- **Be professional** - Maintain high quality standards

## 📅 Important Deadlines

### Code Without Borders - SummerHackfest 2025
- **Submission Deadline**: September 15, 2025, 11:59 PM UTC
- **Late Submissions**: Not accepted
- **Judging Period**: September 16-21, 2025
- **Finalist Presentations**: September 22, 2025
- **Winners Announced**: September 29, 2025

## 🆘 Getting Help

### Before Submission
- **Discord**: https://discord.gg/4A2q3xJKjC - Real-time assistance
- **Office Hours** - Weekly live Q&A sessions
- **GitHub Discussions** - Technical questions

### Technical Issues
- **Repository Problems** - GitHub support or Discord
- **Demo Video Issues** - Video hosting recommendations
- **Build Failures** - Technical support channels
- **Integration Questions** - Conflux developer resources

### Last-Minute Support
- **24 hours before deadline** - Extended Discord support
- **Emergency contact** - Contact through Discord or Telegram
- **Status updates** - Follow updates in our Discord community

## 📞 Contact Information

- **Discord**: https://discord.gg/4A2q3xJKjC
- **Telegram**: https://t.me/ConfluxDevs
- **Documentation**: https://doc.confluxnetwork.org/

## 🎯 Success Tips

1. **Start early** - Don't wait until the last minute
2. **Test thoroughly** - Ensure everything works perfectly
3. **Document well** - Clear documentation helps judges understand your project
4. **Show impact** - Demonstrate real-world value and potential
5. **Be authentic** - Let your passion and innovation shine through
6. **Follow guidelines** - Adherence to requirements shows professionalism
7. **Get feedback** - Have others review your submission before submitting

---

**Ready to submit?** Double-check this list and make your mark on the Conflux ecosystem!

*Good luck, and thank you for participating in the Code Without Borders - SummerHackfest 2025!* 