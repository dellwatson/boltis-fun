# BOLTIS - Elemental Card Game

[![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=flat&logo=netlify)](https://rococo-palmier-fdfb69.netlify.app)
[![Built with Bolt](https://img.shields.io/badge/Built%20with-Bolt-FF6B35?style=flat)](https://bolt.new)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com)

A modern, real-time elemental card game built with React, TypeScript, and Supabase. Experience strategic gameplay with unique mechanics like void cards, elemental stacking, and dynamic bot AI.

## 🎮 Play Now

**Live Demo:** [https://rococo-palmier-fdfb69.netlify.app](https://rococo-palmier-fdfb69.netlify.app)

[https://boltis.fun](https://boltis.fun)

## 🎯 Game Features

### Core Gameplay
- **Elemental Cards**: Fire, Water, Plant, and Thunder elements with strategic advantages
- **Special Cards**: Skip, Reverse, Stack, and Void cards with unique effects
- **Bot AI**: Three difficulty levels (Easy, Medium, Hard) with intelligent decision-making
- **Real-time Animations**: Smooth card movements and visual effects
- **Multiple Game Modes**: Classic, Time-bank, and Blitz modes

### Unique Mechanics (Proprietary)
- **Void Card Effect**: Revolutionary mechanic where discard pile transfers to opponent
- **Elemental Stack System**: Advanced stacking with elemental weakness interactions
- **Bomb Cards**: Explosive special effects (coming soon)
- **Dynamic Penalties**: Time-based penalty system with customizable rules

### Technical Features
- **Offline Play**: Full gameplay without internet connection
- **Database Integration**: Optional Supabase integration for statistics and leaderboards
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Statistics**: Track wins, losses, and performance metrics
- **Admin Tools**: In-game card management and debugging features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- (Optional) Supabase account for database features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/boltis.git
   cd boltis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

> **Note**: The game works fully offline! Supabase is only needed for user accounts, statistics, and multiplayer features.

### Database Setup (Optional)

Supabase is **optional** and only required for:
- User accounts and authentication
- Match history and statistics
- Leaderboards and rankings
- Multiplayer features (coming soon)

If you want these features:

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Run the migration files in `supabase/migrations/`
4. Add your Supabase URL and anon key to `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 🎲 How to Play

### Basic Rules
1. **Objective**: Be the first to empty your hand or have the lowest score when time runs out
2. **Matching**: Play cards that match the top card's element, type, or number
3. **Special Cards**: 
   - **Skip**: Next player loses their turn
   - **Reverse**: Changes play direction
   - **Stack**: Removes matching elemental cards from discard pile and hand
   - **Void**: Transfers entire discard pile to next player (choose new color)

### Elemental Advantages
- **Fire** beats **Plant**
- **Water** beats **Fire** 
- **Plant** beats **Water**
- **Thunder** beats **Plant**

### Scoring
- Number cards: Face value (1-9 points)
- Special cards: 20 points each
- Void cards: 50 points each
- **Lowest total score wins!**

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
├── services/           # Game engine and external services
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Game logic and utilities
└── hooks/              # Custom React hooks

supabase/
└── migrations/         # Database schema and functions
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand with subscriptions
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Netlify

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Game Engine Architecture

The game uses a sophisticated engine with:
- **GameEngine**: Core game logic and state management
- **TimerService**: Handles turn timers and time banks
- **BotAI**: Intelligent bot decision making
- **MatchService**: Database integration for statistics

## 🎨 Customization

### Adding New Card Types
1. Define the card type in `src/types/game.ts`
2. Add logic in `src/utils/gameLogic.ts`
3. Update the bot AI in `src/utils/botAI.ts`
4. Create visual components in `src/components/`

### Modifying Game Rules
- Edit `src/services/GameEngine.ts` for core mechanics
- Update `src/utils/gameLogic.ts` for card interactions
- Modify `src/types/game.ts` for configuration options

### Styling and Themes
- All styles use Tailwind CSS
- Color schemes defined in `src/types/game.ts`
- Component styling in individual component files

## 📊 Database Schema

The application uses Supabase with the following main tables:
- `profiles`: User profiles and statistics
- `matches`: Game match records
- `match_participants`: Player participation data
- `leaderboards`: Aggregated ranking data
- `feedback`: User feedback and bug reports

## 🌐 Multiplayer Features (Coming Soon)

We're actively developing real-time multiplayer capabilities! Here's what's planned:

### Planned Multiplayer Features
- **Real-time Matches**: Play against friends in real-time
- **Room System**: Create private rooms with custom rules
- **Spectator Mode**: Watch ongoing matches
- **Tournament System**: Organized competitive play
- **Cross-platform Play**: Seamless play across devices

### Technical Implementation
- **WebSocket Integration**: Real-time communication via Supabase Realtime
- **Matchmaking System**: Automatic player matching by skill level
- **Sync Engine**: Ensures game state consistency across clients
- **Reconnection Handling**: Graceful handling of network interruptions

### Multiplayer Documentation
For detailed multiplayer implementation docs, see [MULTIPLAYER.md](docs/MULTIPLAYER.md) (coming soon)

## 🤝 Contributing

We **welcome and encourage** contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or suggesting new game mechanics, your help is appreciated.

### Ways to Contribute

#### 🐛 Bug Fixes
- Report bugs via GitHub Issues
- Submit fixes via Pull Requests
- Help reproduce and verify reported issues

#### ✨ Feature Development
- Implement new card types and effects
- Enhance UI/UX components
- Add new game modes
- Improve bot AI intelligence

#### 💡 Ideas & Suggestions
- Propose new game mechanics
- Suggest UI/UX improvements
- Share balance and gameplay ideas
- Contribute to game design discussions

#### 📚 Documentation
- Improve README and guides
- Add code comments and documentation
- Create tutorials and examples
- Translate documentation

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/boltis.git
   cd boltis
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm run dev    # Test locally
   npm run build  # Ensure it builds
   npm run lint   # Check code style
   ```

5. **Commit and push**
   ```bash
   git commit -m "Add: your amazing feature description"
   git push origin feature/your-amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots for UI changes

### Contribution Guidelines

#### Code Standards
- **TypeScript**: Use proper typing throughout
- **React**: Follow React best practices and hooks patterns
- **Tailwind**: Use utility classes consistently
- **Comments**: Document complex game logic
- **Testing**: Add tests for new game mechanics

#### Game Design Contributions
- **Balance**: Consider impact on game balance
- **Accessibility**: Ensure features work for all players
- **Performance**: Maintain smooth gameplay experience
- **Attribution**: Respect intellectual property requirements

#### Pull Request Process
1. Ensure your PR has a clear description
2. Link to any relevant issues
3. Include screenshots/videos for visual changes
4. Be responsive to feedback and reviews
5. Maintain a clean commit history

## 🏆 Contributors

We recognize and appreciate all contributors to BOLTIS! 

### Core Team
- **[Dale Watson](https://github.com/dalevatson)** - Original Creator & Game Designer
- **[Theras Labs, Inc](https://theras.xyz)** - Company & IP Holder

### Community Contributors
<!-- This section will be automatically updated -->
Thanks to all the amazing people who have contributed to BOLTIS:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- This will be populated as contributors join -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

### How to Get Recognition
When you contribute to BOLTIS, you'll be:
- Added to our contributors list
- Mentioned in release notes
- Credited in the game's about section
- Invited to our contributor Discord channel

*Want to be featured here? Make your first contribution today!*

## 📄 License & Attribution

### Open Source License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Intellectual Property Attribution

**IMPORTANT**: While this codebase is open source, certain game mechanics and concepts are proprietary intellectual property of **Theras Labs, Inc** and **Dale Watson**. 

#### Required Attribution

If you use, modify, or distribute this game, you **MUST** provide visible credit for the following proprietary game mechanics:

#### Proprietary Game Mechanics:
1. **Void Card Effect** - The unique mechanic where playing a void card transfers the entire discard pile to the next player
2. **Elemental Stack System** - Advanced stacking mechanics with elemental weakness interactions  
3. **Bomb Card Effects** - Explosive special card mechanics (when implemented)
4. **Dynamic Penalty System** - Time-based penalty mechanics
5. **Any future community-contributed effects** - As they are added to the game

#### Attribution Requirements:
You must include **visible attribution** in your application that credits:
- **Dale Watson** (Original Creator)
- **Theras Labs, Inc** (Company)

#### Example Attribution Text:
```
Game mechanics including Void Card effects, Elemental Stacking, and other special 
card interactions are proprietary intellectual property of Dale Watson and 
Theras Labs, Inc. Used with permission.
```

#### Where to Include Attribution:
- In your application's About/Credits section
- In the main menu or footer
- In any documentation or promotional materials
- In derivative works or modifications

### Commercial Use
- ✅ **Allowed**: Educational use, personal projects, non-commercial distributions
- ✅ **Allowed**: Commercial use with proper attribution
- ❌ **Not Allowed**: Claiming ownership of proprietary game mechanics
- ❌ **Not Allowed**: Removing or obscuring required attributions

For commercial licensing or questions about intellectual property, contact:
- **Email**: contact@theras.xyz
- **Company**: Theras Labs, Inc

## 🙏 Acknowledgments

### Core Development
- **Dale Watson** - Original creator and game designer
- **Theras Labs, Inc** - Company and intellectual property holder

### Technology Stack
- [React](https://reactjs.org/) - UI framework
- [Supabase](https://supabase.com/) - Backend and database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Bolt](https://bolt.new) - Development platform
- [Netlify](https://netlify.com) - Hosting and deployment

### Community
- Contributors and beta testers
- Open source community feedback
- Game design inspiration from classic card games

## 📞 Support & Contact

### Getting Help
- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Use the in-game feedback system
- 📧 **General Questions**: dale@theraslabs.com
- 💬 **Community**: Join our Discord (coming soon)

### Business Inquiries
For licensing, partnerships, or commercial use:
- **Email**: contact@theras.xyz
- **Company**: Theras Labs, Inc
- **Website**: https://theras.xyz

---

**Made with ❤️ by Dale Watson and Theras Labs, Inc**

*Built with [Bolt](https://bolt.new) • Powered by [Supabase](https://supabase.com) • Deployed on [Netlify](https://netlify.com)*