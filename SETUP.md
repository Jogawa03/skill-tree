# Skill Tree - Setup Guide

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run web
```

## Project Structure

```
skill-tree/
├── app/
│   ├── _layout.tsx          # Root navigation layout
│   ├── index.tsx            # Landing screen (Login/Sign Up)
│   ├── home.tsx             # Home screen with skills grid
│   └── skill-tree.tsx       # Interactive skill tree canvas
├── components/
│   ├── TopBar.tsx           # Top navigation bar
│   ├── SkillCard.tsx        # Individual skill card with menu
│   ├── FloatingAddButton.tsx
│   ├── ModalAddSkill.tsx    # Modal to add new skill
│   ├── ModalEditSkill.tsx   # Modal to edit skill
│   ├── Bubble.tsx           # Draggable bubble for sub-skills
│   ├── ConnectionLine.tsx   # Visual connection between bubbles
│   ├── ModalAddSubSkill.tsx # Modal to add sub-skill
│   └── ModalEditSubSkill.tsx # Modal to edit sub-skill
├── store/
│   └── useSkillsStore.ts    # Zustand state management
└── constants/
    └── colors.ts            # App color palette
```

## Color Palette

- Primary: `#424b54` (Dark Gray)
- Accent: `#e1ce7a` (Gold)
- Background: `#ebcfb2` (Cream)
- Secondary: `#c5baaf` (Light Gray)
- Button Background: `#ffffff` (White)

## Features

### Landing Screen

- App title display
- Mock login/sign-up buttons

### Home Screen

- Grid of skill cards
- Each card shows first letter of skill name
- Menu on each card to edit or delete
- Floating + button to add new skills
- Top bar with username and logout

### Skill Tree Canvas

- Large root bubble for main skill
- Add sub-skills by long-pressing canvas
- Edit sub-skills by tapping bubbles
- Create connections by long-pressing and dragging from one bubble to another
- Delete connections by tapping the connection line
- Draggable bubbles with real-time line updates
- Visual warning for disconnected sub-skills (red border)

### Sub-Skill Features

- Name (required)
- Notes (optional)
- Links (optional, multiple)
- Images (optional, multiple via image picker)

## State Management

All data is stored locally using Zustand:

- Skills list
- Skill trees with sub-skills
- Connections between sub-skills
- No backend - ready for database integration later

## Usage

1. Start on landing screen
2. Tap Login or Sign Up to enter
3. Add skills using the + button
4. Tap a skill card to open its skill tree
5. Long-press canvas to add sub-skills
6. Tap sub-skills to edit
7. Long-press sub-skills to create connections
8. Tap connection lines to delete them
9. Drag bubbles to rearrange

## Notes

- All skill buttons are white as specified
- Color palette applied throughout UI
- Clean, commented code
- No unnecessary error handling
- Frontend-only (no API calls)
