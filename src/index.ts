import { UI } from 'bf6-portal-utils/ui/index.ts';
import { InteractMultiClickDetector } from 'bf6-portal-utils/interact-multi-click-detector/index.ts';
import { MapDetector } from 'bf6-portal-utils/map-detector/index.ts';

import { DebugTool } from './debug-tool/index.ts';
import { getPlayerStateVectorString, getVectorString } from './helpers/index.ts';

let adminDebugTool: DebugTool | undefined;

// This will trigger every sever tick.
export function OngoingGlobal(): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each AreaTrigger.
export function OngoingAreaTrigger(eventAreaTrigger: mod.AreaTrigger): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each CapturePoint.
export function OngoingCapturePoint(eventCapturePoint: mod.CapturePoint): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each EmplacementSpawner.
export function OngoingEmplacementSpawner(eventEmplacementSpawner: mod.EmplacementSpawner): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each HQ.
export function OngoingHQ(eventHQ: mod.HQ): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each InteractPoint.
export function OngoingInteractPoint(eventInteractPoint: mod.InteractPoint): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each LootSpawner.
export function OngoingLootSpawner(eventLootSpawner: mod.LootSpawner): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each MCOM.
export function OngoingMCOM(eventMCOM: mod.MCOM): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each Player.
export function OngoingPlayer(eventPlayer: mod.Player): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.

    // The admin player is player id 0 for non-persistent test servers,
    // so don't do the rest of this unless it's the admin player.
    if (mod.GetObjId(eventPlayer) != 0) return;

    if (!InteractMultiClickDetector.checkMultiClick(eventPlayer)) return;

    adminDebugTool?.showDebugMenu();
}

// This will trigger every sever tick, for each RingOfFire.
export function OngoingRingOfFire(eventRingOfFire: mod.RingOfFire): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each Sector.
export function OngoingSector(eventSector: mod.Sector): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each Spawner.
export function OngoingSpawner(eventSpawner: mod.Spawner): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each SpawnPoint.
export function OngoingSpawnPoint(eventSpawnPoint: mod.SpawnPoint): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each Team.
export function OngoingTeam(eventTeam: mod.Team): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each Vehicle.
export function OngoingVehicle(eventVehicle: mod.Vehicle): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each VehicleSpawner.
export function OngoingVehicleSpawner(eventVehicleSpawner: mod.VehicleSpawner): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each WaypointPath.
export function OngoingWaypointPath(eventWaypointPath: mod.WaypointPath): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger every sever tick, for each WorldIcon.
export function OngoingWorldIcon(eventWorldIcon: mod.WorldIcon): void {
    // Do something minimal every tick. Remember, this gets called 30 times per second.
}

// This will trigger when an AI Soldier stops trying to reach a destination.
export function OnAIMoveToFailed(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} failed to reach a destination.`);
}

// This will trigger when an AI Soldier starts moving to a target location.
export function OnAIMoveToRunning(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} started moving to a target location.`);
}

// This will trigger when an AI Soldier reaches target location.
export function OnAIMoveToSucceeded(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} reached a target location.`);
}

// This will trigger when an AI Soldier parachute action is running.
export function OnAIParachuteRunning(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} started parachuting.`);
}

// This will trigger when an AI Soldier parachute action has succeeded.
export function OnAIParachuteSucceeded(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} parachuted successfully.`);
}

// This will trigger when an AI Soldier stops following a waypoint.
export function OnAIWaypointIdleFailed(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} stopped following a waypoint.`);
}

// This will trigger when an AI Soldier starts following a waypoint.
export function OnAIWaypointIdleRunning(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} started following a waypoint.`);
}

// This will trigger when an AI Soldier finishes following a waypoint.
export function OnAIWaypointIdleSucceeded(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`AI Soldier ${mod.GetObjId(eventPlayer)} finished following a waypoint.`);
}

// This will trigger when a team takes control of a CapturePoint.
export function OnCapturePointCaptured(eventCapturePoint: mod.CapturePoint): void {
    adminDebugTool?.dynamicLog(`Capture Point ${mod.GetObjId(eventCapturePoint)} was captured.`);
}

// This will trigger when a team begins capturing a CapturePoint.
export function OnCapturePointCapturing(eventCapturePoint: mod.CapturePoint): void {
    adminDebugTool?.dynamicLog(`Capture Point ${mod.GetObjId(eventCapturePoint)} is being captured.`);
}

// This will trigger when a team loses control of a CapturePoint.
export function OnCapturePointLost(eventCapturePoint: mod.CapturePoint): void {
    adminDebugTool?.dynamicLog(`Capture Point ${mod.GetObjId(eventCapturePoint)} was lost.`);
}

// This will trigger when the gamemode ends.
export function OnGameModeEnding(): void {
    adminDebugTool?.dynamicLog(`Game mode is ending.`);
}

// This will trigger at the start of the gamemode.
export function OnGameModeStarted(): void {
    adminDebugTool?.dynamicLog(`Game mode started.`);
}

// This will trigger when a Player is forced into the mandown state.
export function OnMandown(eventPlayer: mod.Player, eventOtherPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} was downed by player ${mod.GetObjId(eventOtherPlayer)}.`
    );
}

// This will trigger when a MCOM is armed.
export function OnMCOMArmed(eventMCOM: mod.MCOM): void {
    adminDebugTool?.dynamicLog(`MCOM ${mod.GetObjId(eventMCOM)} was armed.`);
}

// This will trigger when a MCOM is defused.
export function OnMCOMDefused(eventMCOM: mod.MCOM): void {
    adminDebugTool?.dynamicLog(`MCOM ${mod.GetObjId(eventMCOM)} was defused.`);
}

// This will trigger when a MCOM detonates.
export function OnMCOMDestroyed(eventMCOM: mod.MCOM): void {
    adminDebugTool?.dynamicLog(`MCOM ${mod.GetObjId(eventMCOM)} was destroyed.`);
}

// This will trigger when a Player takes damage.
export function OnPlayerDamaged(
    eventPlayer: mod.Player, // The player who took damage.
    eventOtherPlayer: mod.Player, // The player who dealt the damage.
    eventDamageType: mod.DamageType, // The type of damage taken.
    eventWeaponUnlock: mod.WeaponUnlock // The weapon that dealt the damage.
): void {
    // Not going to log anything here as this happens too often.
}

// This will trigger whenever a Player deploys.
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    const map = MapDetector.currentMap();

    if (map) {
        mod.DisplayNotificationMessage(
            mod.Message(
                mod.stringkeys.template.notifications.deployedOnMap,
                eventPlayer,
                mod.stringkeys.template.maps[map]
            ),
            eventPlayer
        );
    } else {
        mod.DisplayNotificationMessage(
            mod.Message(mod.stringkeys.template.notifications.deployed, eventPlayer),
            eventPlayer
        );
    }

    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} deployed.`);

    // The admin player is player id 0 for non-persistent test servers,
    // so don't do the rest of this unless it's the admin player.
    if (mod.GetObjId(eventPlayer) != 0) return;

    debugLoop(eventPlayer);
}

// This will trigger whenever a Player dies.
export function OnPlayerDied(
    eventPlayer: mod.Player, // The player who died.
    eventOtherPlayer: mod.Player, // The player who killed the player who died.
    eventDeathType: mod.DeathType, // The type of death.
    eventWeaponUnlock: mod.WeaponUnlock // The weapon that killed the player who died.
): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventOtherPlayer)} killed player ${mod.GetObjId(eventPlayer)}.`);
}

// This will trigger when a Player earns a kill against another Player.
export function OnPlayerEarnedKill(
    eventPlayer: mod.Player, // The player who earned the kill.
    eventOtherPlayer: mod.Player, // The player who was killed.
    eventDeathType: mod.DeathType, // The type of death.
    eventWeaponUnlock: mod.WeaponUnlock // The weapon that killed the player who died.
): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} earned a kill on player ${mod.GetObjId(eventOtherPlayer)}.`
    );
}

// This will trigger when a Player earns a kill assist.
export function OnPlayerEarnedKillAssist(eventPlayer: mod.Player, eventOtherPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} earned a kill assist on player ${mod.GetObjId(eventOtherPlayer)}.`
    );
}

// This will trigger when a Player enters an AreaTrigger.
// Note that AreaTrigger has to be placed in Godot scene, assigned an ObjId and a CollisionPolygon3D(volume).
export function OnPlayerEnterAreaTrigger(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} entered area trigger ${mod.GetObjId(eventAreaTrigger)}.`
    );
}

// This will trigger when a Player enters a CapturePoint capturing area.
// Note that CapturePoint has to be placed in Godot scene, assigned an ObjId and a CapturePointArea(volume).
export function OnPlayerEnterCapturePoint(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} entered capture point ${mod.GetObjId(eventCapturePoint)}.`
    );
}

// This will trigger when a Player enters a Vehicle seat.
export function OnPlayerEnterVehicle(eventPlayer: mod.Player, eventVehicle: mod.Vehicle): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} entered vehicle ${mod.GetObjId(eventVehicle)}.`);
}

// This will trigger when a Player enters a Vehicle seat.
export function OnPlayerEnterVehicleSeat(
    eventPlayer: mod.Player,
    eventVehicle: mod.Vehicle,
    eventSeat: mod.Object
): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} entered vehicle seat ${mod.GetObjId(eventSeat)} of vehicle ${mod.GetObjId(eventVehicle)}.`
    );
}

// This will trigger when a Player exits an AreaTrigger.
// Note that AreaTrigger has to be placed in Godot scene, assigned an ObjId and a CollisionPolygon3D(volume).
export function OnPlayerExitAreaTrigger(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} exited area trigger ${mod.GetObjId(eventAreaTrigger)}.`
    );
}

// This will trigger when a Player exits a CapturePoint capturing area.
// Note that CapturePoint has to be placed in Godot scene, assigned an ObjId and a CapturePointArea(volume).
export function OnPlayerExitCapturePoint(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} exited capture point ${mod.GetObjId(eventCapturePoint)}.`
    );
}

// This will trigger when a Player exits a Vehicle.
export function OnPlayerExitVehicle(eventPlayer: mod.Player, eventVehicle: mod.Vehicle): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} exited vehicle ${mod.GetObjId(eventVehicle)}.`);
}

// This will trigger when a Player exits a Vehicle seat.
export function OnPlayerExitVehicleSeat(
    eventPlayer: mod.Player,
    eventVehicle: mod.Vehicle,
    eventSeat: mod.Object
): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} exited vehicle seat ${mod.GetObjId(eventSeat)} of vehicle ${mod.GetObjId(eventVehicle)}.`
    );
}

// This will trigger when a Player interacts with InteractPoint.
export function OnPlayerInteract(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} interacted with interact point ${mod.GetObjId(eventInteractPoint)}.`
    );
}

// This will trigger when a Player joins the game.
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} joined the game.`);

    // The admin player is player id 0 for non-persistent test servers,
    // so don't do the rest of this unless it's the admin player.
    if (mod.GetObjId(eventPlayer) != 0) return;

    adminDebugTool = new DebugTool(eventPlayer);
}

// This will trigger when any player leaves the game.
export function OnPlayerLeaveGame(eventNumber: number): void {
    adminDebugTool?.dynamicLog(`A player left the game (event number: ${eventNumber}).`);
}

// This will trigger when a Player changes team.
export function OnPlayerSwitchTeam(eventPlayer: mod.Player, eventTeam: mod.Team): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} switched to team ${mod.GetObjId(eventTeam)}.`);
}

// This will trigger when a Player interacts with an UI button.
export function OnPlayerUIButtonEvent(
    eventPlayer: mod.Player,
    eventUIWidget: mod.UIWidget,
    eventUIButtonEvent: mod.UIButtonEvent
): void {
    // The UI module has a static global click handler for all buttons created with the UI module.
    UI.handleButtonClick(eventPlayer, eventUIWidget, eventUIButtonEvent);
}

// This will trigger when the Player dies and returns to the deploy screen.
export function OnPlayerUndeploy(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} undeployed.`);
}

// This will trigger when a Raycast hits a target.
export function OnRayCastHit(eventPlayer: mod.Player, eventPoint: mod.Vector, eventNormal: mod.Vector): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} ray cast hit a target at ${getVectorString(eventPoint)} with normal ${getVectorString(eventNormal)}.`
    );
}

// This will trigger when a Raycast is called and doesn't hit any target.
export function OnRayCastMissed(eventPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(`Player ${mod.GetObjId(eventPlayer)} ray cast missed.`);
}

// This will trigger when a Player is revived by another Player.
export function OnRevived(eventPlayer: mod.Player, eventOtherPlayer: mod.Player): void {
    adminDebugTool?.dynamicLog(
        `Player ${mod.GetObjId(eventPlayer)} was revived by player ${mod.GetObjId(eventOtherPlayer)}.`
    );
}

// This will trigger when a RingOfFire changes size.
export function OnRingOfFireZoneSizeChange(eventRingOfFire: mod.RingOfFire, eventNumber: number): void {
    adminDebugTool?.dynamicLog(`RingOfFire ${mod.GetObjId(eventRingOfFire)} changed size to ${eventNumber}.`);
}

// This will trigger when an AISpawner spawns an AI Soldier.
export function OnSpawnerSpawned(eventPlayer: mod.Player, eventSpawner: mod.Spawner): void {
    adminDebugTool?.dynamicLog(
        `AI player ${mod.GetObjId(eventPlayer)} spawned from spawner ${mod.GetObjId(eventSpawner)}.`
    );
}

// This will trigger when the gamemode time limit has been reached.
export function OnTimeLimitReached(): void {
    adminDebugTool?.dynamicLog(`The time limit has been reached.`);
}

// This will trigger when a Vehicle is destroyed.
export function OnVehicleDestroyed(eventVehicle: mod.Vehicle): void {
    adminDebugTool?.dynamicLog(`Vehicle ${mod.GetObjId(eventVehicle)} was destroyed.`);
}

// This will trigger when a Vehicle is called into the map.
export function OnVehicleSpawned(eventVehicle: mod.Vehicle): void {
    adminDebugTool?.dynamicLog(`Vehicle ${mod.GetObjId(eventVehicle)} was spawned.`);
}

// This will call itself every 5 seconds.
function debugLoop(player: mod.Player): void {
    mod.Wait(0.5).then(() => {
        if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) return;

        adminDebugTool?.staticLog(
            `Position: ${getPlayerStateVectorString(player, mod.SoldierStateVector.GetPosition)}`,
            0
        );
        adminDebugTool?.staticLog(
            `Facing: ${getPlayerStateVectorString(player, mod.SoldierStateVector.GetFacingDirection)}`,
            1
        );

        debugLoop(player);
    });
}
