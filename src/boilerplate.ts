import { Events } from 'bf6-portal-utils/events/index.ts';
import { UI } from 'bf6-portal-utils/ui/index.ts';
import { MultiClickDetector } from 'bf6-portal-utils/multi-click-detector/index.ts';
import { MapDetector } from 'bf6-portal-utils/map-detector/index.ts';

import { DebugTool } from './debug-tool/index.ts';

let adminDebugTool: DebugTool | undefined;

function createAdminDebugTool(player: mod.Player): void {
    // The admin player is player id 0 for non-persistent test servers,
    // so don't do the rest of this unless it's the admin player.
    if (mod.GetObjId(player) != 0) return;

    // Create a debug tool with a static logger visible by default.
    const debugToolOptions: DebugTool.Options = {
        staticLogger: {
            visible: true,
        },
        dynamicLogger: {
            visible: false,
        },
        debugMenu: {
            visible: false,
        },
    };

    adminDebugTool = new DebugTool(player, debugToolOptions);

    // Create a multi-click detector to open the debug menu when the player triple-clicks the interact key.
    new MultiClickDetector(player, () => {
        adminDebugTool?.showDebugMenu();
    });

    // Log a message to the static logger.
    adminDebugTool?.staticLog(`Triple-click interact key to open debug menu.`, 0);
}

function destroyAdminDebugTool(eventNumber: number): void {
    const players = mod.AllPlayers();
    const count = mod.CountOf(players);

    for (let i = 0; i < count; ++i) {
        const player = mod.ValueInArray(players, i) as mod.Player;

        // If the player is the admin player, then we know the admin is still in the game, so we can exit this function.
        if (mod.GetObjId(player) === 0) return;
    }

    // Destroy the debug tool.
    adminDebugTool?.destroy();
    adminDebugTool = undefined;
}

function handlePlayerDeployed(player: mod.Player): void {
    // Log a message to the dynamic logger that the player has deployed.
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(player)} deployed.`);

    // Get the current map (Can be undefined if the map cannot be determined).
    const map = MapDetector.currentMap();

    if (map) {
        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.template.notifications.deployedOnMap, player, mod.stringkeys.template.maps[map]),
            player
        );
    } else {
        mod.DisplayNotificationMessage(mod.Message(mod.stringkeys.template.notifications.deployed, player), player);
    }
}

// Event subscription needed for handling UI button events.
Events.OnPlayerUIButtonEvent.subscribe((player, widget, event) => UI.handleButtonEvent(player, widget, event));

// Event subscriptions for the admin debug tool.
Events.OnPlayerJoinGame.subscribe(createAdminDebugTool);
Events.OnPlayerLeaveGame.subscribe(destroyAdminDebugTool);

// Event subscriptions for notifying players of their name and the current map.
Events.OnPlayerDeployed.subscribe(handlePlayerDeployed);

// Event subscriptions needed for multi-click detectors.
Events.OngoingPlayer.subscribe(MultiClickDetector.handleOngoingPlayer);
Events.OnPlayerLeaveGame.subscribe(MultiClickDetector.pruneInvalidPlayers);
