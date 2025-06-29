# The Framework

A lightweight, opinionated build framework for React applications that generates Vercel-compatible build output.

## Conventions

This framework follows strict conventions to keep things simple and predictable:

### Required File Structure

```
your-project/
├── src/
│   └── index.html          # Entry point (required)
├── public/                 # Static assets (optional)
│   ├── favicon.ico
│   ├── images/
│   └── ...
└── package.json
```

### Directory Conventions

- **`src/`** - Source code directory (required)
  - Must contain `index.html` as the entry point
  - This is where your React components and application code live

- **`public/`** - Static assets directory (optional)
  - Files here are copied directly to the build output
  - Use for images, fonts, favicons, etc.
  - If missing, build continues with a warning

- **`.vercel/output/`** - Build output directory (auto-generated)
  - `static/` - Contains the built application and static assets
  - `config.json` - Vercel build configuration

## Usage

### Installation

```bash
# Import the build function
import { build } from "@your-org/framework";
```

### Basic Usage

```typescript
import { build } from "./framework/build";

// Build your application
await build();
```

That's it! No configuration needed.

## What the Build Does

1. **Validates Structure** - Checks for required files and directories
2. **Creates Output** - Sets up `.vercel/output/` directory structure
3. **Copies Assets** - Moves all files from `public/` to build output
4. **Bundles Code** - Uses Bun to build and minify your application
5. **Generates Config** - Creates Vercel-compatible `config.json`

## Build Process Details

### 1. File Validation
- ✅ Ensures `src/` directory exists
- ✅ Ensures `src/index.html` exists  
- ⚠️ Warns if `public/` directory is missing (optional)

### 2. Build Configuration
- **Entry Point**: `src/index.html`
- **Target**: Browser
- **Minification**: Enabled
- **Sourcemaps**: Linked
- **Environment**: Production

### 3. Output Structure
```
.vercel/output/
├── config.json           # Vercel configuration
└── static/              # Deployable assets
    ├── index.html       # Built entry point
    ├── *.js            # Bundled JavaScript
    ├── *.css           # Bundled styles
    └── ...             # Static assets from public/
```

## Error Handling

The framework provides clear error messages when requirements aren't met:

### Missing Source Directory
```
❌ Source directory not found: /path/to/src
Make sure you have a 'src' folder in your project root.
```

### Missing Entry Point
```
❌ Entry point not found: /path/to/src/index.html
Make sure you have an 'index.html' file in your src folder.
```

### Missing Public Directory (Warning)
```
⚠️ Public directory not found: /path/to/public
Skipping static file copy. Create a 'public' folder if you have static assets.
```

## Design Philosophy

This framework is intentionally opinionated to:

- **Eliminate Configuration** - No options or config files needed
- **Enforce Conventions** - Consistent project structure across teams
- **Provide Clear Feedback** - Helpful error messages guide you to solutions
- **Stay Lightweight** - Minimal dependencies and fast builds
- **Vercel Compatible** - Generates standard Vercel build output

## Example Project

```
my-react-app/
├── src/
│   ├── index.html
│   ├── App.tsx
│   └── components/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── scripts/
│   └── build.ts
└── package.json
```

**scripts/build.ts:**
```typescript
import { build } from "../framework/build";
await build();
```

Run with: `bun scripts/build.ts`

## Requirements

- **Bun** - Used for building and bundling
- **Node.js** - For file system operations
- **src/index.html** - Required entry point file
