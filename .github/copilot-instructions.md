# Lucho Party Game - AI Agent Instructions

## Project Overview
This is a party game app where players perform theatrical scenes with improvised directing styles. The game involves actors, directors, and viewers rating performances in a competitive league format.

## Critical: Design-Code Sync

**ALWAYS keep `design/ux-flow.html` and the actual app screens in sync.**

When you modify:
- **App screens** → Update the corresponding UX frame in `design/ux-flow.html`
- **UX frames in design/ux-flow.html** → Apply those changes to the actual app screens

### Specific Requirements:
1. **Styling**: Colors, fonts, spacing, borders must match exactly
2. **Layout**: Component positioning and hierarchy must be identical
3. **Content**: Button labels, headers, descriptions must be consistent
4. **Theming**: The warm theatrical gold/brown theme (#D4A574, #C9A875, #1a0f0a) applies everywhere

### Where to Find Things:
- **Design documentation**: `design/ux-flow.html` (13 detailed UX frames)
- **App implementation**: (TBD - will be added as screens are built)
- **Flow logic**: Documented in `design/game-flow.md`

## Design System

### Color Palette
- **Background**: `#1a0f0a` (dark brown) to `#2d1810` (warm brown)
- **Primary Gold**: `#D4A574` (headers, buttons, accents)
- **Secondary Gold**: `#C9A875` (text, borders)
- **Text**: `#F5E6D3` (cream/beige)
- **Borders**: `#8B7355` (bronze)
- **Card backgrounds**: `rgba(45, 24, 16, 0.6)`

### Typography
- **Headers**: Georgia, 'Times New Roman', serif - use for titles and important text
- **Body**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Button text**: Bold, system fonts

### Components
- **Buttons**: Gold gradient primary (`#D4A574` to `#C9A875`), bronze outline secondary
- **Phone frames**: 320px × 580px, bronze border (`#8B7355`), rounded 30px
- **Cards**: Semi-transparent brown, 12px border-radius

## Game Flow Architecture

### Session Management
1. QR code-based joining (persistent throughout game)
2. Dynamic player roster with real-time sync
3. Host controls game start

### Round Flow
1. Random actor selection → Scene choice
2. Random director selection → Style choice
3. Pre-round sync screen (wait for START)
4. 5-minute performance timer
5. Viewer ratings (1-5 stars + tags)
6. League standings with -5% score decay per round
7. Continue/end vote

### Key Features
- **Score decay**: -5% per round to prevent runaway leads
- **Tags**: Pre-selected emotional tags (😂 Hilarious, 🔥 Intense, etc.)
- **League format**: Cumulative scores with decay mechanic
- **Role-specific screens**: Different views for actor/director/viewers during performance

## Development Workflow

### Before Making Changes
1. Check `design/ux-flow.html` for current design state
2. Review `design/game-flow.md` for interaction logic
3. Understand which player role sees which screen

### After Making Changes
1. Update both design docs AND app code
2. Test responsive behavior (320px phone width)
3. Verify warm theatrical theme is maintained
4. Commit with descriptive message linking design to code changes

## Common Pitfalls to Avoid
- ❌ Don't use blue/cold colors (this isn't a tech app, it's theatrical)
- ❌ Don't forget the -5% decay mechanic in score calculations
- ❌ Don't make actor/director/viewer screens identical (they see different info)
- ❌ Don't skip updating design docs when changing app screens
- ❌ Don't use uppercase transforms on headers (removed for elegance)

## Questions to Ask Before Implementing
1. Which player role(s) see this screen?
2. Does this match the corresponding UX frame in design/ux-flow.html?
3. Is the warm gold/brown theatrical theme maintained?
4. Have I updated both the design doc and the code?
