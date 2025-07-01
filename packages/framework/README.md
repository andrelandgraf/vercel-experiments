# The Framework

A lightweight, opinionated build framework for React applications that generates Vercel-compatible build output.

## Conventions

This framework follows strict conventions to keep things simple and predictable:

### Required File Structure

```
your-project/
├── src/
│   └── root.tsx           # Entry point (required)
├── public/                 # Static assets (optional)
│   ├── favicon.ico
│   ├── images/
│   └── ...
└── package.json
```

### Directory Conventions

- **`src/`** - Source code directory (required)
  - Must contain `root.tsx` as the entry point
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
- ✅ Ensures `src/root.tsx` exists
- ⚠️ Warns if `public/` directory is missing (optional)

### 2. Build Configuration

- **Entry Point**: `src/frontend.tsx`
- **Target**: Browser
- **Minification**: Enabled
- **Sourcemaps**: Linked
- **Environment**: Production

### 3. Output Structure

```
.vercel/output/
├── config.json           # Vercel configuration
└── static/              # Deployable assets
    ├── index.html       # Built document
    ├── *.js            # Bundled JavaScript
    ├── *.css           # Bundled styles
    └── ...             # Static assets from public/
```

### 4. SSR Function

If an `entry.server.ts` file exists at the project root, the build step
compiles it into a Node.js Serverless Function located in
`.vercel/output/functions/ssr.func`. The file must export a `GET` handler which
returns the HTML for your application.

The build also writes a `config.json` that sends every request not matched by
the filesystem (for example `/api` routes) to this function:

```json
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "ssr" }
  ]
}
```

Use this to server-render the initial page before the client-side router takes
over.

## Error Handling

The framework provides clear error messages when requirements aren't met:

### Missing Source Directory

```
❌ Source directory not found: /path/to/src
Make sure you have a 'src' folder in your project root.
```

### Missing Entry Point

```
❌ Entry point not found: /path/to/src/root.tsx
Make sure you have a 'root.tsx' file in your src folder.
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
│   ├── root.tsx
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
- **src/root.tsx** - Required entry point file

## Tailwind CSS

Tailwind v4 is bundled automatically. The framework compiles the stylesheet at
`packages/ui/styles/globals.css` and outputs `tailwind.css` alongside your
built application. No Tailwind configuration file is necessary. The generated
HTML document is patched to include this stylesheet.

## Runtime Router

The runtime includes a minimal React router for client-side navigation.

### Supported features

- Static routes (e.g. `/about`)
- Vercel-style dynamic routes using `[param]` segments
- Query string parsing via `useRouterState`
- `<Link>` component and `useNavigate` for navigation
