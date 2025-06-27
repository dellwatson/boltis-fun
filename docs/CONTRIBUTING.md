# Contributing to BOLTIS

Thank you for your interest in contributing to BOLTIS! This guide will help you get started with contributing to our open-source elemental card game.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Found a bug? Report it via [GitHub Issues](https://github.com/yourusername/boltis/issues)
- Include steps to reproduce, expected behavior, and screenshots
- Check existing issues to avoid duplicates

### ✨ Feature Development
- Implement new card types and game mechanics
- Enhance UI/UX components and animations
- Add new game modes and difficulty levels
- Improve bot AI intelligence and strategies

### 💡 Ideas & Suggestions
- Propose new game mechanics and card effects
- Suggest UI/UX improvements and accessibility features
- Share game balance and strategy ideas
- Contribute to design discussions

### 📚 Documentation
- Improve README and setup guides
- Add code comments and technical documentation
- Create tutorials and gameplay guides
- Help with translations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Code editor (VS Code recommended)
- Basic knowledge of React and TypeScript

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then:
   git clone https://github.com/yourusername/boltis.git
   cd boltis
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173`

### Project Structure
```
src/
├── components/          # React UI components
│   ├── Card.tsx        # Individual card component
│   ├── GameBoard.tsx   # Main game interface
│   ├── PlayerArea.tsx  # Player hand and info
│   └── ...
├── services/           # Core game logic
│   ├── GameEngine.ts   # Main game engine
│   ├── TimerService.ts # Turn timers and time banks
│   └── ...
├── store/              # State management (Zustand)
│   └── gameStore.ts    # Global game state
├── types/              # TypeScript definitions
│   └── game.ts         # Game types and interfaces
├── utils/              # Helper functions
│   ├── gameLogic.ts    # Card rules and validation
│   ├── botAI.ts        # Bot decision making
│   └── ...
└── hooks/              # Custom React hooks
    └── useAuth.ts      # Authentication logic
```

## 🎯 Contribution Guidelines

### Code Standards

#### TypeScript
- Use strict typing throughout the codebase
- Define interfaces for all data structures
- Avoid `any` types - use proper type definitions
- Export types from `src/types/game.ts`

```typescript
// ✅ Good
interface Card {
  id: string;
  element: ElementType;
  type: CardType;
  value?: number;
}

// ❌ Avoid
const card: any = { id: '1', element: 'fire' };
```

#### React Best Practices
- Use functional components with hooks
- Implement proper prop typing
- Use `React.memo()` for performance optimization
- Follow the component composition pattern

```typescript
// ✅ Good
interface CardProps {
  card: Card;
  isPlayable: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, isPlayable, onClick }) => {
  // Component implementation
};
```

#### Styling with Tailwind
- Use utility classes consistently
- Create reusable component patterns
- Follow the design system colors and spacing
- Use responsive design principles

```typescript
// ✅ Good
<div className="bg-white/90 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">

// ❌ Avoid inline styles
<div style={{ backgroundColor: 'white', padding: '16px' }}>
```

### Game Logic Contributions

#### Adding New Card Types
1. **Define the card type** in `src/types/game.ts`:
   ```typescript
   export type CardType = 'number' | 'skip' | 'reverse' | 'stack' | 'void' | 'your-new-type';
   ```

2. **Add game logic** in `src/utils/gameLogic.ts`:
   ```typescript
   export const canPlayCard = (card: Card, topCard: Card): boolean => {
     // Add logic for your new card type
     if (card.type === 'your-new-type') {
       return true; // Your custom logic
     }
     // ... existing logic
   };
   ```

3. **Update bot AI** in `src/utils/botAI.ts`:
   ```typescript
   const getHardMove = (playableCards: Card[], gameState: GameState): Card => {
     // Add AI logic for your new card type
     const newTypeCards = playableCards.filter(card => card.type === 'your-new-type');
     if (newTypeCards.length > 0) {
       // Your AI strategy
     }
     // ... existing logic
   };
   ```

4. **Create visual component** in `src/components/Card.tsx`:
   ```typescript
   const getCardIcon = () => {
     switch (card.type) {
       case 'your-new-type':
         return <YourIcon className={iconSize} />;
       // ... existing cases
     }
   };
   ```

#### Game Balance Considerations
- Test new mechanics thoroughly
- Consider impact on existing strategies
- Ensure accessibility for all skill levels
- Document the intended behavior clearly

### Testing Your Changes

#### Manual Testing
```bash
# Start the development server
npm run dev

# Test your changes in the browser
# Play several games to verify functionality
# Test with different game modes and settings
```

#### Code Quality
```bash
# Run linting
npm run lint

# Build the project
npm run build

# Check TypeScript compilation
npx tsc --noEmit
```

#### Testing Checklist
- [ ] Game starts and ends correctly
- [ ] Cards play according to rules
- [ ] Bot AI behaves appropriately
- [ ] UI is responsive and accessible
- [ ] No console errors or warnings
- [ ] Performance is maintained

## 📝 Pull Request Process

### Before Submitting
1. **Test thoroughly** - Ensure your changes work as expected
2. **Follow code style** - Use existing patterns and conventions
3. **Update documentation** - Add comments and update README if needed
4. **Check for conflicts** - Rebase on latest main branch

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Verified game balance

## Screenshots
(If applicable, add screenshots or videos)

## Related Issues
Fixes #(issue number)
```

### Review Process
1. **Automated checks** - Ensure all CI checks pass
2. **Code review** - Maintainers will review your code
3. **Testing** - Changes will be tested in various scenarios
4. **Feedback** - Address any requested changes
5. **Merge** - Approved PRs will be merged

## 🎮 Game Design Contributions

### Proposing New Mechanics
When suggesting new game mechanics:

1. **Create a detailed proposal** including:
   - Mechanic description and rules
   - Strategic implications
   - Balance considerations
   - Implementation complexity

2. **Consider existing mechanics**:
   - How does it interact with current cards?
   - Does it maintain game balance?
   - Is it intuitive for new players?

3. **Prototype if possible**:
   - Create a simple implementation
   - Test with friends or community
   - Gather feedback and iterate

### Intellectual Property
Remember that certain game mechanics are proprietary to Theras Labs, Inc:
- Void card effects
- Elemental stacking system
- Bomb card mechanics
- Dynamic penalty system

New community-contributed mechanics will be credited to their creators while maintaining the open-source nature of the project.

## 🏆 Recognition

### Contributor Benefits
- **GitHub Recognition**: Listed in our contributors section
- **In-Game Credits**: Featured in the game's about section
- **Release Notes**: Mentioned in version release notes
- **Community Access**: Invited to contributor Discord channel
- **Early Access**: Preview new features before public release

### Contribution Levels
- **First-time Contributor**: Welcome package and recognition
- **Regular Contributor**: Special badge and priority review
- **Core Contributor**: Direct collaboration on major features
- **Maintainer**: Trusted with repository access and decisions

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Real-time chat with developers and community
- **Email**: dale@theraslabs.com for direct contact

### Development Questions
- **Code Issues**: Create GitHub issues with `question` label
- **Game Design**: Use `game-design` label for mechanic discussions
- **Technical Help**: Tag maintainers in your PR or issue

### Mentorship
New contributors can request mentorship:
- Pair programming sessions
- Code review guidance
- Game design consultation
- Career advice in game development

## 📋 Issue Labels

Understanding our label system:

- `bug` - Something isn't working correctly
- `enhancement` - New feature or improvement
- `good first issue` - Perfect for newcomers
- `help wanted` - Community assistance needed
- `game-design` - Game mechanics and balance
- `ui/ux` - User interface and experience
- `performance` - Optimization and speed
- `documentation` - Docs and guides
- `multiplayer` - Real-time multiplayer features

## 🎯 Current Priorities

### High Priority
- [ ] Multiplayer implementation
- [ ] Mobile responsiveness improvements
- [ ] Accessibility enhancements
- [ ] Performance optimizations

### Medium Priority
- [ ] New card types and mechanics
- [ ] Advanced bot AI strategies
- [ ] Tournament system
- [ ] Replay system

### Low Priority
- [ ] Visual effects and animations
- [ ] Sound effects and music
- [ ] Themes and customization
- [ ] Statistics and analytics

## 📜 Code of Conduct

### Our Standards
- **Be respectful** - Treat all community members with kindness
- **Be inclusive** - Welcome people of all backgrounds and skill levels
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Remember that everyone is learning

### Unacceptable Behavior
- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

### Enforcement
Community leaders will enforce these standards fairly and consistently. Violations may result in temporary or permanent bans from the project.

## 🙏 Thank You

Thank you for contributing to BOLTIS! Your efforts help make this game better for everyone. Whether you're fixing a small bug or implementing a major feature, every contribution is valued and appreciated.

Together, we're building something amazing! 🎮✨

---

*This contributing guide is a living document. Please suggest improvements via GitHub issues or pull requests.*