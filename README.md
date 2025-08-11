# ClarityCV

Transform your resume for ATS success. A privacy-first, client-side resume converter that processes everything in your browser without server communication.

## Technology Stack

- **Next.js 15** - React framework with App Router and TypeScript
- **Tailwind CSS v4** - Utility-first CSS framework 
- **Shadcn UI** - Beautiful and accessible component library
- **TypeScript** - Type-safe JavaScript
- **React 19** - Latest React with modern features

## Features

### 🎨 **User Interface**
- 🌙 Dark mode enabled by default
- 🎨 8 beautiful color themes (Stone, Blue, Green, Purple, Red, Orange, Teal, Rose)
- 🎯 Interactive theme switcher with live preview (in Settings ⚙️)
- 📱 Fully responsive design
- ♿ Accessible components
- 🎨 Modern UI with Shadcn components
- 💾 Theme persistence with localStorage

### 📄 **Document Processing** ✨ NEW
- 📁 **Universal File Support**: PDF and DOCX resume parsing
- 🤖 **ATS Optimization Engine**: 250+ optimization rules following industry standards
- 🔍 **Section Detection**: Intelligent recognition and standardization of 12 resume sections
- 🎯 **Format Cleaning**: Remove ATS-incompatible elements (graphics, tables, special formatting)
- 📊 **Real-Time Processing**: Progress tracking with detailed optimization feedback
- 💾 **Multiple Downloads**: Plain text (.txt) and Word-ready formatted outputs

### 🔒 **Privacy & Security**
- 🔐 **100% Client-Side**: No server uploads, all processing in your browser
- 🚫 **No Data Storage**: Your resume never leaves your device
- 🛡️ **No Tracking**: Zero analytics or personal data collection
- ⚡ **Instant Processing**: Sub-3-second optimization for most resumes

### 🛠️ **Technical**
- ⚡ Fast development with hot reload
- 🔧 TypeScript for complete type safety
- 📦 Static export ready for deployment anywhere
- 🌐 Next.js 15 with App Router
- 🎨 Tailwind CSS v4 for modern styling

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles and theme
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   ├── Header.tsx     # App header
│   ├── Footer.tsx     # App footer
│   └── FeatureCard.tsx # Feature card component
└── lib/
    └── utils.ts       # Utility functions
```

## Customization

### Adding New Components

Add new Shadcn UI components:
```bash
npx shadcn@latest add [component-name]
```

### Theme System

The application includes 8 carefully crafted color themes:

- **Stone** (Default) - Neutral gray theme
- **Blue** - Cool blue tones
- **Green** - Nature-inspired greens
- **Purple** - Rich purple palette
- **Red** - Bold red accents
- **Orange** - Warm orange hues
- **Teal** - Calming teal shades
- **Rose** - Elegant rose tones

#### Theme Configuration

Themes are configured in:
- `src/styles/themes.css` - All theme color definitions
- `src/components/ThemeProvider.tsx` - Theme context and logic
- `src/components/SettingsDropdown.tsx` - Settings menu with theme selection
- `src/app/globals.css` - Base theme imports

#### Adding Custom Themes

1. Add your theme colors to `src/styles/themes.css`
2. Update the themes array in `src/components/ThemeProvider.tsx`
3. Follow the existing OKLCH color format for consistency

### CSS Variables

Each theme defines these key variables:
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--muted` / `--muted-foreground`
- `--accent` / `--accent-foreground`
- `--destructive` / `--border` / `--input` / `--ring`

## Ready for Development

The application is ready for custom feature development. Share your PRD.md to implement specific requirements.