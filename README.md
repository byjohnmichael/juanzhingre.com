# 🖥️ Interactive Desktop Website

A fully interactive desktop interface built with React and TypeScript that mimics a real desktop experience with clickable icons, draggable windows, and even games!

## ✨ Features

### 🎯 Desktop Interface
- **Interactive Icons**: Click on any desktop icon to open applications or folders
- **Draggable Windows**: Click and drag window title bars to move them around
- **Resizable Windows**: Drag the bottom-right corner to resize windows
- **Window Controls**: Minimize, maximize, and close windows just like a real OS
- **Z-Index Management**: Windows automatically come to front when clicked

### 🎮 Built-in Game
- **Icon Collector**: A simple but fun game where you control a green circle to collect red targets
- **Controls**: Use WASD or Arrow Keys to move
- **Scoring**: Collect targets to increase your score
- **Reset**: Click the reset button to start over

### 🎨 Visual Design
- **Warm Background**: Orange-yellow gradient background inspired by your desktop
- **Modern UI**: Clean, rounded corners and smooth animations
- **Responsive Icons**: Hover effects and smooth transitions
- **Professional Windows**: Windows XP-style interface with modern touches

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd desktop-website
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open your browser and go to `http://localhost:3000`

## 🎯 How to Use

### Desktop Icons
- **Left Side**: Apple Music, Spotify, Videos, Misc
- **Right Side**: My Shop, HW HQ, Games, Trash
- **Click any icon** to open its corresponding window

### Window Management
- **Move**: Click and drag the title bar
- **Resize**: Drag the bottom-right corner
- **Minimize**: Click the yellow button (−)
- **Maximize**: Click the green button (□)
- **Close**: Click the red button (×)
- **Focus**: Click anywhere on a window to bring it to front

### Playing the Game
1. Click the **Games** icon (🎮) on the right side
2. Use **WASD** or **Arrow Keys** to move the green circle
3. Collect the red targets to score points
4. Click **Reset Game** to start over

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Smooth animations (ready for future use)

### Project Structure
```
src/
├── components/
│   ├── Desktop/     # Main desktop component
│   ├── Icon/        # Desktop icon component
│   └── Window/      # Window component + game
├── types/           # TypeScript interfaces
└── hooks/           # Custom React hooks
```

### Key Components
- **Desktop**: Main container managing state and layout
- **Icon**: Clickable desktop icons with hover effects
- **Window**: Draggable, resizable windows with controls
- **SimpleGame**: Built-in game component

## 🎨 Customization

### Adding New Icons
Edit the `icons` array in `Desktop.tsx`:
```typescript
{
  id: 'new-app',
  name: 'New App',
  type: 'app',
  position: { x: 100, y: 100 },
  icon: '🚀',
  color: '#FF6B6B'
}
```

### Adding New Games
1. Create a new game component in `Window/`
2. Import it in `Desktop.tsx`
3. Add game logic to `handleIconClick`

### Changing Colors
Modify the styled components in each component file to change colors, sizes, and styling.

## 🚧 Future Enhancements

- [ ] **More Games**: Snake, Tetris, Pong, etc.
- [ ] **File System**: Drag and drop files between folders
- [ ] **Context Menus**: Right-click functionality
- [ ] **Sound Effects**: Audio feedback for interactions
- [ ] **Themes**: Multiple desktop themes
- [ ] **Save States**: Remember window positions and game progress
- [ ] **Multiplayer**: Online multiplayer games

## 🤝 Contributing

Feel free to:
- Add new games
- Improve the UI/UX
- Add new features
- Fix bugs
- Optimize performance

## 📝 License

This project is open source and available under the MIT License.

---

**Enjoy your interactive desktop experience! 🎉**
