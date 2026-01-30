# Battlefield 6 Portal TypeScript Template

A ready-to-use template for creating Battlefield 6 Portal experiences using TypeScript. This template provides a solid
foundation with all the necessary tools, utilities, and example code to help you get started quickly.

## What is This?

This template is a starting point for building custom game modes, experiences, and modifications in Battlefield 6
Portal. Instead of starting from scratch, you can clone this repository, run the init script to personalize it, and
begin coding your ideas.

**What's Included:**

- ✅ **Init script** — Interactive setup for experience name, version, repository, and more; choose between a plain
  boilerplate or an example with telemetry and vehicle spawning; optionally move coding rules into the format your AI
  agent or IDE expects (VS Code, Cursor, Antigravity, Cline, Claude, Windsurf).
- ✅ **bf6-portal-utils** — Bundled utilities (events, UI, timers, map detector, multi-click detector, etc.) plus
  **`.ai/bf6-portal-utils-knowledge.md`**, which consolidates the parts of each module’s README that are best suited for
  coding agents.
- ✅ **Coding agent rules** — Project rules for building a Portal experience (`.cursorrules` by default; the init script
  can move/rename this for your IDE).
- ✅ **bf6-portal-mod-types** — A coding-agent-friendly `mod` types package: split into smaller, searchable files with
  richer JSDoc (instead of one massive under-documented file with 25k+ lines).
- ✅ **Command-line deploy** — Deploy scripts and strings to Portal via the `@bf6mods/portal` package (no manual
  copy-paste).
- ✅ **Chrome extension** — Companion extension in `extension/src` to get your Battlefield Portal session ID, mod ID,
  and refresh the website UI so it reflects API changes (the website does not refresh automatically).
- ✅ **Two boilerplate experiences** — Both include an admin debug tool. One is a minimal entry point; the other adds
  basic telemetry logging and vehicle spawning from a menu button for the server admin.
- ✅ Complete TypeScript setup with type definitions
- ✅ Pre-configured build tools and bundler
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Helper utilities for common Portal tasks
- ✅ Thumbnail image export tool (resizes/crops to Portal requirements)
- ✅ Spatial JSON minification tool (reduces file sizes by 50-80%)

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 23.0.0 or higher)
    - Download from [nodejs.org](https://nodejs.org/)
    - Verify installation: `node --version`

2. **npm** (comes with Node.js)
    - Verify installation: `npm --version`

3. **A Battlefield 6 Portal account**
    - Access to the Portal Experience Editor

4. **Basic familiarity with:**
    - JavaScript or TypeScript (helpful but not required)
    - Using a code editor (VS Code or variants recommended)
    - Command line/terminal basics

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/deluca-mike/bf6-portal-scripting-template.git
cd bf6-portal-scripting-template
```

### 2. Run the Init Script

Run the interactive init script to set your project details and choose your experience and IDE:

```bash
npm install
npm run init
```

You will be prompted for:

- **Experience name** (required)
- **Description** (optional)
- **Project name** (optional; if left blank, the experience name is used in kebab-case)
- **Version** (optional; defaults to `1.0.0`)
- **Author** (optional)
- **Repository URL** (optional)
- **Experience type** — Plain boilerplate (minimal entry point) or Example (adds telemetry and vehicle spawning from a
  menu button for the admin)
- **AI agent or IDE** — Cursor, VS Code, Antigravity, Cline, Claude, Windsurf, or N/A. If you choose anything other than
  Cursor or N/A, the script moves/renames `.cursorrules` into the location and filename your tool expects (e.g.
  `.github/copilot-instructions.md` for VS Code, `.clinerules` for Cline).
- **Experience ID (Mod ID)** — Optional. If you already have an experience on the Portal website, you can enter its GUID
  here; the script will set `MOD_ID` in your `.env` file. You can also leave this blank and add it later (e.g. using the
  [Chrome extension](#chrome-extension) to copy the Mod ID).

The script copies `.env.example` to `.env` if `.env` does not exist, updates `package.json`, and for the plain
boilerplate replaces `src/index.ts` with the minimal entry point from `src/boilerplate.ts`.

### 3. Build Your Experience

```bash
npm run build
```

This creates two files in the `dist/` folder:

- `bundle.ts` — Your compiled TypeScript code
- `bundle.strings.json` — All text strings used in your experience

### 4. Configure Portal session and experience ID (for deploy)

To use **deploy from the command line** (Option A below), you need a Battlefield Portal experience and your session and
mod IDs in `.env`:

- **If you already have an experience:** Open
  [portal.battlefield.com/bf6/experiences](https://portal.battlefield.com/bf6/experiences), make sure the experience
  exists, then get your **Session ID** and **Mod ID** (e.g. using the [Chrome extension](#chrome-extension): “Get
  Session ID” and “Get Mod ID” while on the experience page). Add them to `.env` as `SESSION_ID` and `MOD_ID`. If you
  entered an Experience ID when you ran `npm run init`, `MOD_ID` is already set; add `SESSION_ID` after logging in and
  using the extension.
- **If you need to create an experience:** Create the experience on the Portal website, open it, then use the Chrome
  extension to copy **Session ID** and **Mod ID** and add them to `.env` as `SESSION_ID=""` and `MOD_ID=""` (with the
  copied values inside the quotes).

The deploy script reads `SESSION_ID` and `MOD_ID` from `.env` (or from the environment). Do not commit `.env`; it is
gitignored.

### 5. Upload to Portal

**Option A: Deploy from the command line** (recommended)

With `SESSION_ID` and `MOD_ID` set in `.env` (see step 4), run:

```bash
npm run deploy
```

**Option B: Manual upload**

1. Open the Battlefield 6 Portal Experience Editor
2. Navigate to the Scripting section
3. Click the "Manage Scripts" button
4. Upload `dist/bundle.ts` via the "Custom Script" section
5. Upload `dist/bundle.strings.json` via the "Text Strings" section
6. Click "Import Files"
7. Save and test your experience

### 6. Export Assets (Optional)

#### Thumbnail Image

If you want to add a custom thumbnail for your experience:

1. Place your thumbnail image in `./src/` with one of these names:
    - `thumbnail.png`
    - `thumbnail.jpeg` or `thumbnail.jpg`
    - `thumbnail.gif`
    - `thumbnail.bmp`

2. Run the export command:

    ```bash
    npm run export-thumbnail
    ```

3. The script will automatically:
    - Resize and/or crop your image to **352x248 pixels** (Portal's required dimensions)
    - Compress it to meet the **78KB size limit**
    - Save the optimized thumbnail to `./dist/thumbnail.png` or `./dist/thumbnail.jpg`

4. Upload `dist/thumbnail.png` or `dist/thumbnail.jpg` to Portal in the Experience Editor's thumbnail section.

#### Spatial JSON Files

If you're using Portal's Spatial Editor to create custom maps or modify existing ones:

1. Place all your spatial JSON files in the `./spatials/` directory.

2. Run the minification command:

    ```bash
    npm run minify-spatials
    ```

3. The script will process all JSON files in `./spatials/` and:
    - **Replace long names and IDs** with short identifiers (e.g., "a", "b", "c") to reduce file size
    - **Eliminate whitespace** to reduce wasted file size
    - **Reduce numeric precision** to 6 decimal places (configurable) to further compress the files
    - **Preserve important structural elements** like "Static/" paths and critical asset names
    - Save the minified versions to `./dist/spatials/`

4. Upload the minified files from `./dist/spatials/` to Portal. The minification process typically reduces file sizes by
   50-80%, making it easier to meet file size limits.

## Init Script (Detailed)

The init script (`npm run init`) is the recommended way to personalize the template after cloning. It:

1. **Updates `package.json`** with your experience name, description, project name (npm package name), version, author,
   and repository URL. Repository URL is used to set `repository`, `bugs`, and `homepage`; a leading `git+` is stripped
   when generating `bugs.url` and `homepage`.
2. **Chooses the entry experience:**
    - **Plain boilerplate** — Deletes the current `src/index.ts` and renames `src/boilerplate.ts` to `src/index.ts`. You
      get a minimal entry point with the admin debug tool only.
    - **Example experience** — Deletes `src/boilerplate.ts` and keeps the current `src/index.ts`, which adds telemetry
      logging and vehicle spawning from the debug menu for the server admin.
3. **Adapts coding rules for your AI agent or IDE** (only if `.cursorrules` exists and you do not choose Cursor or N/A):
    - **VS Code** — Moves `.cursorrules` to `.github/copilot-instructions.md`
    - **Antigravity** — Moves `.cursorrules` to `.gemini/GEMINI.md`
    - **Cline** — Renames `.cursorrules` to `.clinerules`
    - **Claude** — Moves `.cursorrules` to `.claude/CLAUDE.md`
    - **Windsurf** — Renames `.cursorrules` to `.windsurfrules`
4. **Prepares `.env`** — Copies `.env.example` to `.env` if `.env` does not exist. If you provide an Experience ID (Mod
   ID) in GUID format, the script sets `MOD_ID` in `.env` to that value so the deploy script can use it.

Run `npm run init` once after cloning; you can still edit `package.json`, `.env`, and source files by hand afterward.

## Coding Agent Support

The template is set up to work well with AI coding agents and IDEs:

- **Project rules** — A single rules file (by default `.cursorrules`) contains Portal-specific guidance: prefer
  event-driven design, use `bf6-portal-utils`, validate players with `mod.IsPlayerValid`, use the Logger module instead
  of `console.log`, and more. The init script can move or rename this file for your tool (see
  [Init script](#init-script-detailed)).
- **bf6-portal-utils knowledge** — The file `.ai/bf6-portal-utils-knowledge.md` is generated from the `bf6-portal-utils`
  package and consolidates the parts of each module’s README that are best suited for agents. Regenerate it with
  `npm run refresh-ai` after updating `bf6-portal-utils`.
- **mod types** — The `bf6-portal-mod-types` package is split into smaller, searchable files with richer JSDoc instead
  of one large under-documented file. Use it for accurate `mod` types and better discoverability in your editor or agent
  context.

## Deploying from the Command Line

You can build and deploy your script and strings to Portal without manually uploading files. The template uses
`@bf6mods/portal` and a small deploy script.

1. **Get your session ID and mod ID** — Use the [Chrome extension](#chrome-extension) (or the Portal website) while
   logged in to copy your session ID and the mod (experience) ID you want to update.
2. **Configure environment** — Ensure `.env` in the project root has `SESSION_ID` and `MOD_ID` (the init script copies
   `.env.example` to `.env` and can set `MOD_ID` if you provide an Experience ID). The deploy script reads these (see
   step 4 in Quick Start).
3. **Deploy** — From the project root:
    - `npm run deploy` or `npm run deploy:patch` — Bump patch version and deploy
    - `npm run deploy:minor` — Bump minor version and deploy
    - `npm run deploy:major` — Bump major version and deploy

Each deploy command runs `npm run build` first, then uploads `dist/bundle.ts` and `dist/bundle.strings.json` to Portal.
Because the Portal website does not refresh automatically after API updates, use the extension’s “Refresh Experiences”
button (or reload the page) to see your changes.

## Chrome Extension

A companion Chrome extension in **`extension/src`** helps you work with the Portal website and the deploy workflow:

- **Get Session ID** — Copies your current Battlefield Portal session ID (needed for the deploy script and API).
- **Get Mod ID** — Copies the mod (experience) ID for the current experience page, so you can set `MOD_ID` in `.env` for
  deployment.
- **Refresh Experiences** — Reloads the site’s experience list so it reflects changes made via the API; the Portal
  website does not refresh this automatically after a deploy.

The extension only runs on `portal.battlefield.com`. You must load it as an **unpacked** extension in Chrome.

### Loading the Extension as Unpacked in Chrome

1. **Open the extensions page** — In Chrome, go to `chrome://extensions/`.
2. **Enable developer mode** — Turn on the “Developer mode” toggle in the top-right.
3. **Load unpacked** — Click “Load unpacked”.
4. **Select the extension folder** — Choose the **`extension/src`** folder inside your cloned template (the one that
   contains `manifest.json`, `popup.html`, and `popup.js`). Do not select the outer `extension` folder or the project
   root.
5. **Confirm** — The “BF6 Portal” (or similar) extension should appear in your extensions list and in the Chrome
   toolbar. Pin it if you like for quick access.
6. **Use on Portal** — Go to [portal.battlefield.com](https://portal.battlefield.com), open the extension popup, and use
   “Get Session ID”, “Get Mod ID”, or “Refresh Experiences” as needed.

If you update the extension’s files, go back to `chrome://extensions/` and click the refresh icon on the extension card
to reload it.

## Project Structure

Understanding the folder structure will help you navigate and customize the template:

```
bf6-portal-scripting-template/
├── .ai/                         # Agent-oriented docs (generated)
│   └── bf6-portal-utils-knowledge.md   # Consolidated bf6-portal-utils module docs
├── .cursorrules                 # Coding rules (or moved/renamed by init for your IDE)
├── extension/
│   └── src/                     # Chrome extension (load as unpacked)
│       ├── manifest.json
│       ├── popup.html
│       ├── popup.js
│       └── icons/
├── scripts/
│   ├── init.js                  # Init script (npm run init)
│   ├── deploy.js
│   ├── export-thumbnail.js
│   ├── generate-ai-context.js   # Regenerates .ai/bf6-portal-utils-knowledge.md
│   └── minify-all-spatials.js
├── src/                         # Your source code
│   ├── index.ts                 # Main entry point (or boilerplate.ts before init)
│   ├── boilerplate.ts           # Plain boilerplate (deleted or renamed by init)
│   ├── debug-tool/              # Admin debug tool
│   │   ├── index.ts
│   │   └── strings.json
│   ├── helpers/
│   │   └── index.ts
│   ├── strings.json             # Text strings for your experience
│   └── thumbnail.png            # Optional: Experience thumbnail (png/jpeg/gif/bmp)
├── spatials/                    # Optional: Spatial Editor JSON files
│   └── *.json
├── dist/                        # Build output (generated)
│   ├── bundle.ts                # Upload to Portal or use with deploy
│   ├── bundle.strings.json      # Upload to Portal or use with deploy
│   ├── thumbnail.png            # Optional (or .jpg)
│   └── spatials/                # Optional: Minified spatial JSON files
├── node_modules/                # Dependencies (auto-generated)
├── package.json                 # Project configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Key Files Explained

- **`src/index.ts`** — Main entry point for your experience. After running the init script with “plain boilerplate”,
  this is the minimal entry; if you kept the “example” experience, it also includes telemetry and vehicle spawning from
  the debug menu. This is where you write most of your game logic, or you can split it across multiple files.

- **`src/strings.json`** — Text strings used in-game. Portal requires strings to be pre-defined, so any text you display
  must be added here first. You can also place files ending in `strings.json` next to code that uses them; the bundler
  will include them in the final output.

- **`.cursorrules`** — Project rules for building a Portal experience (logging, events, UI, etc.). The init script can
  move or rename this for your AI agent or IDE (e.g. `.github/copilot-instructions.md`, `.clinerules`).

- **`.ai/bf6-portal-utils-knowledge.md`** — Consolidated bf6-portal-utils module docs for coding agents. Regenerate with
  `npm run refresh-ai` after updating the utility package.

- **`dist/bundle.ts`** — After `npm run build`, this is your bundled code. Upload it to Portal’s “Custom Script” section
  or use `npm run deploy`.

- **`dist/bundle.strings.json`** — After `npm run build`, this is your bundled strings. Upload it to Portal’s “Text
  Strings” section or use `npm run deploy`.

- **`package.json`** — Project name, dependencies, and scripts. The init script updates name, experienceName,
  description, version, author, and repository when you first set up the project.

## What This Template Does Out of the Box

The template ships with **two boilerplate experiences**. You choose one when you run `npm run init`:

1. **Plain boilerplate** — Minimal entry point. Includes only the admin debug tool (see below).
2. **Example experience** — Same admin debug tool, plus basic **telemetry** (position and facing direction logged every
   second) and **vehicle spawning** from the debug menu (e.g. spawn an AH64 or golf cart in front of the admin). Useful
   as a reference for events, timers, and spawner lifecycle.

Both boilerplates include:

### Debug Tool (Admin Only)

The first player to join a non-persistent test server (the “admin”) can:

- **Triple-click the interact key** (E by default) anywhere to open a debug menu
- Toggle a **static logger** (fixed rows) and a **dynamic logger** (scrolling console) for game events
- Clear both loggers

In the **example** experience, the debug menu also has buttons to spawn vehicles and the static logger shows telemetry
(position and facing) every second while the admin is deployed.

## Understanding the Code

### Event Handlers

Portal uses event handlers — functions that run when certain things happen in the game. This template does **not**
export raw Portal handler functions; instead it uses the **Events** module from `bf6-portal-utils`, which wraps the
official handlers and lets you subscribe/unsubscribe in code:

```typescript
import { Events } from 'bf6-portal-utils/events/index.ts';

Events.OnPlayerDeployed.subscribe((player) => {
    // Your code here
});

Events.OnPlayerDied.subscribe((victim, killer, deathType, weaponUnlock) => {
    // Your code here
});
```

See `.ai/bf6-portal-utils-knowledge.md` and the template’s `src/index.ts` for wiring and cleanup (e.g. unsubscribe on
leave).

### Ongoing Functions

Handlers like `OngoingPlayer` run every server tick (30 times per second). The Events module and utilities (e.g.
MultiClickDetector) expect you to forward these from your single exported handler. Keep per-tick code minimal.

### The `mod` Namespace

All Portal functionality is accessed through the `mod` namespace:

```typescript
// Get a player's position
const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

// Check if a player is alive
const isAlive = mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive);

// Display a notification
mod.DisplayNotificationMessage(message, player);
```

## Available Experience Code Utilities

This template project comes with `bf6-portal-utils` that has several helpful utility libraries (i.e. raycast
abstraction, a reactive UI framework, free for all spawning, scavenger drop detection, sound abstraction, and more). The
boilerplate projects use the following utility libraries:

### UI Module (`bf6-portal-utils/ui`)

An object-oriented wrapper around Portal's UI system. Makes creating buttons, text, and containers much easier:

```typescript
import { UI } from 'bf6-portal-utils/ui';

// Create a button
const button = new UI.Button(
    {
        x: 0,
        y: 0,
        width: 200,
        height: 50,
        onClick: async (player) => {
            // Handle click
        },
        label: {
            message: mod.Message(mod.stringkeys.your.buttonText),
            textColor: UI.COLORS.WHITE,
        },
    },
    player
);
```

### Logger Module (`bf6-portal-utils/logger`)

Display runtime text directly in-game, perfect for debugging:

```typescript
import { Logger } from 'bf6-portal-utils/logger';

// Create a logger
const logger = new Logger(player, {
    staticRows: false, // Dynamic scrolling mode
    visible: true,
    anchor: mod.UIAnchor.TopLeft,
});

// Log messages
logger.log('Player id: ' + mod.GetObjId(player));
```

### Map Detector (`bf6-portal-utils/map-detector`)

Detect which map is currently active (Portal's built-in function is broken):

```typescript
import { MapDetector } from 'bf6-portal-utils/map-detector';

const map = MapDetector.currentMap();

if (map === MapDetector.Map.Downtown) {
    // Downtown-specific logic
}
```

### Multi-Click Detector (`bf6-portal-utils/multi-click-detector`)

Detect when players multi-click the interact key (useful for opening menus):

```typescript
import { MultiClickDetector } from 'bf6-portal-utils/multi-click-detector';

new MultiClickDetector(player, () => {
    openMenu(player);
});
```

You must wire `OngoingPlayer` and `OnPlayerLeaveGame` to `MultiClickDetector.handleOngoingPlayer` and
`MultiClickDetector.pruneInvalidPlayers` (see the template’s `src/index.ts` and the module docs in
`.ai/bf6-portal-utils-knowledge.md`).

## Customizing the Template

### Adding Your Own Code

Start by editing `src/index.ts`. You can:

1. **Remove the debug tool** if you don't need it (delete the `DebugTool` import and related code)
2. **Modify event handlers** to implement your game logic
3. **Add new event handlers** for events you want to respond to
4. **Create new files** in `src/` for organizing your code

### Adding New Strings

1. Edit `src/strings.json`:

```json
{
    "yourExperienceKey": {
        "yourSection": {
            "yourKey": "Your text here"
        }
    }
}
```

2. Use it in code:

```typescript
mod.Message(mod.stringkeys.yourExperienceKey.yourSection.yourKey);
```

### Creating New Modules

You can organize your code into separate files:

1. Create `src/your-module/index.ts`
2. Export functions or classes:

```typescript
export function yourFunction(): void {
    // Your code
}
```

3. Import in `src/index.ts`:

```typescript
import { yourFunction } from './your-module';
```

## Building and Development

### Build Commands

```bash
# One-time setup: set project info, experience type, and IDE rules file
npm run init

# Build your experience (creates dist/bundle.ts and dist/bundle.strings.json)
npm run build

# Deploy script and strings to Portal (builds first; requires SESSION_ID and MOD_ID in .env)
npm run deploy              # or deploy:patch — bump patch version
npm run deploy:minor        # bump minor version
npm run deploy:major        # bump major version

# Regenerate .ai/bf6-portal-utils-knowledge.md from bf6-portal-utils
npm run refresh-ai

# Export and optimize thumbnail image (creates dist/thumbnail.png or .jpg)
npm run export-thumbnail

# Minify all spatial JSON files (creates dist/spatials/*.json)
npm run minify-spatials

# Check code for errors
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run prettier
```

### Development Workflow

1. **Edit code** in `src/`
2. **Run `npm run build`** to compile
3. **Deploy** — Either run `npm run deploy` (after setting `SESSION_ID` and `MOD_ID` in `.env`, e.g. via the
   [Chrome extension](#chrome-extension)) or manually upload `dist/bundle.ts` and `dist/bundle.strings.json` in the
   Portal Experience Editor
4. **Refresh** — If you used the deploy API, use the extension’s “Refresh Experiences” or reload the Portal page so the
   UI reflects your changes
5. **Test in Portal** and repeat

### Hot Reloading

Portal does not support hot reloading. After each deploy you need to take down or restart the server and re-host the
experience.

## Common Tasks

### Display a Notification to a Player

```typescript
export function OnPlayerDeployed(player: mod.Player): void {
    const message = mod.Message(mod.stringkeys.template.notifications.deployed, player);
    mod.DisplayNotificationMessage(message, player);
}
```

### Check Player State

```typescript
// Is the player alive?
const isAlive = mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive);

// Get player position
const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

// Get player health
const health = mod.GetSoldierState(player, mod.SoldierStateNumber.Health);
```

### Create a Simple UI Button

```typescript
import { UI } from 'bf6-portal-utils/ui';

const button = new UI.Button(
    {
        x: 0,
        y: 0,
        width: 200,
        height: 50,
        anchor: mod.UIAnchor.Center,
        onClick: async (player) => {
            mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.your.buttonClicked), player);
        },
        label: {
            message: mod.Message(mod.stringkeys.your.buttonLabel),
            textColor: UI.COLORS.WHITE,
        },
    },
    player
);

// Don't forget to register the global button handler in OnPlayerUIButtonEvent!
```

### Wait for a Condition

```typescript
export async function OnPlayerDeployed(player: mod.Player): Promise<void> {
    // Wait until player is jumping
    while (!mod.GetSoldierState(player, mod.SoldierStateBool.IsJumping)) {
        if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) return;

        await mod.Wait(0.1);
    }

    // Player is now jumping, do something
}
```

## Troubleshooting

### Build Errors

- **"Cannot find module"** — Run `npm install` to install dependencies
- **Type errors** — Check that you’re using Portal types correctly. Refer to `node_modules/bf6-portal-mod-types/` (e.g.
  `index.d.ts`, `enums.d.ts`, `types.d.ts`); the package is split into smaller, searchable files with JSDoc

### Portal Errors

- **Code not running**
    - First, check that all your `mod.Message` calls use only strings that exist in your `strings.json`. Portal scripts
      tend to stop in their tracks as soon as you try to create a `mod.Message` with a string not defined this way.
    - Next, if you are on PC, check the log file for errors. It should be at
      `C:\Users\username\AppData\Local\Temp\Battlefieldâ„¢ 6\PortalLog.txt`
    - Next, some common issues:
        - Syntax errors
        - Calling `mod` functions incorrectly
        - Missing string keys

### Performance Issues

- **Game lagging** - Check your `Ongoing*` functions. They run 30 times per second, so keep them fast! Even better,
  consider coding your experience in a way that relies only on "one-time" events (i.e. not the `Ongoing*` ones).

## Learning Resources

### Understanding Portal Types

The `bf6-portal-mod-types` package provides type definitions for the `mod` namespace. It is split into smaller,
searchable files with richer JSDoc (instead of one large 25k+ line file). Explore it in:

- `node_modules/bf6-portal-mod-types/` — e.g. `index.d.ts`, `enums.d.ts`, `types.d.ts`, and referenced files

### Utility Documentation

- **In-repo** — `.ai/bf6-portal-utils-knowledge.md` consolidates the parts of each bf6-portal-utils module README that
  are best suited for coding agents. Regenerate with `npm run refresh-ai` after updating the package.
- **Upstream** — [bf6-portal-utils](https://github.com/deluca-mike/bf6-portal-utils) (UI, Logger, Map Detector,
  Multi-Click Detector, Events, Timers, etc.), [bf6-portal-bundler](https://github.com/deluca-mike/bf6-portal-bundler)

### Portal Official Resources

- [Battlefield Portal Documentation](https://www.ea.com/games/battlefield/battlefield-6/onboarding-hub/bf6-portal-hub)
- [Portal Community Discord](https://discord.com/invite/battlefield-portal-community-870246147455877181)
- [Portal Community Reddit](https://www.reddit.com/r/BattlefieldPortal/)

## Next Steps

1. **Run the init script** — If you haven’t already, run `npm run init` to set your project info and choose your
   experience type and IDE rules file.
2. **Explore the code** — Read `src/index.ts` to see how events, the debug tool, and (in the example) telemetry and
   vehicle spawning work.
3. **Build and deploy** — Run `npm run build` and either `npm run deploy` (with session/mod ID and the Chrome extension)
   or manual upload to Portal.
4. **Experiment** — Add UI, subscribe to more events, or modify player behavior; use `.ai/bf6-portal-utils-knowledge.md`
   and `bf6-portal-mod-types` for reference.
5. **Join the community** — Share your experiences and learn from others.

## Removing the Debug Tool

If you don’t need the admin debug tool, you can remove it:

1. Delete the `src/debug-tool/` folder
2. Remove the `DebugTool` import and all `adminDebugTool` references from `src/index.ts`
3. If you’re using the example experience, also remove the telemetry interval, vehicle spawn logic, and
   `MultiClickDetector` usage that opens the debug menu; keep or remove the rest of the Events subscriptions as needed

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing

Found a bug or have a suggestion? Please open an issue on GitHub! Or message us on Discord!

## Support

- **Issues**: [GitHub Issues](https://github.com/deluca-mike/bf6-portal-scripting-template/issues)
- **Questions**: Open a discussion on GitHub

---

Happy coding! 🎮
