

# Battlefield 6 Portal Utilities - Library Context
This document contains implementation details explicitly tagged for AI consumption.
Always prefer patterns found here over raw 'mod' namespace calls.

---

## Module: events

This TypeScript `Events` namespace provides a centralized event subscription system for Battlefield Portal experience developers. In Battlefield Portal, each event handler function (like `OnPlayerDeployed`, `OngoingPlayer`, etc.) can only be implemented and exported once per entire project. This module implements all event handlers once, automatically hooking into every Battlefield Portal event, and exposes subscription APIs that allow you to subscribe and unsubscribe to any event from multiple places in your codebase. This keeps your code clean, modular, and maintainable.

## Prerequisites

1. **Package installation** – Install `bf6-portal-utils` as a dev dependency in your project.
2. **Bundler** – Use the [`bf6-portal-bundler`](https://www.npmjs.com/package/bf6-portal-bundler) package to bundle your mod. The bundler automatically handles code inlining.
3. **No duplicate event handlers** – Do not implement or export any Battlefield Portal event handler functions in your codebase. This module handles all event hooking automatically.

### Example

```ts
import { Events } from 'bf6-portal-utils/events';

// Optional: Configure error logging for handler failures
Events.setLogging((text) => console.log(text), Events.LogLevel.Warning, true);

// Subscribe to player deployment events
function handlePlayerDeployed(player: mod.Player): void {
    console.log(`Player ${mod.GetObjId(player)} deployed`);
}

// Subscribe to player death events with async handler
async function handlePlayerDied(
    player: mod.Player,
    otherPlayer: mod.Player,
    deathType: mod.DeathType,
    weaponUnlock: mod.WeaponUnlock
): Promise<void> {
    // Async operations are fully supported
    await mod.Wait(0.1);
    console.log(`Player ${mod.GetObjId(player)} died`);
}

// Subscribe to ongoing player events
function handleOngoingPlayer(player: mod.Player): void {
    // This will be called every tick for every player
    const health = mod.GetSoldierState(player, mod.SoldierStateNumber.Health);

    if (health < 10) {
        // Low health logic
    }
}

// Set up subscriptions at module load time (top-level code)
const unsubscribeDeployed = Events.OnPlayerDeployed.subscribe(handlePlayerDeployed);
const unsubscribeDied = Events.OnPlayerDied.subscribe(handlePlayerDied);
const unsubscribeOngoing = Events.OngoingPlayer.subscribe(handleOngoingPlayer);

// Optional: Clean up subscriptions when the game mode ends
Events.OnGameModeEnding.subscribe(() => {
    unsubscribeDeployed();
    unsubscribeDied();
    unsubscribeOngoing();
});
```

```ts
// Channel style (preferred)
const joinGameUnsubscribe = Events.OnPlayerJoinGame.subscribe((player: mod.Player) => {
    console.log(`Player joined game: ${mod.GetObjId(player)}`);
});
// Later, unsubscribe
joinGameUnsubscribe();

// Object style
const playerDeployedUnsubscribe = Events.subscribe(Events.Type.OnPlayerDeployed, (player: mod.Player) => {
    console.log(`Player deployed: ${mod.GetObjId(player)}`);
});
// Later, unsubscribe
playerDeployedUnsubscribe();
```

```ts
const handler = (player: mod.Player) => console.log(`Player deployed: ${mod.GetObjId(player)}`);

// Channel style (preferred)
Events.OnPlayerDeployed.subscribe(handler);
// Later...
Events.OnPlayerDeployed.unsubscribe(handler);

// Object style
Events.subscribe(Events.Type.OnPlayerDeployed, handler);
// Later...
Events.unsubscribe(Events.Type.OnPlayerDeployed, handler);
```

#### Trigger

Manually triggers an event with the given parameters. Primarily useful for debugging or testing. In normal operation, events are automatically triggered by the Battlefield Portal runtime when the corresponding game events occur.

**Channel style:**

- **Signature:** `Events.<EventName>.trigger(...args): void`
- **Parameters:** `...args` – The parameters matching this event's signature (e.g. for `OnPlayerDeployed`: `player`).

**Enum style:**

- **Signature:** `Events.trigger<T extends Type>(type: T, ...args: EventParameters<T>): void`
- **Parameters:** `type` – The event type from `Events.Type` (trigger function for that event); `...args` – The parameters matching the event type's signature.

**Examples:**

```ts
const testPlayer = mod.ValueInArray(mod.AllPlayers(), 0) as mod.Player;

// Channel style (preferred)
Events.OnPlayerDeployed.trigger(testPlayer);

// Object style
Events.trigger(Events.Type.OnPlayerDeployed, testPlayer);
```

```ts
// Channel style (preferred)
Events.OnPlayerDeployed.subscribe(someHandler);
Events.OnPlayerDeployed.handlerCount(); // 1

// Object style
Events.subscribe(Events.Type.OnPlayerDeployed, someOtherHandler);
Events.handlerCount(Events.Type.OnPlayerDeployed); // 2
```

#### `Events.Type`

An object mapping each event name to its trigger function (e.g. `Events.Type.OnPlayerDeployed`). Use these values with the object-style API: `Events.subscribe(type, handler)`, `Events.unsubscribe(type, handler)`, `Events.trigger(type, ...args)`, and `Events.handlerCount(type)`. You can also use it for typed references to event payloads (e.g. `Parameters<typeof Events.Type.OnPlayerDied>`) or to call a trigger by name (e.g. `Events.Type.OnPlayerDeployed(somePlayer)`).

**Example (typed payload / dynamic dispatch):**

```ts
import { Events } from 'bf6-portal-utils/events';

// Typed payload for OnPlayerDied
type OnPlayerDiedPayload = Parameters<typeof Events.Type.OnPlayerDied>;
// [player: mod.Player, otherPlayer: mod.Player, deathType: mod.DeathType, weaponUnlock: mod.WeaponUnlock]

// Call a trigger by name (mostly for debugging or testing).
Events.Type.OnPlayerDeployed(somePlayer);
```

Available event types include:

- `OngoingGlobal`, `OngoingAreaTrigger`, `OngoingCapturePoint`, `OngoingEmplacementSpawner`, `OngoingHQ`, `OngoingInteractPoint`, `OngoingLootSpawner`, `OngoingMCOM`, `OngoingPlayer`, `OngoingRingOfFire`, `OngoingSector`, `OngoingSpawner`, `OngoingSpawnPoint`, `OngoingTeam`, `OngoingVehicle`, `OngoingVehicleSpawner`, `OngoingWaypointPath`, `OngoingWorldIcon`
- `OnAIMoveToFailed`, `OnAIMoveToRunning`, `OnAIMoveToSucceeded`, `OnAIParachuteRunning`, `OnAIParachuteSucceeded`, `OnAIWaypointIdleFailed`, `OnAIWaypointIdleRunning`, `OnAIWaypointIdleSucceeded`
- `OnCapturePointCaptured`, `OnCapturePointCapturing`, `OnCapturePointLost`
- `OnGameModeEnding`, `OnGameModeStarted`
- `OnMandown`
- `OnMCOMArmed`, `OnMCOMDefused`, `OnMCOMDestroyed`
- `OnPlayerDamaged`, `OnPlayerDeployed`, `OnPlayerDied`, `OnPlayerEarnedKill`, `OnPlayerEarnedKillAssist`, `OnPlayerEnterAreaTrigger`, `OnPlayerEnterCapturePoint`, `OnPlayerEnterVehicle`, `OnPlayerEnterVehicleSeat`, `OnPlayerExitAreaTrigger`, `OnPlayerExitCapturePoint`, `OnPlayerExitVehicle`, `OnPlayerExitVehicleSeat`, `OnPlayerInteract`, `OnPlayerJoinGame`, `OnPlayerLeaveGame`, `OnPlayerSwitchTeam`, `OnPlayerUIButtonEvent`, `OnPlayerUndeploy`
- `OnRayCastHit`, `OnRayCastMissed`
- `OnRevived`
- `OnRingOfFireZoneSizeChange`
- `OnSpawnerSpawned`
- `OnTimeLimitReached`
- `OnVehicleDestroyed`, `OnVehicleSpawned`

```ts
import { Events } from 'bf6-portal-utils/events';

// Configure logging with console.log, minimum level of Warning, and include error details
Events.setLogging(
    (text) => console.log(text),
    Events.LogLevel.Warning,
    true // includeError
);

// If a handler throws an error, it will be logged automatically
Events.OnPlayerDeployed.subscribe((player: mod.Player) => {
    // If this throws, it will be logged as: <Events> Error in handler handleDeployment: [error details]
    throw new Error('Something went wrong');
});
```

## Usage Patterns

- **Modular Event Handling** – Split your event handling logic across multiple files or modules. Each module can subscribe to the events it needs without conflicts.

- **Conditional Subscriptions** – Subscribe and unsubscribe handlers dynamically based on game state. For example, only subscribe to vehicle events when vehicles are enabled.

- **Multiple Handlers per Event** – Subscribe multiple handlers to the same event to handle different concerns separately (e.g., one handler for logging, another for game logic, another for UI updates).

- **Async Operations** – Use async handlers for operations that require waiting, such as delayed actions or sequential operations.

- **Error Handling** – Since errors in handlers are isolated, you can add try-catch blocks within individual handlers for fine-grained error handling without affecting other subscriptions.

### Advanced Example

This example demonstrates how multiple modules across different files can subscribe to the same events independently, highlighting the key benefit of the Events system. Each module handles its own concerns without conflicts.

**File: `src/stats/player-stats.ts`**

```ts
import { Events } from 'bf6-portal-utils/events';

// Player statistics tracking module
class PlayerStats {
    private kills = new Map<number, number>();
    private deaths = new Map<number, number>();

    private unsubscribeFunctions: (() => void)[] = [];

    public constructor() {
        // Subscribe to player events for stats tracking
        this.unsubscribeFunctions.push(Events.OnPlayerEarnedKill.subscribe(this.handleKill.bind(this)));
        this.unsubscribeFunctions.push(Events.OnPlayerDied.subscribe(this.handleDeath.bind(this)));
        this.unsubscribeFunctions.push(Events.OnPlayerLeaveGame.subscribe(this.handleLeave.bind(this)));
    }

    private handleKill(
        player: mod.Player,
        otherPlayer: mod.Player,
        deathType: mod.DeathType,
        weaponUnlock: mod.WeaponUnlock
    ): void {
        const playerId = mod.GetObjId(player);
        this.kills.set(playerId, (this.kills.get(playerId) || 0) + 1);
    }

    private handleDeath(
        player: mod.Player,
        otherPlayer: mod.Player,
        deathType: mod.DeathType,
        weaponUnlock: mod.WeaponUnlock
    ): void {
        const playerId = mod.GetObjId(player);
        this.deaths.set(playerId, (this.deaths.get(playerId) || 0) + 1);
    }

    private handleLeave(playerId: number): void {
        this.kills.delete(playerId);
        this.deaths.delete(playerId);
    }

    public getKills(player: mod.Player): number {
        return this.kills.get(mod.GetObjId(player)) || 0;
    }

    public getDeaths(player: mod.Player): number {
        return this.deaths.get(mod.GetObjId(player)) || 0;
    }

    public cleanup(): void {
        this.unsubscribeFunctions.forEach((unsub) => unsub());
    }
}

let stats: PlayerStats;

Events.OnGameModeStarted.subscribe(() => {
    stats = new PlayerStats();
});

Events.OnGameModeEnding.subscribe(() => {
    stats?.cleanup();
});
```

**File: `src/logging/game-logger.ts`**

```ts
import { Events } from 'bf6-portal-utils/events';

// Game event logging module - subscribes to the SAME events as PlayerStats
class GameLogger {
    private unsubscribeFunctions: (() => void)[] = [];

    public constructor() {
        // Multiple modules can subscribe to the same events!
        // This logger also listens to OnPlayerEarnedKill and OnPlayerDied
        this.unsubscribeFunctions.push(Events.OnPlayerEarnedKill.subscribe(this.logKill.bind(this)));
        this.unsubscribeFunctions.push(Events.OnPlayerDied.subscribe(this.logDeath.bind(this)));
        this.unsubscribeFunctions.push(Events.OnPlayerDeployed.subscribe(this.logDeployment.bind(this)));
        this.unsubscribeFunctions.push(Events.OnVehicleSpawned.subscribe(this.logVehicleSpawn.bind(this)));
    }

    private logKill(
        player: mod.Player,
        otherPlayer: mod.Player,
        deathType: mod.DeathType,
        weaponUnlock: mod.WeaponUnlock
    ): void {
        console.log(
            `[KILL] Player ${mod.GetObjId(player)} killed Player ${mod.GetObjId(otherPlayer)} with ${weaponUnlock}`
        );
    }

    private logDeath(
        player: mod.Player,
        otherPlayer: mod.Player,
        deathType: mod.DeathType,
        weaponUnlock: mod.WeaponUnlock
    ): void {
        console.log(`[DEATH] Player ${mod.GetObjId(player)} died`);
    }

    private logDeployment(player: mod.Player): void {
        console.log(`[DEPLOY] Player ${mod.GetObjId(player)} deployed`);
    }

    private logVehicleSpawn(vehicle: mod.Vehicle): void {
        console.log(`[VEHICLE] Vehicle ${mod.GetObjId(vehicle)} spawned`);
    }

    public cleanup(): void {
        this.unsubscribeFunctions.forEach((unsub) => unsub());
    }
}

let logger: GameLogger;

Events.OnGameModeStarted.subscribe(() => {
    logger = new GameLogger();
});

Events.OnGameModeEnding.subscribe(() => {
    logger?.cleanup();
});
```

**File: `src/index.ts`**

```ts
import { Events } from 'bf6-portal-utils/events';

// Main entry point - just import the modules, they handle their own subscriptions
import './stats/player-stats';
import './logging/game-logger';

// You can also subscribe to events directly in the main file
Events.OnGameModeStarted.subscribe(() => {
    console.log('Game mode started - all modules initialized');
});

// Multiple handlers for the same event work perfectly!
Events.OnPlayerDeployed.subscribe((player: mod.Player) => {
    // This handler runs alongside the HUD's handler
    console.log(`Main: Player ${mod.GetObjId(player)} deployed`);
});
```

This example demonstrates:

- **Multiple subscriptions to the same event** – `OnPlayerEarnedKill` is subscribed to by `PlayerStats` and `GameLogger`, and all handlers execute independently.

- **Modular code organization** – Each module manages its own subscriptions without knowing about other modules.

- **No conflicts** – All modules can subscribe to any event without interfering with each other.

- **Clean separation of concerns** – Stats tracking, logging, and UI updates are handled in separate files but all respond to the same game events.

## Known Limitations & Caveats

- **Single Event Hook Requirement** – You must not implement or export any Battlefield Portal event handler functions in your own code. If you do, they will conflict with this module's implementations and cause undefined behavior.

- **Handler Reference Equality** – When unsubscribing, you must pass the exact same function reference that was used in `subscribe()`. Anonymous functions cannot be unsubscribed unless you store the reference. **Recommended:** Use the unsubscribe function returned by `subscribe()` instead of storing handler references.

- **Execution Order** – Handler execution order is not guaranteed. If you need handlers to execute in a specific order, chain them manually or use a single handler that calls other functions in order.

- **No Return Values** – Event handlers cannot return values to the caller. All handlers return `void` or `Promise<void>`. If you need to collect results, use shared state or callbacks.

- **Non-Blocking Nature** – Because handlers execute asynchronously and non-blocking, you cannot rely on handlers completing before other code executes. Use promises or callbacks if you need to wait for handler completion.

---

## Module: ffa-spawning

This TypeScript `FFASpawning.Soldier` class enables Free For All (FFA) spawning for custom Battlefield Portal experiences by short-circuiting the normal deploy process in favor of a custom UI prompt. The system asks players if they would like to spawn now or be asked again after a delay, allowing players to adjust their loadout and settings at the deploy screen without being locked out.

The spawning system uses an intelligent algorithm to find safe spawn points that are appropriately distanced from other players, reducing the chance of spawning directly into combat while maintaining reasonable spawn times.

### Example

```ts
import { FFASpawning } from 'bf6-portal-utils/ffa-spawning';
import { UI } from 'bf6-portal-utils/ui';

// Define your spawn points
const SPAWN_POINTS: FFASpawning.SpawnData[] = [
    [100, 0, 200, 0], // x = 100, y = 0, z = 200, orientation = 0 (North)
    [-100, 0, 200, 90], // x = -100, y = 0, z = 200, orientation = 90 (East)
    [0, 0, -200, 180], // x = 0, y = 0, z = -200, orientation = 180 (South)
    [-200, 100, 300, 270], // x = -200, y = 100, z = 300, orientation = 270 (West)
    // ... more spawn points
];

export async function OnGameModeStarted(): Promise<void> {
    // Initialize the spawning system
    FFASpawning.Soldier.initialize(SPAWN_POINTS, {
        minimumSafeDistance: 20, // Optional override (default 20)
        maximumInterestingDistance: 40, // Optional override (default 40)
        safeOverInterestingFallbackFactor: 1.5, // Optional override (default 1.5)
        maxSpawnCandidates: 12, // Optional override (default 12)
        initialPromptDelay: 10, // Optional override (default 10 seconds)
        promptDelay: 10, // Optional override (default 10 seconds)
        queueProcessingDelay: 1, // Optional override (default 1 second)
    });

    // Enable spawn queue processing
    FFASpawning.Soldier.enableSpawnQueueProcessing();

    // Optional: Configure logging for spawn system debugging
    FFASpawning.setLogging((text) => console.log(text), FFASpawning.LogLevel.Info);
}

export async function OnPlayerJoinGame(eventPlayer: mod.Player): Promise<void> {
    // Create a FFASpawning.Soldier instance for each player
    // Pass `true` as the second parameter to enable debug position display (useful for finding spawn points).
    const soldier = new FFASpawning.Soldier(eventPlayer, false);

    // Start the delay countdown for the player.
    soldier.startDelayForPrompt();
}

export async function OnPlayerUndeploy(eventPlayer: mod.Player): Promise<void> {
    // Start the delay countdown when a player undeploys (is ready to deploy again).
    FFASpawning.Soldier.startDelayForPrompt(eventPlayer);
}

export async function OnPlayerUIButtonEvent(
    player: mod.Player,
    widget: mod.UIWidget,
    event: mod.UIButtonEvent
): Promise<void> {
    // Required: Handle button clicks for the spawn UI
    await UI.handleButtonEvent(player, widget, event);
}
```

## Debugging & Development Tools

### Debug Position Display

The `Soldier` constructor accepts an optional `showDebugPosition` parameter (default: `false`) that enables a real-time position display for developers. When enabled, the player's X, Y, and Z coordinates are displayed at the bottom center of the screen, updating every second.

**Use Case**: This feature is intended for developers who want to move around maps to find and document spawn positions, as Battlefield Portal does not provide a built-in way to display coordinates in-game.

**Coordinate Format**: Coordinates are scaled by 100 and truncated (using integer truncation) to avoid Portal's decimal display issues. For example:

- A position of `-100.24` will be displayed as `-10024`
- A position of `50.67` will be displayed as `5067`

To convert back to the actual world coordinates, divide the displayed value by 100.

**Example Usage**:

```ts
export async function OnPlayerJoinGame(eventPlayer: mod.Player): Promise<void> {
    // Enable debug position display for development/testing for the first joining player (usually the admin).
    const soldier = new FFASpawning.Soldier(eventPlayer, mod.GetObjId(eventPlayer) === 0);

    soldier.startDelayForPrompt();
}
```

### Required Event Handlers

1. **`OnGameModeStarted()`** – Call `FFASpawning.Soldier.initialize()` with your spawn points and `FFASpawning.Soldier.enableSpawnQueueProcessing()` to start the system.
2. **`OnPlayerJoinGame()`** – Create a new `FFASpawning.Soldier` instance for each player.
3. **`OnPlayerJoinGame()`** – Call `FFASpawning.Soldier.startDelayForPrompt()` to begin the spawn flow for new players.
4. **`OnPlayerUndeploy()`** – Call `FFASpawning.Soldier.startDelayForPrompt()` to restart the spawn flow when players die or undeploy.
5. **`OnPlayerUIButtonEvent()`** – Register `UI.handleButtonEvent()` to handle button presses from the spawn UI.

## Known Limitations & Caveats

- **Rare Spawn Overlaps** – In rare cases, especially with many players and few spawn points, players may spawn on top of each other if no safe spawn point is found within `maxSpawnCandidates` iterations. Consider adjusting `maxSpawnCandidates` via the `initialize()` options or adding more spawn points to mitigate this.
- **UI Input Mode** – The system delegates automatic `mod.EnableUIInputMode()` management to the `UI` module. Be careful not to conflict with other UI systems that do not use the `UI` module that also control input mode.
- **HQ Disabling** – The system automatically disables both team HQs during initialization. If you need team-based spawning elsewhere, you'll need to re-enable HQs manually (but you really should not be mixing this with other systems unless you know what you are doing).
- **Spawn Point Cleanup** – Spawn points created during initialization are not automatically cleaned up. This is typically fine as they persist for the duration of the match.

---

## Module: logger

This TypeScript `Logger` class removes the biggest Battlefield Portal debugging pain point: until now you could only display strings that were pre-uploaded to the Experience website via a `strings.json` file, and displaying concatenated string with more than 3 parts was tricky, if not impossible. Further, `console.log` is only available for PC users, with a file written to their filesystem. By pairing a lightweight UI window with the `logger.strings.json` character map, this module lets you log any runtime text (errors, telemetry, formatted data, etc.) directly to the screen, even on console builds.

- **Dynamic mode** behaves like a scrolling console, always appending at the bottom and pushing older rows upward.
- **Static mode** lets you target a specific row index (e.g., keep player position on row 10 while other diagnostics fill lines 0‑9).

## Usage Patterns

- **Static dashboards** – Pin persistent diagnostics (positions, squad metadata, timers) to precise rows.
- **Dynamic consoles** – Stream verbose traces (button clicks, state transitions, error stacks) without worrying about pre-provisioned strings.
- **Multiple Instances** – Keep both modes active: e.g., static logger on the left for gauges, dynamic logger on the right for realtime traces.
- **Performance considerations** – For long text messages or tall dynamic loggers, use `logAsync()` instead of `log()`. Long text can result in many 3-character Text UI Widgets, and in dynamic mode, moving all existing rows upward requires many UI operations. By using `logAsync()` without `await`, the logging operation becomes non-blocking by being sent to the microtask queue, preventing frame drops or execution delays.

### Example

```ts
import { Logger } from 'bf6-portal-utils/logger';
import { UI } from 'bf6-portal-utils/ui';

let staticLogger: Logger | undefined;
let dynamicLogger: Logger | undefined;

export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
    if (!staticLogger) {
        staticLogger = new Logger(eventPlayer, {
            staticRows: true,
            visible: true,
            anchor: mod.UIAnchor.TopLeft,
            width: 600,
        });
        dynamicLogger = new Logger(eventPlayer, { staticRows: false, visible: true, anchor: mod.UIAnchor.TopRight });
    }

    // While logAsync is preferred, you can still use log() for short messages if order guarantees matter.
    dynamicLogger?.log(`Player: ${mod.GetObjId(player)}`);
    dynamicLogger?.log(`Team: ${mod.GetObjId(mod.GetTeam(player))}`);
    dynamicLogger?.log(`Hello @ world $${(12345.6789).toFixed(2)}!!`);

    // For long messages or performance-critical paths, always use logAsync (non-blocking).
    dynamicLogger?.logAsync(`Very long diagnostic message that will create many UI widgets...`);

    while (true) {
        const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

        const x = mod.XComponentOf(position).toFixed(2);
        const y = mod.YComponentOf(position).toFixed(2);
        const z = mod.ZComponentOf(position).toFixed(2);

        staticLogger?.log(`Position: <${x},${y},${z}>`, 13);

        await mod.Wait(0.5);

        if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsReloading)) continue;
    }
}
```

---

## Module: logging

This TypeScript `Logging` class provides a fail-safe logging abstraction for Battlefield Portal experience developers. It abstracts away the logic to log text and errors to an arbitrary logging method in a fail-safe way, with configurable log level filtering. The class can be used directly within a BF6 Portal experience or can be used within other modules to provide consistent, safe logging functionality.

Key features include fail-safe error handling that prevents logging failures from crashing your mod, configurable log level filtering to control verbosity, optional error message inclusion, support for both synchronous and asynchronous logger functions, and automatic error-to-string conversion that safely handles any error type.

### Example: Direct Usage in Portal Experience

```ts
import { Logging } from 'bf6-portal-utils/logging';

const logging = new Logging('MyMod');

export async function OnGameModeStarted(): Promise<void> {
    // Set up logging with console.log, minimum log level of Warning, and include errors
    logging.setLogging((text) => console.log(text), Logging.LogLevel.Warning, true);

    // Log an info message
    logging.log('Game mode started', Logging.LogLevel.Info); // Won't be logged

    if (!someCheck()) {
        // Log an warning message
        logging.log('Some check failed', Logging.LogLevel.Warning);
    }

    // Log an error with an error object
    try {
        someRiskyOperation();
    } catch (error) {
        logging.log('Failed to perform operation', Logging.LogLevel.Error, error);
    }

    // Debug messages won't be logged if log level is Warning or higher
    logging.log('Debug information', Logging.LogLevel.Debug); // Won't be logged
}
```

### Example: Usage Within a Module

```ts
import { Logging } from '../logging/index.ts';

export namespace MyModule {
    const logging = new Logging('MyModule');

    /**
     * Re-export LogLevel enum for convenience for controlling logging verbosity.
     */
    export const LogLevel = Logging.LogLevel;

    /**
     * Attaches a logger and defines a minimum log level and whether to include the runtime error in the log.
     * @param log - The logger function to use. Pass undefined to disable logging.
     * @param logLevel - The minimum log level to use.
     * @param includeError - Whether to include the runtime error in the log.
     */
    export function setLogging(
        log?: (text: string) => Promise<void> | void,
        logLevel?: Logging.LogLevel,
        includeError?: boolean
    ): void {
        logging.setLogging(log, logLevel, includeError);
    }

    export function doSomething(): void {
        // Use the logging internally
        logging.log('Doing something', Logging.LogLevel.Info);
    }
}

// Usage in experience:
// MyModule.setLogging((text) => console.log(text), MyModule.LogLevel.Info);
```

## Usage Patterns

### Basic Logging

```ts
import { Logging } from 'bf6-portal-utils/logging';

const logging = new Logging('MyMod');

export async function OnGameModeStarted(): Promise<void> {
    // Set up logging
    logging.setLogging((text) => console.log(text), Logging.LogLevel.Info);

    // Log messages at different levels
    logging.log('Debug message', Logging.LogLevel.Debug); // Won't be logged (below Info)
    logging.log('Info message', Logging.LogLevel.Info); // Will be logged
    logging.log('Warning message', Logging.LogLevel.Warning); // Will be logged
    logging.log('Error message', Logging.LogLevel.Error); // Will be logged
}
```

### Error Logging

```ts
import { Logging } from 'bf6-portal-utils/logging';

const logging = new Logging('MyMod');

export async function OnGameModeStarted(): Promise<void> {
    // Enable error inclusion
    logging.setLogging(
        (text) => console.log(text),
        Logging.LogLevel.Warning,
        true // includeError = true
    );

    try {
        riskyOperation();
    } catch (error) {
        // Error will be appended to the log message
        logging.log('Operation failed', Logging.LogLevel.Error, error);
        // Output: <MyMod> Operation failed - Error: [error message]
    }
}
```

### Conditional Logging with `willLog()`

```ts
import { Logging } from 'bf6-portal-utils/logging';

const logging = new Logging('MyMod');

export async function OnGameModeStarted(): Promise<void> {
    logging.setLogging((text) => console.log(text), Logging.LogLevel.Warning);

    // Avoid expensive string building if logging won't occur
    if (logging.willLog(Logging.LogLevel.Debug)) {
        const expensiveData = buildExpensiveDebugString();
        logging.log(expensiveData, Logging.LogLevel.Debug);
    }
}
```

### Async Logger Functions

```ts
import { Logging } from 'bf6-portal-utils/logging';

const logging = new Logging('MyMod');

async function asyncLogger(text: string): Promise<void> {
    // Simulate async logging (e.g., sending to external service)
    await someAsyncLoggingService.log(text);
}

export async function OnGameModeStarted(): Promise<void> {
    // Async loggers are fully supported
    logging.setLogging(asyncLogger, Logging.LogLevel.Info);

    // If the async logger rejects, it's caught and logged to console
    logging.log('This will be sent async', Logging.LogLevel.Info);
}
```

### Disabling Logging

```ts
import { Logging } from 'bf6-portal-utils/logging';

const logging = new Logging('MyMod');

export async function OnGameModeStarted(): Promise<void> {
    // Initially enable logging
    logging.setLogging((text) => console.log(text), Logging.LogLevel.Info);

    logging.log('This will be logged', Logging.LogLevel.Info);

    // Disable logging by passing undefined
    logging.setLogging(undefined);

    logging.log('This will not be logged', Logging.LogLevel.Info);
}
```

## Known Limitations & Caveats

- **Error String Conversion Limitations** – While the class safely converts errors to strings, complex error objects may lose information in the conversion process. Only the error message (for `Error` instances) or the result of `String()` conversion is preserved. Also, while a logger like `console.log` can easily accept complex and log error objects or strings, other UI loggers (like the `Logger` module) may not, so consider `includeError = false` unless necessary.

- **Async Logger Timing** – If a logger function returns a `Promise`, the `log()` method does not await it. The promise is handled in a fire-and-forget manner to prevent blocking. This means you cannot rely on the log operation completing before your code continues.

---

## Module: map-detector

This TypeScript `MapDetector` class enables Battlefield Portal experience developers to detect the current map by analyzing the coordinates of Team 1's Headquarters (HQ). This utility is necessary because `mod.IsCurrentMap` from the official Battlefield Portal API is currently broken and unreliable.

### Example

```ts
import { MapDetector } from 'bf6-portal-utils/map-detector';

export async function OnGameModeStarted(): Promise<void> {
    // Optional: Configure logging for map detection debugging
    MapDetector.setLogging((text) => console.log(text), MapDetector.LogLevel.Warning);

    // Get the current map as a MapDetector.Map enum
    const map = MapDetector.currentMap();

    if (map == MapDetector.Map.Downtown) {
        // Handle Downtown-specific logic
    }

    // Get the current map as a mod.Maps enum (native API)
    const nativeMap = MapDetector.currentNativeMap();

    if (nativeMap == mod.Maps.Granite_MainStreet) {
        // Handle using native enum
    }

    // Get the current map as a string
    const mapName = MapDetector.currentMapName();
    console.log(`Current map: ${mapName}`);

    // Check if current map matches a specific map
    if (MapDetector.isCurrentMap(MapDetector.Map.Eastwood)) {
        // Eastwood-specific setup
    }

    // Get HQ coordinates for debugging
    const hq = MapDetector.getHQCoordinates(2);
    console.log(`HQ position: <${hq.x}, ${hq.y}, ${hq.z}>`);
}
```

## Supported Maps

The `MapDetector` class supports detection of the following maps via the `MapDetector.Map` enum:

- Area 22B (see [Missing Maps in Native Enum](#missing-maps-in-native-enum))
- Blackwell Fields
- Defense Nexus
- Downtown
- Eastwood
- Empire State
- Golf Course
- Iberian Offensive
- Liberation Peak
- Manhattan Bridge
- Marina
- Mirak Valley
- New Sobek City
- Operation Firestorm
- Portal Sandbox
- Redline Storage (see [Missing Maps in Native Enum](#missing-maps-in-native-enum))
- Saints Quarter
- Siege of Cairo

---

## Known Limitations

### Missing Maps in Native Enum

The maps **"Area 22B"** and **"Redline Storage"** are not available in the native `mod.Maps` enum due to an oversight in the Battlefield Portal API. As a result:

- `MapDetector.currentNativeMap` will return `undefined` for these maps (they are not present in `mod.Maps`).
- `MapDetector.isCurrentNativeMap()` will always return `false` for these maps when checking against any `mod.Maps` value.
- `MapDetector.currenMap` and `MapDetector.isCurrentMap` **will behave correctly for these maps**.

Therefore, use `MapDetector.Map` enum values and the `isCurrentMap()` method when working with these maps (or preferably, for all maps).

### Detection Method

The detector identifies maps primarily by the X-coordinate of Team 1's HQ, with Y-coordinate used for disambiguation in two cases (Mirak Valley vs New Sobek City). If custom spatial data or modifications have moved the HQ from its default position, detection will fail and all getters will return `undefined`.

---

## Module: multi-click-detector

This TypeScript `MultiClickDetector` class enables Battlefield Portal experience developers to detect when a player has rapidly triggered a soldier state multiple times in quick succession. The detector can monitor any soldier state boolean from `mod.SoldierStateBool`, allowing you to detect multi-click sequences for various player actions.

The detector tracks soldier state transitions for each player independently, counting rapid state changes within a configurable time window to determine when a multi-click sequence has been completed. Each detector instance is configured with runtime options (including which soldier state to monitor) and a callback that is triggered when a multi-click sequence is detected.

By default, the detector monitors `mod.SoldierStateBool.IsInteracting`, which is the most user-friendly option because the interact state goes `true` for 1 tick even when there is no object that can be interacted with nearby. This makes it ideal for detecting multi-click sequences without requiring physical interaction points, and is useful because there is no keybind Portal experience developers can hook into to open up a custom UI.

### Example

```ts
import { MultiClickDetector } from 'bf6-portal-utils/multi-click-detector';

// Optional: Configure logging for detector callback error monitoring
MultiClickDetector.setLogging((text) => console.log(text), MultiClickDetector.LogLevel.Error);

export async function OnPlayerJoinGame(player: mod.Player): Promise<void> {
    const playerId = mod.GetObjId(player);

    // Create a detector instance for this player
    // Callbacks can be synchronous or asynchronous (return void or Promise<void>)
    new MultiClickDetector(
        player,
        () => {
            // Player has successfully performed a multi-click sequence
            // Open custom UI, trigger special action, etc.
            console.log(`Player ${playerId} performed multi-click!`);
            openCustomMenu(player);
        },
        {
            soldierState: mod.SoldierStateBool.IsInteracting,
            windowMs: 1_000, // 1 second window
            requiredClicks: 3, // 3 clicks required
        }
    );
}

export function OngoingPlayer(player: mod.Player): void {
    // Handle ongoing player event for all detectors tracking this player
    MultiClickDetector.handleOngoingPlayer(player);
}

export async function OnPlayerLeaveGame(player: mod.Player): Promise<void> {
    MultiClickDetector.pruneInvalidPlayers();
}
```

## Usage Patterns

- **Basic Detection** – Create a detector instance for a player with a callback. The callback is triggered when the required number of state changes is detected within the time window.

- **Multiple Detectors per Player** – Create multiple detector instances for the same player with different configurations (e.g., 4 clicks of Sprint to open a menu, 3 clicks Interact to use an ability). Each detector operates independently.

- **Custom Configuration** – Use the `Options` interface to customize the soldier state, time window, and required clicks for each detector instance.

- **Detector Cleanup** – To prevent memory leaks, always call `destroy()` on detector instances when they're no longer needed and/or use `pruneInvalidPlayers()` to clean up all invalid players at once (e.g., when a player leaves the game).

- **Error Logging** – Configure logging using `setLogging()` to monitor callback errors and debug detector behavior during development.

### Example: Multiple Detectors per Player

```ts
import { MultiClickDetector } from 'bf6-portal-utils/interact-multi-click-detector';

export async function OnPlayerDeployed(player: mod.Player): Promise<void> {
    // Create a detector for opening a menu (4 clicks)
    const menuDetector = new MultiClickDetector(player, () => openCustomMenu(player), {
        soldierState: mod.SoldierStateBool.IsSprinting,
        requiredClicks: 4,
        windowMs: 1_500, // Longer window for 4 clicks
    });

    // Create a detector for activating a special ability (3 clicks)
    const abilityDetector = new MultiClickDetector(player, () => activateSpecialAbility(player), {
        soldierState: mod.SoldierStateBool.IsInteracting,
        requiredClicks: 3,
        windowMs: 1_000,
    });
}

export function OngoingPlayer(player: mod.Player): void {
    MultiClickDetector.handleOngoingPlayer(player);
}

export async function OnPlayerLeaveGame(eventNumber: number): Promise<void> {
    MultiClickDetector.pruneInvalidPlayers();
}
```

### Example: Async Callback Handling

```ts
import { MultiClickDetector } from 'bf6-portal-utils/interact-multi-click-detector';

export async function OnPlayerDeployed(player: mod.Player): Promise<void> {
    // Callbacks can now return Promise<void> directly - errors are automatically caught and logged
    const detector = new MultiClickDetector(player, async () => {
        // Async operations here - errors are automatically caught and logged if logging is configured
        await loadPlayerData(player);
        await openCustomUI(player);
    });
}

export function OngoingPlayer(player: mod.Player): void {
    MultiClickDetector.handleOngoingPlayer(player);
}

export async function OnPlayerLeaveGame(eventNumber: number): Promise<void> {
    MultiClickDetector.pruneInvalidPlayers();
}
```

## Choosing a Soldier State

The detector can monitor any soldier state boolean from `mod.SoldierStateBool`, but not all states are equally suitable for multi-click detection. This section explains which states work best and why.

### Recommended: `IsInteracting` (Default)

**Why it's the best choice:**

- **No visual side effects** – When a player rapidly presses the interact key, the interact state goes `true` for 1 ticks even when there is no object or interaction points that can be interacted with nearby. This means players can perform multi-click sequences without any visual feedback or character movement, making it feel like a hidden input method.
- **No gameplay impact** – Unlike other states, rapid interact presses don't cause the player's character to perform any actions that could interfere with gameplay.
- **Caveat** - Players must have their `Interact` keybind set to `Tap`, not `Hold`.

**Use case:** Opening custom menus, triggering special abilities, or any action where you want a hidden input method that doesn't affect the player's character visually or mechanically.

### Secondary Options: `IsCrouching` and `IsSprinting`

**Why they work but have drawbacks:**

- **Rapid toggling is possible** – Both `IsCrouching` and `IsSprinting` can be rapidly toggled by players, making them technically viable for multi-click detection.
- **Visual jittering** – Rapidly toggling these states causes the player's character to visually jitter as it tries to crouch/uncrouch or sprint/walk in quick succession. This can be distracting and may interfere with gameplay.
- **Gameplay impact** – The character actually performs these actions, which may not be desirable if you're just trying to detect input for a UI or special ability.
- **Benefit** - Unlike requiring players to ensure their `Interact` keybind set to `Tap`, it is more likely players can already quickly toggle `Sprint` or `Crouch` with their existing keybind settings.

**Use case:** Consider these if you need more than one multi-click detection (and you've already used the `IsInteracting` state), or if you are comfortable forcing players to physically jitter a bit, but not have to change their `Interact` keybind set to `Tap`.

- **Memory Considerations** – You should not hold onto the detector reference returned form the `new MultiClickDetector` call unless you expressly plan on destroying it later with `destroy()` and discarding the reference. It is recommended to call `MultiClickDetector.pruneInvalidPlayers()` in the `OnPlayerLeaveGame` event handler. Following this advice will avoid memory leaks and will prevent callback references from being retained in memory.

---

## Module: performance-stats

This TypeScript `PerformanceStats` class enables Battlefield Portal experience developers to monitor and track the estimated runtime tick rate of the server their experience is running on. The utility provides real-time performance metrics that can help identify when the server is under stress or when script callbacks are being deprioritized by the game engine.

The system uses a sampling approach to calculate tick rate by counting ticks over a configurable time window, providing a "virtual rate" metric that reflects the actual performance of your script's execution environment.

It is not recommended to use this module in its current state as it lacks core functionality to return meaningful metrics.

---

## Module: raycast

This TypeScript `Raycast` class abstracts the raycasting functionality of BF6 Portal and handles attributing raycast hits and misses to the correct raycasts created, since the native functionality does not do this. This significantly improves the developer experience, along with being able to pass hit and miss callbacks, which makes code more readable and modular.

### Example

```ts
import { Raycast } from 'bf6-portal-utils/raycast';

// Optional: Configure logging for raycast callback error monitoring
Raycast.setLogging((text) => console.log(text), Raycast.LogLevel.Error);

export function OnRayCastHit(eventPlayer: mod.Player, eventPoint: mod.Vector, eventNormal: mod.Vector): void {
    // Required: Forward the event to Raycast so it can attribute the hit to the correct ray
    Raycast.handleHit(eventPlayer, eventPoint, eventNormal);
}

export function OnRayCastMissed(eventPlayer: mod.Player): void {
    // Required: Forward the event to Raycast so it can attribute the miss to the correct ray
    Raycast.handleMiss(eventPlayer);
}

export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
    const playerPosition = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.GetPosition);

    // Cast a ray from the player's position forward to detect obstacles
    const forwardDirection = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.GetDirection);
    const rayEnd = mod.VectorAdd(playerPosition, mod.VectorScale(forwardDirection, 100));

    Raycast.cast(
        eventPlayer,
        {
            x: mod.XComponentOf(playerPosition),
            y: mod.YComponentOf(playerPosition),
            z: mod.ZComponentOf(playerPosition),
        },
        {
            x: mod.XComponentOf(rayEnd),
            y: mod.YComponentOf(rayEnd),
            z: mod.ZComponentOf(rayEnd),
        },
        {
            onHit: async (hitPoint, normal) => {
                // Called when the ray hits a target
                // Callbacks can be synchronous or asynchronous (return void or Promise<void>)
                console.log(`Ray hit at <${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z}>`);
                console.log(`Surface normal: <${normal.x}, ${normal.y}, ${normal.z}>`);
            },
            onMiss: () => {
                // Called when the ray misses (no target found)
                // Callbacks can be synchronous or asynchronous (return void or Promise<void>)
                console.log('Ray missed - no obstacle detected');
            },
        }
    );
}
```

## Usage Patterns

- **Obstacle Detection** – Cast rays from players to detect walls, terrain, or other obstacles ahead of them.
- **Line of Sight Checks** – Verify if a player has line of sight to another player or target.
- **Weapon Targeting** – Use raycasts to determine where a weapon shot would hit before actually firing.
- **Spawn Point Validation** – Check if a potential spawn location is clear of obstacles before spawning a player.
- **Interactive Objects** – Detect what objects a player is looking at or pointing at for interaction systems.

### Example: Line of Sight Check

Note: This example is not technically a sufficient LOS check implementation as it does not correctly use the player's eye position, nor does it take into account if the target is without a cone of view of the player's eye direction.

```ts
import { Raycast } from 'bf6-portal-utils/raycast';

function checkLineOfSight(player: mod.Player, target: mod.Player): Promise<boolean> {
    return new Promise((resolve) => {
        const playerPos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
        const targetPos = mod.GetSoldierState(target, mod.SoldierStateVector.GetPosition);

        Raycast.cast(player, playerPos, targetPos, {
            onHit: async (hitPoint) => {
                // Ray hit something - check if it's the target (within 1 meter)
                // Since we passed mod.Vector for start/end, hitPoint is also mod.Vector
                // Callbacks can be async (return Promise<void>) or sync (return void)
                const dx = mod.XComponentOf(hitPoint) - mod.XComponentOf(targetPos);
                const dy = mod.YComponentOf(hitPoint) - mod.YComponentOf(targetPos);
                const dz = mod.ZComponentOf(hitPoint) - mod.ZComponentOf(targetPos);
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                // If hit point is close to target, we have line of sight
                resolve(distance < 1.0);
            },
            onMiss: () => {
                // Ray missed - no line of sight (obstacle or ray expired)
                // Callbacks can be async (return Promise<void>) or sync (return void)
                resolve(false);
            },
        });
    });
}
```

### Example: Optional Player Cleanup

```ts
import { Raycast } from 'bf6-portal-utils/raycast';

export function OnPlayerLeaveGame(eventNumber: number): void {
    // Clean up expired rays for all players.
    // (Note: This is optional since automatic pruning runs every 5 seconds)
    Raycast.pruneAllStates();
}
```

## Known Limitations & Caveats

- **Multiple Simultaneous Rays** – The class can handle multiple rays from the same player, but if many rays are cast in quick succession, the geometric attribution algorithm may become less efficient. In practice, this is rarely an issue since the linear scan is very fast for small ray counts.

- **Miss Attribution Ambiguity** – The native API doesn't distinguish which specific ray missed, so the class uses a counting heuristic. In rare cases with many simultaneous rays, misses may be attributed slightly later than ideal, but they will always be correctly resolved.

- **TTL Precision** – Expired rays trigger their miss callbacks after the TTL expires, not at the exact expiration time. The actual cleanup happens during pruning operations (every 5 seconds) or lazy pruning (before adding new rays).

- **Callback Errors** – Callback errors (both synchronous and asynchronous) are automatically caught and logged (if logging is configured via `Raycast.setLogging()`) to prevent one failing callback from breaking the entire raycast system. Errors are logged at the `Error` log level. If you need additional error handling, implement it inside your callbacks.

- **Player State Cleanup** – While automatic pruning runs every 5 seconds, it's good practice to call `pruneAllStates()` in `OnPlayerLeaveGame()` to immediately clean up state for disconnected players.

- **Distance Epsilon** – The hit attribution uses a 0.5m (`_DISTANCE_EPSILON`) sanity cap for distance comparisons. The algorithm finds the best-fitting ray (lowest error) among all candidates, and only considers rays where the error is within this tolerance. This acts as a sanity check to prevent misattribution rather than a strict matching threshold.

---

## Module: scavenger-drop

This TypeScript `ScavengerDrop` class provides functionality for Battlefield Portal experiences to detect when a player scavenges a dead player's kit bag. In Battlefield 6, when a player dies, they drop a bag containing their kit that despawns after approximately 37 seconds. Players can pick up weapons from these bags, but the default behavior does not replenish the scavenging player's ammo. This module allows you to perform custom actions (such as resupplying ammo, displaying messages, or any other logic) when the first player gets within 2 meters of a dead player's body.

**Why use ScavengerDrop?** The `ScavengerDrop` module offers significant advantages: automatic detection of players scavenging dead bodies, performance-optimized checking that scales frequency based on proximity, support for custom callbacks to handle scavenging events, and automatic cleanup when drops expire or are scavenged. Ideal for ammo resupply systems, custom loot mechanics, achievement tracking, or any scenario where you need to detect and respond to players picking up dropped kits.

Key features include adaptive check frequency that increases as players get closer to drops (reducing overhead when drops are far away), automatic expiration after the configured duration (defaulting to 37 seconds to match the game's bag despawn time), graceful error handling that prevents callback failures from crashing your mod, and configurable logging for debugging scavenger drop behavior. The module uses the `Timers` module for interval management and the `Logging` module for internal logging.

### Example

```ts
import { ScavengerDrop } from 'bf6-portal-utils/scavenger-drop';

// Optional: Configure logging for scavenger drop monitoring
ScavengerDrop.setLogging((text) => console.log(text), ScavengerDrop.LogLevel.Info);

export function OnPlayerDied(
    victim: mod.Player,
    killer: mod.Player,
    deathType: mod.DeathType,
    weapon: mod.WeaponUnlock
): void {
    // Create a scavenger drop that triggers when a player gets within 2 meters
    // Callbacks can be synchronous or asynchronous (return void or Promise<void>)
    new ScavengerDrop(victim, (scavenger: mod.Player) => {
        // Resupply the scavenger's ammo
        mod.Resupply(scavenger, mod.ResupplyTypes.AmmoCrate);

        // Display a message to the scavenger
        mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.scavengerLog), scavenger); // 'Scavenged ammo'
    });
}
```

## Usage Patterns

- **Basic ammo resupply** – Use `mod.Resupply()` in the callback to give players full ammo when they scavenge a kit.
- **Custom ammo management** – Use `mod.SetInventoryAmmo()` and `mod.SetInventoryMagazineAmmo()` for fine-grained ammo control.
- **Player notifications** – Use `mod.DisplayHighlightedWorldLogMessage()` to inform players when they scavenge a kit.
- **Kill Confirmed** – Spawn an item on the dead body and give points to the player or team that confirms the kill.
- **Achievement tracking** – Track scavenging events for statistics or achievements.
- **Custom loot systems** – Implement custom loot mechanics beyond the default kit bag behavior.
- **Drop cleanup** – Use `stop()` to manually cancel drops when needed (e.g., if a player respawns before the drop expires).

### Example: Custom Duration and Check Interval and Async Callback Handling

```ts
import { ScavengerDrop } from 'bf6-portal-utils/scavenger-drop';

export function OnPlayerDied(
    victim: mod.Player,
    killer: mod.Player,
    deathType: mod.DeathType,
    weapon: mod.WeaponUnlock
): void {
    // Create a drop that lasts 20 seconds with checks every 100ms if a player is nearby.
    new ScavengerDrop(
        victim,
        async (scavenger: mod.Player) => {
            // Perform async operations
            await someAsyncOperation();

            mod.Resupply(scavenger, mod.ResupplyTypes.AmmoBox);

            // Log to external service, update statistics, etc.
            await logScavengeEvent(scavenger, victim);
        },
        {
            duration: 20_000, // 20 seconds
            checkInterval: 100, // 100ms base check interval
        }
    );
}
```

## Known Limitations & Caveats

- **Position Capture** – The drop captures the position of the dead player's body at creation time. If the body moves (e.g., due to physics or explosions), the drop will continue checking the original position. Always create the drop immediately in `OnPlayerDied` to ensure the position is accurate.

- **Single Trigger** – Each drop triggers its callback only once—when the first player gets within 2 meters. If multiple players are close when the check occurs, only the closest player triggers the callback. If you need to handle multiple scavengers, create multiple drops or implement custom logic in your callback.

- **Distance Precision** – The 2-meter threshold is fixed and cannot be configured. The threshold matches typical interaction ranges in Battlefield Portal that feel reasonable and ergonomic.

- **Check Interval Precision** – The actual check frequency adapts based on player proximity, but the base `checkInterval` determines the minimum time between checks. Timer precision depends on `mod.Wait()`'s precision (used by the `Timers` module), which may vary slightly based on game performance and frame timing.

- **Performance Considerations** – While the adaptive check frequency reduces overhead, creating many drops simultaneously (e.g., during intense combat with many deaths) will still create multiple interval timers. The module is optimized for typical gameplay scenarios, but extreme cases with hundreds of concurrent drops may impact performance.

- **Async Callbacks** – Callbacks can be synchronous or asynchronous (returning `void` or `Promise<void>`). Async callbacks are not awaited by the drop, meaning:
    - The drop doesn't wait for async operations to complete before cleaning up
    - Errors or rejections from async callbacks are automatically caught and logged (if logging is configured)
    - If you need to await async operations, handle that inside your callback

- **Concurrent Drops** – Multiple drops can exist simultaneously and operate independently. Each drop maintains its own timers and state. There is no built-in limit on the number of concurrent drops.

---

## Module: solid-ui

This TypeScript `SolidUI` namespace provides a reactive UI framework for Battlefield Portal, inspired by [SolidJS](https://github.com/solidjs/solid). Unlike traditional frameworks that re-render entire components, `SolidUI` uses fine-grained reactivity to update only the specific UI properties that change, resulting in minimal overhead and maximum performance.

`SolidUI` is a from-scratch implementation of reactive primitives (signals, effects, memos, stores) adapted for the Battlefield Portal environment. It uses a HyperScript-like factory function (`h`) instead of JSX/TSX, and integrates seamlessly with the [`UI`](../ui/README.md) module to create dynamic, reactive user interfaces. The module uses the `Logging` module for internal logging, allowing you to monitor effect errors and debug reactive system behavior.

### Example

**File: `src/index.ts`**

```ts
import { SolidUI } from 'bf6-portal-utils/solid-ui';
import { UI } from 'bf6-portal-utils/ui';

// Optional: Configure logging for reactive system error monitoring
SolidUI.setLogging((text) => console.log(text), SolidUI.LogLevel.Error);

function createCounterUI(player: mod.Player): void {
    // Create a reactive signal
    const [count, setCount] = SolidUI.createSignal(0);

    // Create a container with reactive visibility
    const container = SolidUI.h(
        UI.Container,
        {
            width: 200,
            height: 100,
            bgColor: UI.COLORS.BLACK,
            bgAlpha: 0.8,
            visible: true,
        },
        player
    );

    // Create text that updates when count changes
    SolidUI.h(UI.Text, {
        parent: container,
        message: () => mod.Message(mod.stringkeys.count, count()), // Accessor function
        textSize: 30,
        textColor: UI.COLORS.WHITE,
    });

    // Create a button that increments the count
    SolidUI.h(UI.TextButton, {
        parent: container,
        y: 50,
        width: 150,
        height: 40,
        message: mod.Message(mod.stringkeys.increment),
        onClick: async () => {
            setCount((c) => c + 1); // Update signal
        },
    });
}
```

**File: `src/strings.json`**

```json
{
    "count": "Count: {}",
    "increment": "Increment"
}
```

**Example:**

```ts
const [count, setCount] = SolidUI.createSignal(0);

// Read the value (subscribes if called inside an effect or reactive property)
console.log(count()); // 0

// Update with a value
setCount(5);

// Update with a function (receives previous value)
setCount((prev) => prev + 1);
```

**Usage in UI:**

```ts
const [isVisible, setVisible] = SolidUI.createSignal(false);

const container = SolidUI.h(UI.Container, {
    visible: isVisible, // Pass the accessor directly
    width: 200,
    height: 100,
});

// Later, update the signal
setVisible(true); // Container becomes visible automatically
```

**Example:**

```ts
const [count, setCount] = SolidUI.createSignal(0);

// Effect runs immediately and whenever count changes
const dispose = SolidUI.createEffect(() => {
    console.log(`Count is now: ${count()}`);
});

setCount(5); // Logs: "Count is now: 5"
setCount(10); // Logs: "Count is now: 10"

// Stop the effect
dispose();
```

**Note:** Effects created inside `SolidUI.h()` are automatically cleaned up when the UI element is deleted. You typically don't need to manually dispose of them unless creating standalone effects.

**Example:**

```ts
const [firstName, setFirstName] = SolidUI.createSignal('John');
const [lastName, setLastName] = SolidUI.createSignal('Doe');

// Create a memoized full name
const fullName = SolidUI.createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"

setFirstName('Jane');
console.log(fullName()); // "Jane Doe" (automatically recomputed)
```

**Usage in UI:**

```ts
const [health, setHealth] = SolidUI.createSignal(100);
const [maxHealth, setMaxHealth] = SolidUI.createSignal(100);

const healthPercent = SolidUI.createMemo(() => (health() / maxHealth()) * 100);

SolidUI.h(UI.Text, {
    message: () => mod.Message(mod.stringkeys.healthPercent, healthPercent().toFixed(1)),
    // Only recomputes when health or maxHealth changes
});
```

```json
{
    "healthPercent": "{}%"
}
```

**Example:**

```ts
const [state, setState] = SolidUI.createStore({
    user: {
        name: 'John',
        age: 30,
    },
    settings: {
        theme: 'dark',
    },
});

// Read values (automatically tracks which properties you access)
console.log(state.user.name); // "John"

// Update values using the setter
setState((s) => {
    s.user.name = 'Jane'; // Only effects reading user.name will run
});

// Update nested properties
setState((s) => {
    s.settings.theme = 'light'; // Only effects reading settings.theme will run
});
```

**Usage in UI:**

```ts
const [uiState, setUIState] = SolidUI.createStore({
    isVisible: false,
    counter: {
        value: 0,
        increment: 1,
    },
});

const container = SolidUI.h(UI.Container, {
    visible: () => uiState.isVisible, // Tracks isVisible property
    width: 200,
    height: 100,
});

SolidUI.h(UI.Text, {
    parent: container,
    message: () => mod.Message(mod.stringkeys.value, uiState.counter.value), // Tracks counter.value
});

// Update the store
setUIState((s) => {
    s.isVisible = true; // Only container visibility updates
    s.counter.value = 5; // Only text message updates
});
```

```json
{
    "value": "Value: {}"
}
```

**Example:**

```ts
// Create a theme context
const ThemeContext = SolidUI.createContext<'light' | 'dark'>('light');

// Provide a theme value
ThemeContext.provide('dark', () => {
    // All useContext(ThemeContext) calls inside this scope return 'dark'
    const container = SolidUI.h(UI.Container, {
        bgColor: () => {
            const theme = SolidUI.useContext(ThemeContext);
            return theme === 'dark' ? UI.COLORS.BLACK : UI.COLORS.WHITE;
        },
    });
});

// Use the context
const theme = SolidUI.useContext(ThemeContext); // Returns 'dark' if inside provide, 'light' otherwise
```

**Example:**

```ts
const [count, setCount] = SolidUI.createSignal(0);
const [timer, setTimer] = SolidUI.createSignal(0);

SolidUI.createEffect(() => {
    console.log(count()); // Tracks 'count'
    SolidUI.untrack(() => {
        console.log(timer()); // Logs 'timer' but doesn't track it
        // This effect won't re-run when timer changes
    });
});
```

**Example:**

```ts
SolidUI.h(
    UI.Container,
    {
        // ... props
    },
    player
);

// Inside the component setup (if using functional components):
SolidUI.onCleanup(() => {
    // This runs when the container is deleted
    console.log('Container cleaned up');
});
```

**Note:** Cleanup functions registered via `onCleanup` inside `SolidUI.h()` are automatically called when the UI element's `delete()` method is invoked.

**How Reactivity Works:**

1. When you pass a function as a property value, `SolidUI.h()` treats it as an accessor
2. It reads the initial value to set up the UI element
3. It creates an effect that watches the accessor
4. When the accessor's value changes, it updates only that specific property

**Example with Signals:**

```ts
const [count, setCount] = SolidUI.createSignal(0);
const [isVisible, setVisible] = SolidUI.createSignal(true);

const container = SolidUI.h(UI.Container, {
    visible: isVisible, // Reactive: updates when isVisible changes
    width: 200,
    height: 100,
    bgColor: UI.COLORS.BLACK,
});

SolidUI.h(UI.Text, {
    parent: container,
    message: () => mod.Message(mod.stringkeys.count, count()), // Reactive: updates when count changes
    textSize: 30,
});
```

```json
{
    "count": "Count: {}"
}
```

**Example with Stores:**

```ts
const [state, setState] = SolidUI.createStore({
    health: 100,
    color: UI.COLORS.WHITE,
});

SolidUI.h(UI.Text, {
    message: () => mod.Message(mod.stringkeys.health, state.message), // Tracks state.health
    textColor: () => state.color, // Tracks state.color
    textSize: 30,
});
```

```json
{
    "health": "Health: {}"
}
```

**Example with Functional Components:**

```ts
function MyButton(props: { team: number; onClick: () => void }) {
    return SolidUI.h(UI.TextButton, {
        message: mod.Message(mod.stringkeys.switchTeams, team),
        onClick: props.onClick,
        width: 200,
        height: 40,
    });
}

// Use the functional component
SolidUI.h(MyButton, {
    team: 1,
    onClick: async () => {
        console.log('Clicked!');
        mod.SetTeam(thisPlayer, mod.GetTeam(1));
    },
});
```

```json
{
    "switchTeams": "Switch to team {}"
}
```

**Important Notes:**

- Properties that are functions are automatically made reactive
- Properties that match the pattern `on[A-Z]` (start with lowercase "on" followed by an uppercase letter) are never made reactive and are always passed through as-is. This includes event handlers like `onClick`, `onHover`, `onDelete`, etc., but excludes properties like `onlyOnce`, `once`, or `online`
- All reactive effects are automatically cleaned up when the UI element is deleted
- You can mix static and reactive properties in the same props object

**Example:**

```ts
const [items, setItems] = SolidUI.createSignal([
    { id: 1, name: mod.Message(mod.stringkeys.team1) },
    { id: 2, name: mod.Message(mod.stringkeys.team2) },
    { id: 3, name: mod.Message(mod.stringkeys.team3) },
]);

const container = SolidUI.h(UI.Container, {
    width: 300,
    height: 400,
});

// Render a list of items
SolidUI.Index(
    items, // Accessor to the array
    (item, index) => {
        // item() returns the current value at this index
        // index is a static number (0, 1, 2, ...)
        return SolidUI.h(UI.Text, {
            parent: container,
            y: index * 50, // Position based on index
            message: () => item().name, // Reactive: updates when this item changes
            textSize: 24,
        });
    }
);

// Update the array
setItems([
    { id: 2, name: mod.Message(mod.stringkeys.team2Up) }, // Widget at index 0 updates
    { id: 1, name: mod.Message(mod.stringkeys.team1) }, // Widget at index 1 updates
    // Widget at index 2 is disposed (array shrunk)
]);

// Add new items
setItems((prev) => [
    ...prev,
    { id: 4, name: mod.Message(mod.stringkeys.team4) }, // New widget created at index 3
]);
```

```json
{
    "item1": "Item 1",
    "item2": "Item 2",
    "item3": "Item 3",
    "item4": "Item 4",
    "item2Up": "Item 2 Updated"
}
```

## Usage Patterns

### Basic Reactive UI

The simplest pattern: create signals and pass them as property values.

```ts
function createBasicUI(player: mod.Player): void {
    const [count, setCount] = SolidUI.createSignal(0);

    const container = SolidUI.h(
        UI.Container,
        {
            width: 200,
            height: 150,
            bgColor: UI.COLORS.BLACK,
            bgAlpha: 0.8,
        },
        player
    );

    SolidUI.h(UI.Text, {
        parent: container,
        message: () => mod.Message(mod.stringkeys.count, count()),
        textSize: 30,
        textColor: UI.COLORS.WHITE,
    });

    SolidUI.h(UI.TextButton, {
        parent: container,
        y: 50,
        width: 150,
        height: 40,
        message: mod.Message(mod.stringkeys.increment),
        onClick: async () => setCount((c) => c + 1),
    });
}
```

```json
{
    "count": "Count: {}",
    "increment": "Increment"
}
```

### Conditional Visibility

Use signals to control visibility and other conditional properties.

```ts
function createModalUI(player: mod.Player): void {
    const [isOpen, setIsOpen] = SolidUI.createSignal(false);

    const modal = SolidUI.h(
        UI.Container,
        {
            visible: isOpen, // Reactive visibility
            uiInputModeWhenVisible: true, // Automatically manages input mode
            width: 400,
            height: 300,
            bgColor: UI.COLORS.BLACK,
            bgAlpha: 0.9,
            bgFill: mod.UIBgFill.Blur,
        },
        player
    );

    SolidUI.h(UI.TextButton, {
        parent: modal,
        y: 120,
        width: 200,
        height: 50,
        message: mod.Message(mod.stringkeys.close),
        onClick: async () => setIsOpen(false),
    });

    // Function to toggle the modal visibility
    return () => setIsOpen(!isOpen());
}
```

```json
{
    "close": "Close"
}
```

### Derived State with Memos

Use memos to compute values that depend on multiple signals.

```ts
function createHealthBar(player: mod.Player): void {
    const [health, setHealth] = SolidUI.createSignal(100);
    const [maxHealth, setMaxHealth] = SolidUI.createSignal(100);

    // Compute health percentage
    const healthPercent = SolidUI.createMemo(() => (health() / maxHealth()) * 100);

    // Compute health color (red when low, green when high)
    const healthColor = SolidUI.createMemo(() => {
        const percent = healthPercent();
        if (percent < 25) return UI.COLORS.RED;
        if (percent < 50) return UI.COLORS.YELLOW;
        return UI.COLORS.GREEN;
    });

    const container = SolidUI.h(
        UI.Container,
        {
            width: 200,
            height: 20,
            bgColor: UI.COLORS.BF_GREY_3,
            bgAlpha: 0.8,
        },
        player
    );

    // Health bar (width based on percentage)
    SolidUI.h(UI.Container, {
        parent: container,
        width: () => healthPercent(), // Reactive width
        height: 20,
        bgColor: healthColor, // Reactive color
        bgAlpha: 1,
    });

    // Health text
    SolidUI.h(UI.Text, {
        parent: container,
        message: () => mod.Message(mod.stringkeys.health, health(), maxHealth()),
        textSize: 16,
        textColor: UI.COLORS.WHITE,
    });
}
```

```json
{
    "health": "{} / {}"
}
```

### Complex State with Stores

Use stores for nested state that needs fine-grained reactivity.

```ts
type GameState = {
    player: {
        name: string;
        score: number;
    };
    ui: {
        isMenuOpen: boolean;
        selectedTab: string;
    };
};

function createGameUI(player: mod.Player): void {
    const [state, setState] = SolidUI.createStore<GameState>({
        player: {
            name: 'Player',
            score: 0,
        },
        ui: {
            isMenuOpen: false,
            selectedTab: 'stats',
        },
    });

    // Menu container (only tracks ui.isMenuOpen)
    const menu = SolidUI.h(
        UI.Container,
        {
            visible: () => state.ui.isMenuOpen,
            width: 400,
            height: 500,
            bgColor: UI.COLORS.BLACK,
            bgAlpha: 0.9,
        },
        player
    );

    // Score display (only tracks player.score)
    SolidUI.h(UI.Text, {
        parent: menu,
        message: () => mod.Message(mod.stringkeys.score, state.player.score),
        textSize: 30,
        textColor: UI.COLORS.WHITE,
    });

    // Update only specific properties
    setState((s) => {
        s.player.score += 10; // Only score text updates
    });

    setState((s) => {
        s.ui.isMenuOpen = true; // Only menu visibility updates
    });
}
```

```json
{
    "score": "Score: {}"
}
```

### Dynamic Lists

Use `Index` to render lists that update efficiently.

```ts
type PlayerScore = {
    id: number;
    player: mod.Player;
    score: number;
};

function createScoreboard(player: mod.Player): void {
    const [scores, setScores] = SolidUI.createSignal<PlayerScore[]>([]);

    const container = SolidUI.h(
        UI.Container,
        {
            width: 300,
            height: 400,
            bgColor: UI.COLORS.BLACK,
            bgAlpha: 0.8,
        },
        player
    );

    // Render the list
    SolidUI.Index(scores, (playerScore, index) => {
        return SolidUI.h(UI.Text, {
            parent: container,
            y: index * 30, // Position based on index
            message: () => {
                const playerScore = playerScore();
                return mod.Message(mod.stringkeys.score, playerScore.player, playerScore.score);
            },
            textSize: 20,
            textColor: UI.COLORS.WHITE,
        });
    });

    // Update the list (Assume player1, player2, and player3 are some valid `mod.Player` objects)
    setScores([
        { id: 1, player: player1, score: 100 },
        { id: 2, player: player2, score: 85 },
        { id: 3, player: player3, score: 120 },
    ]);

    // Sort and update (widgets stay in place, content updates)
    setScores((prev) => [...prev].sort((a, b) => b.score - a.score));
}
```

```json
{
    "score": "{}: {}"
}
```

### Real-World Example: Spawn UI

This example is based on the [`FFASpawning`](../ffa-spawning/index.ts) module, demonstrating a complete reactive UI system.

```ts
function createSpawnUI(player: mod.Player): void {
    const [delayCountdown, setDelayCountdown] = SolidUI.createSignal(-1);

    // Prompt container (visible when countdown reaches 0)
    const promptUI = SolidUI.h(
        UI.Container,
        {
            x: 0,
            y: 0,
            width: 440,
            height: 140,
            anchor: mod.UIAnchor.Center,
            visible: () => delayCountdown() === 0,
            uiInputModeWhenVisible: true, // Automatically manages input mode
            bgColor: UI.COLORS.BF_GREY_4,
            bgAlpha: 0.5,
            bgFill: mod.UIBgFill.Blur,
        },
        player
    );

    // Spawn button
    SolidUI.h(UI.TextButton, {
        parent: promptUI,
        y: 20,
        width: 400,
        height: 40,
        anchor: mod.UIAnchor.TopCenter,
        message: mod.Message('Spawn now'),
        textSize: 30,
        textColor: UI.COLORS.BF_GREEN_BRIGHT,
        onClick: async () => {
            // Spawn logic here
            setDelayCountdown(-1);
        },
    });

    // Countdown text (visible when countdown > 0)
    SolidUI.h(
        UI.Text,
        {
            x: 0,
            y: 60,
            width: 400,
            height: 50,
            anchor: mod.UIAnchor.TopCenter,
            message: () => mod.Message(`Spawning available in ${delayCountdown()} seconds...`),
            textSize: 30,
            textColor: UI.COLORS.BF_GREEN_BRIGHT,
            visible: () => delayCountdown() > 0,
        },
        player
    );

    // Start the countdown (a timer calls `setDelayCountdown` every second, which automatically updates the UI).
    setDelayCountdown(10);
}
```

**Example:**

```ts
function MyButton(props: { team: number; onClick: () => void }) {
    return SolidUI.h(UI.TextButton, {
        message: mod.Message(mod.stringkeys.switchTeams, props.team),
        onClick: props.onClick,
        width: 200,
        height: 40,
    });
}

// MyButton is a FunctionalComponent<{ team: number; onClick: () => void }, TextButtonInstance>
SolidUI.h(MyButton, {
    team: 1,
    onClick: async () => {
        console.log('Clicked!');
    },
});
```

**Note:** Functional components receive props where values can be either static values or accessor functions (signals). The component can call accessors to get reactive values, but the props themselves are not automatically unwrapped.

## Known Limitations & Caveats

### UI Module Dependency

While `SolidUI` is decoupled from the `UI` module, it assumes that UI objects have getters and setters for properties. It has only been tested with the `UI` module. Using it with other UI systems may require adaptation.

### Property Assignment

`SolidUI.h()` uses property setters to update UI elements. If a property is read-only or doesn't have a setter, updates will fail silently (errors are caught). Ensure your UI objects have proper setters for reactive properties.

### Accessor Function Detection

`SolidUI.h()` treats any function value as an accessor. If you need to pass a function as a static value (not reactive), you'll need to work around this. Properties that match the pattern `on[A-Z]` (start with lowercase "on" followed by an uppercase letter) are never made reactive. This includes event handlers like `onClick`, `onHover`, `onDelete`, etc., but excludes properties like `onlyOnce`, `once`, or `online`.

### Store Updates

Store updates must use the `setStore` function with a producer. Direct assignment to store properties (e.g., `store.value = 5`) works but may not trigger reactivity correctly in all cases. Always use the setter:

```ts
// ✅ Correct
setStore((s) => {
    s.value = 5;
});

// ⚠️ May work but not recommended
store.value = 5;
```

### Effect Execution Order

Effects execute in the order they were scheduled, but there's no guarantee of execution order across different signals. If you need specific ordering, chain effects manually or use a single effect.

### Effect Error Handling

Effect errors are automatically caught and logged (if logging is configured via `SolidUI.setLogging()`) to prevent one failing effect from breaking the entire reactive system. Errors are logged at the `Error` log level. If you need additional error handling, implement it inside your effects.

### Memory Management

Effects and subscriptions are automatically cleaned up when UI elements are deleted. However, if you create standalone effects or roots, you must manually dispose of them to prevent memory leaks.

### Async Updates

All reactive updates are asynchronous. If you need synchronous updates (not recommended), you'll need to use the underlying `UI` module directly.

---

## Module: sounds

This TypeScript `Sounds` class abstracts away and handles the nuance, oddities, and pitfalls that come with playing sounds at runtime in Battlefield Portal experiences. The module provides efficient sound object management through automatic pooling and reuse, handles different playback scenarios (2D global, 2D per-player/squad/team, and 3D positional), manages sound durations automatically, and provides manual control when needed.

### Example

```ts
import { Sounds } from 'bf6-portal-utils/sounds';

// Define your sound assets (obtain these from your Battlefield Portal experience's asset browser)
const SOUND_ALPHA_2D = mod.RuntimeSpawn_Common.SFX_UI_EOR_RankUp_Extra_OneShot2D;
const SOUND_BULLET_3D = mod.RuntimeSpawn_Common.SFX_Projectiles_Flybys_Bullet_Crack_Sniper_Close_OneShot3D;
const SOUND_LOOP_2D = mod.RuntimeSpawn_Common.SFX_UI_EOR_Counting_SimpleLoop2D;
const SOUND_LOOP_3D = mod.RuntimeSpawn_Common.SFX_GameModes_BR_Mission_DemoCrew_Alarm_Close_SimpleLoop3D;

const playerUndeployedLoops: Map<number, () => void> = new Map();

export async function OnGameModeStarted(): Promise<void> {
    // Optional: Set up logging for debugging
    Sounds.setLogging((text) => console.log(text), Sounds.LogLevel.Info);

    // Optional: Preload some sounds to reduce first-play latency (minimal, if any)
    Sounds.preload(SOUND_ALPHA_2D);
    Sounds.preload(SOUND_BULLET_3D);
    Sounds.preload(SOUND_LOOP_2D);

    // Play an infinite-duration looping sound at each HQ.
    const hqPosition1 = mod.GetObjectPosition(mod.GetHQ(1));
    const hqPosition2 = mod.GetObjectPosition(mod.GetHQ(2));

    const ambientSound1 = Sounds.play3D(SOUND_LOOP_3D, hqPosition1, {
        amplitude: 3,
        attenuationRange: 100, // Sound can be heard up to 100 meters away
        duration: 0, // 0 = infinite duration
    });

    const ambientSound2 = Sounds.play3D(SOUND_LOOP_3D, hqPosition2, {
        amplitude: 3,
        attenuationRange: 100, // Sound can be heard up to 100 meters away
        duration: 0, // 0 = infinite duration
    });
}

export async function OnPlayerJoinGame(eventPlayer: mod.Player): Promise<void> {
    // Play a 2D sound for all players
    Sounds.play2D(SOUND_ALPHA_2D, { amplitude: 0.8, duration: 2000 });
}

export function OnPlayerUndeploy(eventPlayer: mod.Player): void {
    // Play a 2D sound loop for a specific player
    const stopSound = Sounds.play2D(SOUND_LOOP_2D, {
        target: eventPlayer,
        amplitude: 1,
        duration: 0,
    });

    // Save the stop function so it can be called once the player leaves the deploy screen.
    playerUndeployedLoops.set(mod.GetObjId(eventPlayer), stopSound);
}

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Stop the looping sound if it exists for the player.
    playerUndeployedLoops.get(mod.GetObjId(eventPlayer))?.();
}

export async function OnPlayerDied(
    victim: mod.Player,
    killer: mod.Player,
    deathType: mod.DeathType,
    weapon: mod.WeaponUnlock
): Promise<void> {
    const victimPosition = mod.GetSoldierState(victim, mod.SoldierStateVector.GetPosition);

    // Play a 3D positional sound at the victim's location
    Sounds.play3D(SOUND_BULLET_3D, victimPosition, {
        amplitude: 1.5,
        attenuationRange: 50, // Sound can be heard up to 50 meters away
        duration: 5000,
    });
}
```

- **Infinite Duration Objects** – Sound objects with infinite duration (`duration: 0`) remain in the `active` set until manually stopped. **Important:** For infinite-duration sounds, you must keep a reference to the returned stop function so you can call it when needed. Without this reference, the sound will play indefinitely (whether or not it's actually making sound, as it might not be a looping asset) and the underlying `SoundObject` cannot be freed or reused, effectively leaking resources. While the resource cost is small, this can accumulate over time if many infinite-duration sounds are started without proper cleanup.

- **Concurrent Playback** – The system allows multiple instances of sounds to play simultaneously for a given location or target. If you need to prevent overlapping sounds, you'll need to implement that logic yourself.

---

## Module: timers

This TypeScript `Timers` class provides `setTimeout` and `setInterval` functionality for Battlefield Portal experiences which run in a QuickJS runtime, which does not natively include these standard JavaScript timing functions. The module uses Battlefield Portal's `mod.Wait()` API internally to implement timer behavior, tracks active timers with unique IDs, and provides error handling to ensure robust timer execution.

### Example

```ts
import { Timers } from 'bf6-portal-utils/timers';

let healthCheckInterval: number | undefined;
let respawnTimeout: number | undefined;

export async function OnGameModeStarted(): Promise<void> {
    // Optional: Configure logging for timer callback error monitoring
    Timers.setLogging((text) => console.log(text), Timers.LogLevel.Error);

    // Start a periodic health check every 5 seconds
    // Callbacks can be synchronous or asynchronous (return void or Promise<void>)
    healthCheckInterval = Timers.setInterval(() => {
        const players = mod.GetPlayers();
        console.log(`Active players: ${players.length}`);
    }, 5_000);

    // Schedule a one-time event after 30 seconds
    // Callbacks can be synchronous or asynchronous (return void or Promise<void>)
    Timers.setTimeout(async () => {
        console.log('Game mode has been running for 30 seconds!');
        await doSomething();
    }, 30_000);
}

export async function OnPlayerDied(
    victim: mod.Player,
    killer: mod.Player,
    deathType: mod.DeathType,
    weapon: mod.WeaponUnlock
): Promise<void> {
    // Schedule a respawn after 10 seconds
    respawnTimeout = Timers.setTimeout(() => {
        mod.SpawnPlayer(victim, mod.GetRandomSpawnPoint(mod.GetTeam(victim)));
    }, 10_000);
}

export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
    // Cancel the respawn timeout if the player already spawned.
    // You can use `clearTimeout`, `clearInterval`, or `clear` - they all work the same.
    Timers.clear(respawnTimeout);
    respawnTimeout = undefined;
}

export async function OnGameModeEnded(): Promise<void> {
    // Clean up intervals when the game mode ends.
    // You can use `clearTimeout`, `clearInterval`, or `clear` - they all work the same.
    Timers.clear(healthCheckInterval);
    healthCheckInterval = undefined;

    // Optional: Check how many timers are still active (useful for debugging)
    const activeCount = Timers.getActiveTimerCount();
    if (activeCount > 0) {
        console.log(`Warning: ${activeCount} timers still active after cleanup`);
    }
}
```

### Immediate Interval Execution Example

```ts
import { Timers } from 'bf6-portal-utils/timers';

export async function OnGameModeStarted(): Promise<void> {
    // Start an interval that runs immediately, then every 10 seconds
    // Useful for initialization tasks that need to run right away
    Timers.setInterval(
        () => {
            // Update scoreboard, check objectives, etc.
            updateGameState();
        },
        10_000,
        true // true = immediate execution
    );
}
```

---

## Module: ui

This TypeScript `UI` namespace wraps Battlefield Portal's `mod` UI APIs with an object-oriented interface, providing strongly typed helpers, convenient defaults, ergonomic getters/setters, and automatic management of various UI mechanics for building complex HUDs, panels, and interactive buttons.

### Example

```ts
import { UI } from 'bf6-portal-utils/ui';
import { UIContainer } from 'bf6-portal-utils/ui/components/container';
import { UITextButton } from 'bf6-portal-utils/ui/components/text-button';

let testMenu: UIContainer | undefined;

export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
    if (!testMenu) {
        // Can include children upon construction of the container.
        testMenu = new UIContainer({
            position: { x: 0, y: 0 },
            size: { width: 200, height: 300 },
            anchor: mod.UIAnchor.Center,
            receiver: eventPlayer,
            visible: true,
            uiInputModeWhenVisible: true,
            childrenParams: [
                {
                    type: UITextButton,
                    position: { x: 0, y: 0 },
                    size: { width: 200, height: 50 },
                    anchor: mod.UIAnchor.TopCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    onClick: async (player: mod.Player): Promise<void> => {
                        // Do something
                    },
                    message: mod.Message(mod.stringkeys.ui.buttons.option1),
                    textSize: 36,
                    textColor: UI.COLORS.WHITE,
                } as UIContainer.ChildParams<UITextButton.Params>,
                {
                    type: UITextButton,
                    position: { x: 0, y: 50 },
                    size: { width: 200, height: 50 },
                    anchor: mod.UIAnchor.TopCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    onClick: async (player: mod.Player): Promise<void> => {
                        // Do something
                    },
                    message: mod.Message(mod.stringkeys.ui.buttons.option2),
                    textSize: 36,
                    textColor: UI.COLORS.WHITE,
                } as UIContainer.ChildParams<UITextButton.Params>,
            ],
        });

        // And even add a child to the container.
        new UITextButton({
            parent: testMenu,
            position: { x: 0, y: 0 },
            size: { width: 50, height: 50 },
            anchor: mod.UIAnchor.BottomCenter,
            bgColor: UI.COLORS.GREY_25,
            baseColor: UI.COLORS.BLACK,
            onClick: async (player: mod.Player): Promise<void> => {
                testMenu?.hide();
            },
            message: mod.Message(mod.stringkeys.ui.buttons.close),
            textSize: 36,
            textColor: UI.COLORS.WHITE,
        });
    }

    testMenu?.show();
}

export async function OnPlayerUIButtonEvent(player: mod.Player, widget: mod.UIWidget, event: mod.UIButtonEvent) {
    UI.handleButtonEvent(player, widget, event);
}
```

### Method Chaining Example

All setter methods return the instance, allowing you to chain multiple operations:

```ts
import { UIButton } from 'bf6-portal-utils/ui/components/button';
import { UIText } from 'bf6-portal-utils/ui/components/text';

const button = new UIButton({
    position: { x: 100, y: 200 },
    size: { width: 200, height: 50 },
    onClick: async (player) => {
        // Handle click
    },
});

// Chain multiple setters together
button
    .setPosition({ x: 150, y: 250 })
    .setSize({ width: 250, height: 60 })
    .setBaseColor(UI.COLORS.BLUE)
    .setBaseAlpha(0.9)
    .setEnabled(true)
    .show();

// Or update text content with chaining
const text = new UIText({
    message: mod.Message(mod.stringkeys.labels.hello), // 'Hello'
    position: { x: 0, y: 0 },
});

text.setMessage(mod.Message(mod.stringkeys.labels.updated)) // 'Updated'
    .setPosition({ x: 10, y: 20 })
    .setBgColor(UI.COLORS.WHITE)
    .setBgAlpha(0.5)
    .show();

// You can also use individual x, y, width, height properties
text.setX(10).setY(20).setWidth(100).setHeight(50).show();
```

### Parent-Child Management Example

Elements automatically manage parent-child relationships. When you create an element with a parent, move it between parents, or delete it, the parent's `children` array is automatically updated:

```ts
import { UIContainer } from 'bf6-portal-utils/ui/components/container';
import { UIText } from 'bf6-portal-utils/ui/components/text';

// Create containers
const container1 = new UIContainer({ position: { x: 0, y: 0 }, size: { width: 200, height: 200 } });
const container2 = new UIContainer({ position: { x: 200, y: 0 }, size: { width: 200, height: 200 } });

// Create a text element as a child of container1
const text = new UIText({
    message: mod.Message(mod.stringkeys.labels.hello), // 'Hello'
    parent: container1,
});

console.log(container1.children.length); // 1
console.log(container2.children.length); // 0

// Move the text element to container2
text.setParent(container2);
// Or: text.parent = container2;

console.log(container1.children.length); // 0 (automatically removed)
console.log(container2.children.length); // 1 (automatically added)

// Delete the text element
text.delete();

console.log(container2.children.length); // 0 (automatically removed)
```

### Custom UI Elements

Custom elements (like checkboxes, dropdowns, clocks, progress bars, etc.) can be built by extending the `Element` class and accepting a `params` object that extends the `ElementParams` interface as the sole argument to their constructor. They can use the protected `_logging` member to log messages within the UI namespace, and should use `_isDeletedCheck()` to protect setter operations from being called on deleted elements. Custom button-like components should implement the `Button` interface and register themselves using `UI.registerButton()` during construction.

### Element Behavior Conventions

The following behaviors apply to the built-in UI elements in this repository. Custom elements that extend `Element` should ideally implement these conventions for consistency, but doing so is not guaranteed. Custom implementations may differ, and edge cases may exist.

- **Parent-Child Relationships**: When you create child elements via `childrenParams` (on containers), they automatically receive the container as their parent. When you instantiate a child element with a parent, it's automatically added to the parent's `children` array. The parent's `children` array is automatically maintained.

- **Recursive Deletion**: Calling `delete()` on a container recursively deletes all child elements before deleting the container itself.

- **Children Storage**: Children are stored internally as a `Set<Element>` but exposed as an array via the `children` getter.

- **Receiver Inheritance**: Child elements automatically inherit their parent's receiver unless explicitly specified in their constructor parameters.

**Method Chaining Example:**

All properties support both normal setter syntax and method chaining:

```ts
import { UIContainer } from 'bf6-portal-utils/ui/components/container';

const container = new UIContainer({
    /* ... */
});

// Normal setter syntax (does not return the instance)
container.bgAlpha = 0.8;
container.visible = true;
container.position = { x: 100, y: 200 };

// Method chaining (returns the instance for chaining)
container
    .setPosition({ x: 100, y: 200 })
    .setSize({ width: 300, height: 400 })
    .setBgColor(UI.COLORS.BLUE)
    .setBgAlpha(0.8)
    .setAnchor(mod.UIAnchor.TopLeft)
    .show();
```

## UI Input Mode Management

The `uiInputModeWhenVisible` property provides automatic management of UI input mode (which is what allows a player to click on UI buttons), eliminating the need to manually call `mod.EnableUIInputMode` in most cases. When enabled on an element, the UI module automatically handles enabling and disabling UI input mode based on the element's visibility state.

### Usage Example

```ts
import { UIContainer } from 'bf6-portal-utils/ui/components/container';
import { UITextButton } from 'bf6-portal-utils/ui/components/text-button';

// Create a menu with interactive buttons
const menu = new UIContainer({
    position: { x: 0, y: 0 },
    size: { width: 300, height: 400 },
    receiver: player,
    uiInputModeWhenVisible: true, // Enable automatic UI input mode management
    childrenParams: [
        {
            type: UITextButton,
            position: { x: 0, y: 0 },
            size: { width: 200, height: 50 },
            message: mod.Message(mod.stringkeys.labels.button1), // 'Button 1'
            onClick: async (p) => {
                // Handle click
            },
        } as UIContainer.ChildParams<UITextButton.Params>,
        {
            type: UITextButton,
            position: { x: 0, y: 60 },
            size: { width: 200, height: 50 },
            message: mod.Message(mod.stringkeys.labels.button2), // 'Button 2'
            onClick: async (p) => {
                // Handle click
            },
        } as UIContainer.ChildParams<UITextButton.Params>,
    ],
});

// Simply show/hide the menu—UI input mode is managed automatically
menu.show(); // UI input mode is enabled for the player

// ... user interacts with buttons ...
menu.hide(); // UI input mode is disabled for the player (when no other requesters exist)

// You can also enable/disable the feature dynamically
menu.uiInputModeWhenVisible = false; // Disable automatic management

// ... later ...
menu.uiInputModeWhenVisible = true; // Re-enable automatic management
```

### When to Use

- **Enable `uiInputModeWhenVisible`** only on elements that you actually intend to toggle between visible and not visible. For example, if you have a container with 4 buttons and only the container's visibility will change, set `uiInputModeWhenVisible: true` only on the container, not on the individual buttons.
- **Disable `uiInputModeWhenVisible`** (default) for elements that won't have their visibility toggled, or when you prefer to manage UI input mode manually (not recommended).
- For complex UIs with multiple interactive sections, you can enable it on parent containers to manage input mode for entire UI hierarchies.

### Notes

- The default value is `false`. Enable it explicitly when needed.
- The property can be changed at runtime via the getter/setter or `setUiInputModeWhenVisible()` method.
- The system may not work correctly if you try to manually enable or disable UI input mode with `mod.EnableUIInputMode` in any scope, since there is no way to query the runtime to determine the current UI input mode state. It's best to let the UI system handle it entirely. Alternatively, you can choose to handle UI input mode entirely yourself, as long as you do not have any elements with `uiInputModeWhenVisible` enabled.
- Elements inherit their receiver from their parent, so UI input mode management respects the receiver hierarchy.

## Event Wiring & Lifecycle

- Register `UI.handleButtonEvent` once per mod to dispatch button presses.
- Use the returned `Element` helpers to hide/show instead of calling `mod.SetUIWidgetVisible` manually.
- All properties support both normal setter syntax (e.g., `element.bgAlpha = 0.8;`) and method chaining (e.g., `element.setBgAlpha(0.8).show()`). Method chaining is useful when you want to apply multiple changes in sequence.
- Always call `delete()` when removing widgets to prevent stale references inside Battlefield Portal. The element will automatically be removed from its parent's `children` array. For containers, `delete()` recursively deletes all children before deleting the container itself.
- The `parent` property in parameter interfaces must be a `UI.Parent` (i.e., `UI.Root` or `UI.Container`). Parent-child relationships are automatically managed.
- **Parent-child relationships** are automatically maintained:
    - When an element is created with a parent, it's automatically added to the parent's `children` Set via `attachChild()`. Children are stored internally as a `Set<Element>` but exposed as an array via the `children` getter.
    - When an element's `parent` is changed (via setter or `setParent()`), it's removed from the old parent's children via `detachChild()` and added to the new parent's children via `attachChild()`.
    - When an element is deleted, it's automatically removed from its parent's `children` Set via `detachChild()`.
- **Receiver inheritance**: Elements automatically adopt their parent's receiver if a receiver is not explicitly specified in constructor parameters. The `getReceiver()` utility function handles this logic, checking the parent's receiver and using it if no receiver is provided. Console warnings are displayed if an element's receiver is incompatible with its parent's receiver.
- **Deleted element protection**: Once an element is deleted (via `delete()`), the `_deleted` flag is set to `true` and all setter operations are blocked using `_isDeletedCheck()`. Attempts to modify deleted elements will log a warning and return early without performing the operation.

---

## Module: container

The `UIContainer` component creates a container widget that can hold child elements. Containers are useful for grouping UI elements together and managing their layout as a single unit.

```ts
import { UIContainer } from 'bf6-portal-utils/ui/components/container';
import { UIText } from 'bf6-portal-utils/ui/components/text';
import { UI } from 'bf6-portal-utils/ui';

// Create a container with nested children
const container = new UIContainer({
    position: { x: 0, y: 0 },
    size: { width: 300, height: 400 },
    anchor: mod.UIAnchor.Center,
    bgColor: UI.COLORS.BF_GREY_3,
    bgAlpha: 0.9,
    childrenParams: [
        {
            type: UIText,
            message: mod.Message(mod.stringkeys.text.helloWorld), // 'Hello World'
            position: { x: 0, y: 0 },
            textSize: 48,
        } as UIContainer.ChildParams<UIText.Params>,
    ],
    visible: true,
});

// Access children
console.log(container.children.length); // 1

// Delete container (recursively deletes all children)
container.delete();
```

### `UIContainer.ChildParams<T extends UI.ElementParams>`

Generic type for child element parameters in `childrenParams`. The type parameter must extend `ElementParams`. The `type` property must be set to the class constructor. This generic type enables developers to create custom UI elements (like checkboxes, dropdowns, clocks, progress bars, etc.) that integrate seamlessly with the existing UI system.

```ts
type ChildParams<T extends UI.ElementParams> = T & {
    type: new (params: T) => UI.Element;
};
```

**Example:**

```ts
import { UIContainer } from 'bf6-portal-utils/ui/components/container';
import { UIText } from 'bf6-portal-utils/ui/components/text';

const container = new UIContainer({
    childrenParams: [
        {
            type: UIText,
            message: mod.Message(mod.stringkeys.text.hello), // 'Hello'
            position: { x: 0, y: 0 },
        } as UIContainer.ChildParams<UIText.Params>,
    ],
});
```

---

## Module: container-button

The `UIContainerButton` component creates a button that contains a `UIContainer` as its content. This allows you to create interactive buttons that can hold child elements, enabling complex nested UI structures within a clickable button.

```ts
import { UIContainerButton } from 'bf6-portal-utils/ui/components/container-button';
import { UIText } from 'bf6-portal-utils/ui/components/text';
import { UI } from 'bf6-portal-utils/ui';

// Create a container button with nested children
const button = new UIContainerButton({
    position: { x: 0, y: 0 },
    size: { width: 200, height: 100 },
    onClick: async (player: mod.Player) => {
        console.log(`Player ${mod.GetObjId(player)} clicked!`);
    },
    childrenParams: [
        {
            type: UIText,
            message: mod.Message(mod.stringkeys.labels.click), // 'Click'
            anchor: mod.UIAnchor.TopCenter,
            position: { x: 0, y: 0 },
            size: { width: 200, height: 50 },
        } as UIContainer.ChildParams<UIText.Params>,
        {
            type: UIText,
            message: mod.Message(mod.stringkeys.labels.me), // 'Me'
            anchor: mod.UIAnchor.BottomCenter,
            position: { x: 0, y: 0 },
            size: { width: 200, height: 50 },
        } as UIContainer.ChildParams<UIText.Params>,
    ],
    visible: true,
});

// Access the inner container
const innerContainer = button.innerContainer;
console.log(innerContainer.children.length); // 2

// You must register `UI.handleButtonEvent` in your `OnPlayerUIButtonEvent` event handler for button clicks to work
export async function OnPlayerUIButtonEvent(player: mod.Player, widget: mod.UIWidget, event: mod.UIButtonEvent) {
    UI.handleButtonEvent(player, widget, event);
}
```

## Usage Notes

- **Inner Container Access**: Use the `innerContainer` property to access the container that holds child elements. You can use this to manage children, check the children array, etc.

- **Child Management**: Children added via `childrenParams` are automatically added to the inner container, not the button itself. Use `innerContainer.children` to access them.

- **Size Synchronization**: Setting `width`, `height`, or `size` automatically updates all three layers (outer container, button, and inner container), ensuring they stay in sync.

- **Padding**: The component supports padding, which creates space between the button border and the inner container. The inner container's size is automatically adjusted to account for padding.

- **Event Handler Required**: You must register `UI.handleButtonEvent` in your `OnPlayerUIButtonEvent` event handler for button clicks to work. See the Quick Start section above.

- **Method Chaining**: All setter methods return `this`, allowing you to chain multiple operations together.

---

## Module: content-button

The `UIContentButton` is an abstract base class for buttons that contain content elements (such as text or images). It handles the common pattern of wrapping a `UIButton` and a content element in a `UIContainer`, managing their layout, and delegating properties appropriately. It is need because natively (via the `mod` namespace UI widget system) only containers can be parents and have children.

This class is not meant to be instantiated directly. Instead, use concrete implementations like `UITextButton` which extends this class, or build you own buttons with content by extending this class.

## Architecture

`UIContentButton` creates a three-layer structure:

1. **Container** (outermost) – The `UIContentButton` instance itself, which extends `UI.Element` and wraps everything
2. **Button** (middle) – An internal `UIButton` instance that handles button interactions
3. **Content** (innermost) – A content element (e.g., `UIText`, `UIImage`) that displays the button's content

The class automatically:

- Creates and manages the internal button and content elements
- Delegates button properties (colors, alphas, `onClick`, etc.) to the instance
- Delegates content properties (specified via the `contentProperties` parameter) to the instance
- Manages padding and size synchronization between all three layers
- Handles cleanup when deleted

## Constructor

The constructor is `protected` and should not be called directly. Concrete implementations should call `super()` with appropriate parameters.

```ts
protected constructor(
    params: UIContentButton.Params,
    createContent: (parent: UI.Parent, width: number, height: number) => TContent,
    contentProperties: TContentProps
)
```

**Parameters:**

- `params` – The parameters for the content button, including all `UIButton.Params` plus optional `padding`
- `createContent` – A factory function that creates the content element given a parent and a prescribed inner width and height
- `contentProperties` – An array of property names to delegate from the content element to the instance

## Usage Notes

- **Padding Handling**: When padding is set, the content element's size is automatically reduced by `padding * 2` (once for each side) to account for the padding space.

- **Size Synchronization**: Setting `width`, `height`, or `size` automatically updates all three layers (container, button, and content), ensuring they stay in sync.

- **Property Delegation**: Properties are delegated using `UI.delegateProperties()`, which creates getters, setters, and setter methods (e.g., `setPropertyName`) for each property.

- **Internal Elements**: The internal button and content elements are not exposed as public properties. Access them through the delegated properties instead.

- **Method Chaining**: All setter methods return `this`, allowing you to chain multiple operations together.

---

## Module: gadget-image

The `UIGadgetImage` component creates a widget that displays an image of a gadget (equipment item). Gadget images are useful for displaying equipment icons in the UI, such as in inventory screens or equipment selection menus.

```ts
import { UIGadgetImage } from 'bf6-portal-utils/ui/components/gadget-image';

// Create a gadget image
const gadgetImage = new UIGadgetImage({
    gadget: mod.Gadgets.Misc_Defibrillator,
    position: { x: 0, y: 0 },
    size: { width: 64, height: 64 },
    visible: true,
});
```

---

## Module: gadget-image-button

The `UIGadgetImageButton` component creates a button with an integrated gadget image. It combines `UIButton` and `UIGadgetImage` functionality into a single element, wrapping both in a container and delegating properties appropriately.

```ts
import { UIGadgetImageButton } from 'bf6-portal-utils/ui/components/gadget-image-button';
import { UI } from 'bf6-portal-utils/ui';

// Create a gadget image button with a click handler
const button = new UIGadgetImageButton({
    position: { x: 0, y: 0 },
    size: { width: 64, height: 64 },
    gadget: mod.Gadgets.Misc_Defibrillator,
    onClick: async (player: mod.Player) => {
        console.log(`Player ${mod.GetObjId(player)} clicked the Defibrillator button!`);
    },
    visible: true,
});

// Update button properties
button.setEnabled(false).setBaseColor(UI.COLORS.BLUE);

// You must register `UI.handleButtonEvent` in your `OnPlayerUIButtonEvent` event handler for button clicks to work
export async function OnPlayerUIButtonEvent(player: mod.Player, widget: mod.UIWidget, event: mod.UIButtonEvent) {
    UI.handleButtonEvent(player, widget, event);
}
```

---

## Module: image

The `UIImage` component creates a widget that displays an image. Images are useful for displaying icons, graphics, or other visual elements in the UI.

```ts
import { UIImage } from 'bf6-portal-utils/ui/components/image';
import { UI } from 'bf6-portal-utils/ui';

// Create an image
const image = new UIImage({
    imageType: mod.UIImageType.QuestionMark,
    position: { x: 0, y: 0 },
    size: { width: 64, height: 64 },
    imageColor: UI.COLORS.WHITE,
    imageAlpha: 1,
    visible: true,
});

// Update image properties
image.setImageType(mod.UIImageType.Icon).setImageColor(UI.COLORS.BLUE).setImageAlpha(0.8);
```

---

## Module: image-button

The `UIImageButton` component creates a button with an integrated image. It combines `UIButton` and `UIImage` functionality into a single element, wrapping both in a container and delegating properties appropriately. The image automatically updates its appearance when the button is enabled or disabled.

```ts
import { UIImageButton } from 'bf6-portal-utils/ui/components/image-button';
import { UI } from 'bf6-portal-utils/ui';

// Create an image button with a click handler
const button = new UIImageButton({
    position: { x: 0, y: 0 },
    size: { width: 64, height: 64 },
    imageType: mod.UIImageType.CrownOutline,
    imageColor: UI.COLORS.WHITE,
    onClick: async (player: mod.Player) => {
        console.log(`Player ${mod.GetObjId(player)} clicked!`);
    },
    visible: true,
});

// Update button and image properties
button.setImageType(mod.UIImageType.CrownSolid).setImageColor(UI.COLORS.BLUE).setEnabled(false);

// You must register `UI.handleButtonEvent` in your `OnPlayerUIButtonEvent` event handler for button clicks to work
export async function OnPlayerUIButtonEvent(player: mod.Player, widget: mod.UIWidget, event: mod.UIButtonEvent) {
    UI.handleButtonEvent(player, widget, event);
}
```

---

## Module: text

The `UIText` component creates a text widget for displaying text labels in the UI. Text elements support customizable font size, color, opacity, alignment, and padding.

```ts
import { UIText } from 'bf6-portal-utils/ui/components/text';
import { UI } from 'bf6-portal-utils/ui';

// Create a text element
const text = new UIText({
    message: mod.Message(mod.stringkeys.labels.helloWorld), // 'Hello World'
    position: { x: 0, y: 0 },
    textSize: 48,
    textColor: UI.COLORS.WHITE,
    visible: true,
});

// Update the message
text.setMessage(mod.Message(mod.stringkeys.labels.updatedText)) // 'Updated Text'
    .setTextColor(UI.COLORS.BLUE)
    .setTextSize(36);
```

## Usage Notes

- **Message Opaqueness**: `mod.Message` is opaque and cannot be unpacked into a string. You can only create messages using `mod.Message()` with numbers, `mod.Player` types, or strings in `mod.stringkeys`.

- **Padding**: Unlike the base `Element` class, `UIText` supports padding. This allows you to add space around the text content.

- **Method Chaining**: All setter methods return `this`, allowing you to chain multiple operations together.

---

## Module: text-button

The `UITextButton` component creates a button with integrated text content. It combines `UIButton` and `UIText` functionality into a single element, wrapping both in a container and delegating properties appropriately. The text automatically updates its appearance when the button is enabled or disabled.

```ts
import { UITextButton } from 'bf6-portal-utils/ui/components/text-button';
import { UI } from 'bf6-portal-utils/ui';

// Create a text button with a click handler
const button = new UITextButton({
    position: { x: 0, y: 0 },
    size: { width: 200, height: 50 },
    message: mod.Message(mod.stringkeys.labels.clickMe), // 'Click Me'
    onClick: async (player: mod.Player) => {
        console.log(`Player ${mod.GetObjId(player)} clicked!`);
    },
    visible: true,
});

// Update button and text properties
button
    .setMessage(mod.Message(mod.stringkeys.labels.updated)) // 'Updated'
    .setTextColor(UI.COLORS.WHITE)
    .setEnabled(false);

//You must register `UI.handleButtonEvent` in your `OnPlayerUIButtonEvent` event handler for button clicks to work

export async function OnPlayerUIButtonEvent(player: mod.Player, widget: mod.UIWidget, event: mod.UIButtonEvent) {
    UI.handleButtonEvent(player, widget, event);
}
```

## Usage Notes

- **Automatic Text State Management**: When the button's `enabled` state changes, the text automatically switches between `textColor`/`textAlpha` (enabled) and `textDisabledColor`/`textDisabledAlpha` (disabled).

- **Size Synchronization**: Setting `width`, `height`, or `size` automatically updates the button widget and text size, accounting for padding.

- **Padding**: The component supports padding, which creates space between the button border and the text content. The text size is automatically adjusted to account for padding.

- **Event Handler Required**: You must register `UI.handleButtonEvent` in your `OnPlayerUIButtonEvent` event handler for button clicks to work. See the Quick Start section above.

- **Method Chaining**: All setter methods return `this`, allowing you to chain multiple operations together.

---

## Module: weapon-image

The `UIWeaponImage` component creates a widget that displays an image of a weapon. Weapon images are useful for displaying weapon icons in the UI, such as in weapon selection menus or loadout screens.

```ts
import { UIWeaponImage } from 'bf6-portal-utils/ui/components/weapon-image';

const weaponPackage = mod.CreateNewWeaponPackage();
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Ammo_Hollow_Point, weaponPackage);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Barrel_11_Extended, weaponPackage);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Magazine_25rnd_Magazine, weaponPackage);
mod.AddAttachmentToWeaponPackage(mod.WeaponAttachments.Right_Laser_Light_Combo_Green, weaponPackage);

// Create a weapon image
const weaponImage = new UIWeaponImage({
    weapon: mod.Weapons.AssaultRifle_AK4D,
    weaponPackage: weaponPackage,
    position: { x: 0, y: 0 },
    size: { width: 128, height: 64 },
    visible: true,
});
```

---

## Module: weapon-image-button

The `UIWeaponImageButton` component creates a button with an integrated weapon image. It combines `UIButton` and `UIWeaponImage` functionality into a single element, wrapping both in a container and delegating properties appropriately.
