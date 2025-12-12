# Studio Lucho - Party Game

🎭 **A theatrical party game where players perform scenes with improvised directing styles**

## 🌐 Live Demo

- **Play the Game**: [jav.github.io/lucho-party-game/app](https://jav.github.io/lucho-party-game/app/)
- **View Design Docs**: [jav.github.io/lucho-party-game/design](https://jav.github.io/lucho-party-game/design/)
- **Home**: [jav.github.io/lucho-party-game](https://jav.github.io/lucho-party-game/)

## 📁 Project Structure

```
/
├── design/               # UX documentation and design files
│   └── ux-flow.html     # Complete UX flow with 13 screens
├── expoFrontend/        # Expo React Native source code
│   ├── App.tsx          # Main application (14 screens)
│   ├── app.json         # Expo configuration
│   ├── package.json     # Dependencies
│   └── ...              # Other source files
├── app/                 # Built web app (gitignored on main, tracked on gh-pages)
│   ├── index.html
│   ├── metadata.json
│   └── _expo/
└── README.md
```

## 🚀 Development

### Prerequisites
- Node.js and npm
- Expo CLI

### Setup

```bash
# Navigate to frontend directory
cd expoFrontend

# Install dependencies
npm install

# Start development server
npx expo start --web --port 8082
```

### Building for Production

```bash
cd expoFrontend
npx expo export -p web
```

The built files will be in `expoFrontend/dist/`. Copy these to the root `app/` directory for deployment.

## 🎨 Design System

- **Theme**: Warm theatrical gold/brown
- **Primary**: `#D4A574` (gold)
- **Background**: `#1a0f0a` → `#2d1810` (gradient)
- **Text**: `#F5E6D3` (cream)
- **Borders**: `#8B7355` (bronze)

## 🎮 Game Flow

1. **Join Session** - Scan QR or enter game name
2. **Lobby** - Wait for players
3. **Actor Selection** - Choose scene
4. **Director Selection** - Pick directing style  
5. **Performance** - 5-minute timer
6. **Rating** - Stars and emotion tags
7. **League Scores** - With 5% decay per round

## 📦 Deployment

The **gh-pages** branch serves the live site:
- Root: Directory listing
- `/app/`: Built Expo web app
- `/design/`: UX documentation

To deploy changes:
1. Build in `expoFrontend/`
2. Copy `dist/*` to `app/`
3. Switch to `gh-pages` branch
4. Copy from main: `git checkout main -- app`
5. Commit and push

## 🔧 Tech Stack

- **Expo SDK 54** with TypeScript
- **React 19.1.0** / React Native 0.81.5
- **react-native-web** for web support
- **react-native-qrcode-svg** for QR codes
- Simple state management (useState)

## 📝 License

[Add your license here]
