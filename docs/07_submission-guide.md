# Code Without Borders - SummerHackfest 2025: Detailed Submission Guide

## 🚀 Step-by-Step Submission Process

### 1. Prepare Your Submission Materials

Before submitting your project, ensure you have all required materials ready:

| Material | Description | Requirements |
|----------|-------------|--------------|
| **GitHub Repository** | Link to your project repository | Must be public with complete code and documentation |
| **Demo Video** | A demonstration of your project | Max 5 minutes, showcasing core functionality |
| **Project Logo** | Visual representation of your project | 1:1 ratio, minimum 500x500 pixels, PNG/JPG format |
| **Live Demo URL** | Deployed application link | Must be accessible and functional |
| **Project Documentation** | Comprehensive README and docs | Using provided template, setup instructions included |
| **Pitch Deck** | Project presentation slides | Optional but recommended, PDF or Google Slides |

### 2. Complete Your Project Repository

Your GitHub repository must include:

#### Required Files
- **README.md** - Using our [project template](../templates/project_readme.md)
- **LICENSE** - Open source license (MIT, Apache 2.0, etc.)
- **CONTRIBUTING.md** - How others can contribute
- **package.json** or equivalent dependency file
- **Deployment instructions** - Clear setup and deployment guide

#### Code Requirements
- All source code for your project
- Smart contracts deployed to Conflux testnet/mainnet
- Frontend application (if applicable)
- Backend services (if applicable)
- Tests and documentation

#### Documentation Standards
- Clear project description and objectives
- Architecture overview and technical decisions
- Setup and installation instructions
- Usage examples and API documentation
- Conflux integration details
- Partner technology usage (Privy, Pyth, LayerZero)

### 3. Deploy Your Project

#### Conflux Network Deployment
Your project must be deployed to one of:
- **Conflux Core Space** (mainnet or testnet)
- **Conflux eSpace** (mainnet or testnet)
- **Cross-Space** integration

#### Deployment Verification
- Provide contract addresses and transaction hashes
- Include network configuration details
- Ensure all functionality is accessible
- Test all user flows and integrations

### 4. Add to Projects Folder

#### Fork and Clone Repository
1. **Fork the repository**: [summerhackfest-2025](https://github.com/conflux-fans/summerhackfest-2025)
2. **Clone your fork**: `git clone https://github.com/your-username/summerhackfest-2025`
3. **Navigate to projects folder**: `cd summerhackfest-2025/projects/`

#### Create Your Project Folder
1. **Create project folder**: Use kebab-case naming (e.g., `my-awesome-project`)
2. **Add project files**:
   ```
   projects/my-awesome-project/
   ├── README.md              # Project documentation
   ├── demo-video.mp4         # Demo video file
   ├── screenshots/           # UI screenshots
   │   ├── homepage.png
   │   └── features.png
   ├── presentation.pdf       # Pitch deck (optional)
   └── links.md              # External links (repo, demo, etc.)
   ```

#### Submit Pull Request
1. **Commit your changes**: `git add . && git commit -m "Add [project-name] to hackathon"`
2. **Push to your fork**: `git push origin main`
3. **Create pull request**: Submit PR to the main repository
4. **Wait for review**: Organizers will review and merge your submission

### 5. Create Submission Issue

1. **Go to the hackathon repository**: [summerhackfest-2025](https://github.com/conflux-fans/summerhackfest-2025)
2. **Click "Issues"** → **"New Issue"**
3. **Select "Hackathon Submission"** template
4. **Fill out all required fields** completely and accurately
5. **Submit the issue** before the deadline (September 15, 2025 @ 11:59 PM UTC)

#### Submission Template Fields

```markdown
## Project Information
- **Project Name**: [Your project name]
- **Hackathon**: Code Without Borders - SummerHackfest 2025
- **Team Members**: [List all team members with GitHub usernames - up to 5]
- **Project Description**: [Brief 2-3 sentence description]

## Links and Resources
- **GitHub Repository**: [Public repository URL]
- **Projects Folder**: [Link to your folder in /projects/]
- **Live Demo**: [Deployed application URL]
- **Demo Video**: [YouTube/Vimeo link or file in projects folder]
- **Pitch Deck**: [Google Slides or PDF link]
- **Project Website**: [If applicable]

## Technical Details
- **Conflux Network**: [Core Space / eSpace / Cross-Space]
- **Contract Addresses**: [List deployed contract addresses]
- **Partner Integrations**: [Privy / Pyth / LayerZero usage]
- **Tech Stack**: [Languages, frameworks, tools used]

## Innovation Areas
Which areas does your project focus on? (Check all that apply)
- [ ] AI + Blockchain Integration
- [ ] Developer Experience & Tooling
- [ ] DeFi Innovation
- [ ] Real-World Applications
- [ ] Cross-Chain Solutions
- [ ] Gaming & Entertainment
- [ ] Other: [Specify]

## Submission Checklist
- [ ] Project deployed to Conflux network
- [ ] GitHub repository is public and complete
- [ ] Added to /projects/ folder with PR submitted
- [ ] README follows provided template
- [ ] Demo video uploaded (max 5 minutes)
- [ ] All team members listed (up to 5)
- [ ] Code includes proper documentation
- [ ] License file included
- [ ] Project integrates meaningfully with Conflux
```

### 6. Create Your Demo Video

#### Video Requirements
- **Duration**: 3-5 minutes maximum
- **Format**: MP4, MOV, or YouTube/Vimeo link
- **Quality**: Minimum 720p resolution
- **Audio**: Clear narration explaining the project

#### Content Structure
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

## 📋 Submission Checklist

### Before Submitting
- [ ] Project is fully functional and deployed
- [ ] All code is committed to public GitHub repository
- [ ] Added project to appropriate /projects/ folder
- [ ] README.md follows the provided template
- [ ] Demo video is complete and under 5 minutes
- [ ] All team members are listed in submission
- [ ] Project integrates with Conflux network
- [ ] Partner technologies are properly implemented
- [ ] License file is included in repository
- [ ] Documentation is comprehensive and clear

### Technical Requirements
- [ ] Smart contracts deployed to Conflux testnet or mainnet
- [ ] Frontend application is accessible via provided URL
- [ ] All dependencies are properly documented
- [ ] Setup instructions are clear and complete
- [ ] Project demonstrates meaningful Conflux integration
- [ ] Code follows best practices and is well-commented

### Submission Materials
- [ ] GitHub repository URL provided
- [ ] Project added to /projects/ folder
- [ ] Demo video uploaded and accessible
- [ ] Live demo URL is functional
- [ ] Project logo meets size requirements
- [ ] Pitch deck uploaded (if applicable)
- [ ] All required fields in submission template completed

## ❓ Frequently Asked Questions

### General Submission Questions

**Q: Should each team member submit individually, or should one person submit for the entire team?**
A: One team member (preferably the team lead) should submit for the entire team. Make sure all team members are listed in the submission.

**Q: Can I keep my GitHub repository private?**
A: No, all repositories must be public for judging. If you have concerns about intellectual property, consider using an appropriate open source license.

### Technical Questions

**Q: Do we need to deploy to Conflux mainnet?**
A: Projects can be deployed to either Conflux testnet or mainnet. Testnet deployment is acceptable for judging.

**Q: What if our project uses multiple Conflux spaces?**
A: Cross-space projects are encouraged! Clearly document your architecture and provide deployment details for all spaces used.

**Q: Can we use external APIs and services?**
A: Yes, but your project must have meaningful integration with the Conflux network. External services should enhance, not replace, Conflux functionality.

**Q: What programming languages are allowed?**
A: Any language is acceptable, but projects must integrate with Conflux. Popular choices include Solidity for smart contracts and JavaScript/TypeScript for frontends.

### Submission Process Questions

**Q: Can I edit my submission after submitting?**
A: Yes, you can edit your GitHub issue submission until the deadline. However, your repository should reflect the final state of your project.

**Q: What if I miss the submission deadline?**
A: Late submissions will not be accepted. Ensure you submit well before the deadline to account for any technical issues.

**Q: Can I continue working on my project after submission?**
A: Yes! We encourage continued development. However, only work completed before the submission deadline will be considered for judging.

### Judging and Evaluation

**Q: What are the judging criteria?**
A: Projects are evaluated on technical implementation, Conflux integration, innovation, user experience, and presentation quality. See our [judging criteria](./04_judging_criteria.md) for details.

**Q: When will winners be announced?**
A: Winners will be announced within one week of the submission deadline. All participants will be notified via Discord and social media.

**Q: What if a team member drops out before submission?**
A: Update your submission to reflect the current team composition. Ensure the remaining team members can complete and present the project.

## 🆘 Getting Help

### Technical Support
- **Discord**: https://discord.gg/4A2q3xJKjC - Real-time help and support
- **GitHub Discussions**: Post detailed technical questions
- **Office Hours**: Weekly live sessions with Conflux engineers
- **Mentor Program**: Schedule 1-on-1 sessions with mentors

### Submission Support
- **Discord**: https://discord.gg/4A2q3xJKjC
- **Telegram**: https://t.me/ConfluxDevs
- **Documentation**: https://doc.confluxnetwork.org/

### Emergency Contact
For urgent issues during submission:
- **Discord**: @organizers or @moderators
- **Telegram**: https://t.me/ConfluxDevs

---

**Need help with your submission? Don't hesitate to reach out to our team through Discord or Telegram. We're here to ensure every team can successfully submit their project!**
