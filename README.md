# Expo Changelog Viewer

A modern web application to view and compare changelogs for Expo SDK modules. Built with React 19, TypeScript, shadcn/ui, and Tailwind CSS.

## Features

- **Dynamic SDK Branch Loading**: Automatically fetches all available SDK branches from GitHub with 24h caching
- **IndexedDB Caching**: Fast changelog caching with automatic cache invalidation and status indicators
- **Module Selection**: Browse and select from 80+ Expo modules organized by category
- **Version Filtering**: Limit versions displayed per module (latest only, last 3, 5, 10, or all)
- **Smart UI**: Collapsible sections with shadcn/ui components and CVA variants
- **Search & Filter**: Real-time module search and category filtering
- **Mark as Viewed**: Track which changelogs you've reviewed with visual indicators
- **Bulk Actions**: Select all, clear all, mark all as viewed/unviewed
- **Context API**: Centralized state management with React Context
- **LocalStorage Persistence**: Saves all selections, preferences, and viewed state
- **Export**: Download changelogs as markdown
- **Light/Dark/Auto Theme**: Follows system preference or manual toggle
- **Progress Indicators**: Loading states and progress bars for async operations
- **Error Handling**: User-friendly error messages and fallback states
- **External Links**: All links open in new tabs
- **Code Quality**: ESLint 9, Prettier, and Lefthook pre-commit hooks

## Live Demo

Visit: [https://efstathiosntonas.github.io/expo-changelog-viewer/](https://efstathiosntonas.github.io/expo-changelog-viewer/)

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

1. **Select SDK Version**: Choose from dynamically loaded SDK branches
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
- **class-variance-authority** - Component variant styling
- **lucide-react** - Icon library
- **ESLint 9** - Code linting with flat config
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
      LoadingState.tsx     # Loading spinner and message
      MainContent.tsx      # Main content container
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
    useChangelogCache.ts   # IndexedDB changelog caching
    useChangelogContext.ts # Context consumer hook
    useIndexedDB.ts        # IndexedDB utilities
    useLocalStorage.ts     # LocalStorage persistence
    useSDKBranches.ts      # Dynamic SDK branch fetching with cache
    useTheme.ts            # Theme management (light/dark/system)
  utils/
    changelogFilter.ts     # Version parsing and filtering
    moduleList.ts          # Expo modules catalog with categories
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
- Theme preference
- SDK branches cache (24h TTL)

### IndexedDB Caching

- **Database**: `ChangelogCache` with `changelogs` object store
- **Cache Key**: `${sdkBranch}:${moduleName}`
- **TTL**: 7 days for changelog data
- **Cache Status**: Visual indicators for cached vs. fresh data
- **Performance**: Instant loading for cached changelogs

### Dynamic SDK Fetching

- Fetches all SDK branches from GitHub API (unauthenticated, rate limit applied to 60/req per hour per IP address)
- **24-hour cache** to minimize API calls and avoid rate limits
- Pagination support for 100+ branches
- **Automatic fallback** to static SDK list if rate limited
- **Rate limit handling**: GitHub allows 60 requests/hour for unauthenticated requests

### GitHub API Rate Limiting

The app fetches SDK branches from GitHub's public API without authentication:

- **Rate Limit**: 60 requests per hour per IP address
- **Cache Duration**: 24 hours to minimize API calls
- **Fallback**: Static SDK list (SDK 40-54) if rate limited
- **Production Impact**: Minimal - most users will use cached data

If you're developing and hit the rate limit:

1. Wait for the rate limit to reset (check console for time)
2. The app continues to work with the fallback SDK list
3. Clear cache only when necessary

## License

MIT

## Acknowledgments

- Changelog data from [expo/expo](https://github.com/expo/expo)
- UI components from [shadcn/ui](https://ui.shadcn.com)
