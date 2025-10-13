# Expo Changelog Viewer

A web application to view and compare changelogs for Expo SDK modules. Built with shadcn/ui, and Tailwind CSS.

## Features

- **Static SDK Versions**: Pre-configured SDK versions (SDK 40-54 + main branch) for reliable, instant loading
- **IndexedDB Caching**: Fast changelog caching with automatic cache invalidation and status indicators
- **Dependency Tree Analysis**: Automatically traces dependency updates for "no user-facing changes" versions to find root causes
- **NPM Package Integration**: Fetches and compares package.json dependencies from npm registry
- **Module Selection**: Browse and select from 60+ Expo modules organized by category
- **Version Filtering**: Limit versions displayed per module (latest only, last 3, 5, 10, or all)
- **Smart UI**: Collapsible sections with shadcn/ui components and CVA variants
- **Search & Filter**: Real-time module search and category filtering
- **Mark as Viewed**: Track which changelogs you've reviewed with visual indicators (auto-clears on "Fetch Fresh")
- **Bulk Actions**: Select all, clear all, mark all as viewed/unviewed
- **LocalStorage Persistence**: Saves all selections, preferences, viewed state, and last visited timestamps
- **Export**: Download changelogs as markdown
- **Light/Dark/Auto Theme**: Follows system preference or manual toggle
- **Enhanced Loading UX**: Rotating funny messages + current module display during load
- **Error Handling**: User-friendly error messages and fallback states
- **External Links**: All links open in new tabs
- **Code Quality**: ESLint 9, Prettier, and Lefthook pre-commit hooks

## Live Demo

Visit: [https://changelogviewer.dev](https://changelogviewer.dev)

## Local Development

### Prerequisites

- Node.js 20+
- yarn

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Usage

1. **Select SDK Version**: Choose from static SDK versions (SDK 40-54 + main)
2. **Set Version Limit**: Control how many versions to display
3. **Choose Modules**: Search, filter by category, or select all
4. **Load Changelogs**: Click the load button
5. **Browse**: Expand/collapse changelogs, mark as viewed
6. **Export**: Save to markdown file

## Technology Stack

- **React 19.2** - Latest React with concurrent features
- **TypeScript 5.9** - Type safety
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first styling with Vite plugin
- **shadcn/ui** - Component library
- **Radix UI** - Headless accessible components
- **react-markdown** - Markdown rendering with GFM support
- **remark-gfm** - GitHub Flavored Markdown
- **rehype-raw** - Raw HTML support in markdown
- **react-complex-tree** - Interactive tree visualization for dependency chains
- **class-variance-authority** - Component variant styling
- **lucide-react** - Icon library
- **ESLint 9** - Code linting
- **Prettier** - Code formatting
- **Lefthook** - Git hooks management

## Project Structure

```
src/
  components/
    MainContent/           # Main content area components
      ActionHeader.tsx     # Load, export, and bulk action controls
      CacheStatusBanner.tsx # Cache status indicator
      ChangelogItem.tsx    # Individual changelog entry
      ChangelogList.tsx    # List of changelog items
      ErrorDisplay.tsx     # Error message display
      LoadingState.tsx     # Loading spinner with rotating messages
      MainContent.tsx      # Main content container
      VersionWithDependencies.tsx # Version display with dependency tree
    Sidebar/               # Sidebar components
      CategoryFilter.tsx   # Category filter dropdown
      ConfigPanel.tsx      # SDK version and limit controls
      ModuleList.tsx       # Module selection checkboxes
      ModuleSearch.tsx     # Module search input
      Sidebar.tsx          # Sidebar container
      SidebarHeader.tsx    # Sidebar title and theme toggle
    ui/                    # shadcn/ui components
      alert-dialog.tsx
      badge.tsx
      badge.variants.ts    # CVA badge variants
      button.tsx
      button.variants.ts   # CVA button variants
      checkbox.tsx
      collapsible.tsx
      progress.tsx
      select.tsx
  contexts/
    ChangelogContext.context.tsx # Context type definitions
    ChangelogContext.tsx         # Global state management
  hooks/
    useChangelogCache.ts   # IndexedDB changelog caching with enrichment
    useChangelogContext.ts # Context consumer hook
    useIndexedDB.ts        # IndexedDB utilities (changelogs + npm packages)
    useLocalStorage.ts     # LocalStorage persistence
    useSDKBranches.ts      # Static SDK version provider
    useTheme.ts            # Theme management (light/dark/system)
  utils/
    changelogEnricher.ts   # Enriches versions with dependency trees
    changelogFilter.ts     # Version parsing and filtering
    dateFilter.ts          # Date filtering utilities
    dateFormatter.ts       # ISO date formatting for display
    dependencyTreeBuilder.ts # Builds dependency update chains
    moduleList.ts          # Expo modules catalog with categories and SDK versions
    npmDependencyComparer.ts # Fetches and compares npm package dependencies
  lib/
    utils.ts               # Utility functions (cn, etc.)
  App.tsx                  # Root component with context provider
  main.tsx                 # Entry point
  index.css                # Global styles and Tailwind imports
```

## Deployment

### GitHub Pages

1. Update `vite.config.ts` with your repository name:

   ```typescript
   base: '/your-repo-name/';
   ```

2. Enable GitHub Pages in repository settings:
   - Settings → Pages → Source: GitHub Actions

3. Push to main - auto-deployment via GitHub Actions

## Features in Detail

### State Management Architecture

- **React Context API**: Centralized state management via `ChangelogContext`
- **Custom Hooks**: `useChangelogContext` for consuming global state
- **Type Safety**: Full TypeScript support with context type definitions

### LocalStorage Persistence

Saves:

- Selected modules
- SDK branch preference
- Version limit setting
- Viewed modules state
- Module last viewed timestamps
- Theme preference
- Date filter settings

### IndexedDB Caching

- **Database**: `ChangelogCache` with two object stores:
  - `changelogs`: Stores changelog content
  - `npmPackages`: Stores npm package.json data
- **Cache Key**: `${sdkBranch}:${moduleName}` for changelogs, `${packageName}:${version}` for npm
- **TTL**:
  - 1 hour for main branch
  - 24 hours for latest SDK
  - 7 days for older SDKs
  - 30 days for npm packages
- **Cache Status**: Visual indicators for cached vs. fresh data
- **Performance**: Instant loading for cached changelogs

### Static SDK Versions

- **No API calls**: Uses a pre-configured static list of SDK versions
- **Versions included**: SDK 40-54 + main (unversioned) branch
- **No rate limiting**: Reliable, instant loading without GitHub API dependency
- **Easy to update**: Simply update the `SDK_VERSIONS` array in `src/utils/moduleList.ts`

### Dependency Tree Analysis

- **Root Cause Detection**: Automatically analyzes "no user-facing changes" versions to find what actually changed
- **NPM Integration**: Compares package.json dependencies between versions using npm registry
- **Recursive Traversal**: Follows dependency chains up to 10 levels deep to find the real changes
- **Visual Tree Display**: Interactive tree component shows the full dependency update chain
- **Smart Caching**: Caches npm package data for 30 days to minimize API calls
- **Dev Dependencies**: Distinguishes between production and dev dependencies with badges

### Enhanced Loading Experience

- **Rotating Messages**: 15 funny loading messages that rotate every 2 seconds
- **Current Module Display**: Shows which module is currently being loaded
- **Progress Stats**: Real-time display of loaded/cached/fresh counts
- **Auto-Clear Viewed**: "Fetch Fresh" automatically clears viewed status for a clean start

## License

MIT

## Acknowledgments

- Changelog data from [expo/expo](https://github.com/expo/expo)
- UI components from [shadcn/ui](https://ui.shadcn.com)
