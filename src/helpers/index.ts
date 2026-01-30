import { Timers } from 'bf6-portal-utils/timers/index.ts';
import { UI } from 'bf6-portal-utils/ui/index.ts';
import { UIText } from 'bf6-portal-utils/ui/components/text/index.ts';

export function getPlayerStateVectorString(player: mod.Player, type: mod.SoldierStateVector): string {
    return getVectorString(mod.GetSoldierState(player, type));
}

export function getVectorString(vector: mod.Vector): string {
    return `<${mod.XComponentOf(vector).toFixed(2)}, ${mod.YComponentOf(vector).toFixed(2)}, ${mod.ZComponentOf(vector).toFixed(2)}>`;
}

export function convertArray<T>(array: mod.Array): T[] {
    const v: T[] = [];
    const n = mod.CountOf(array);

    for (let i = 0; i < n; ++i) {
        v.push(mod.ValueInArray(array, i) as T);
    }

    return v;
}

export function equals(a: unknown, b: unknown): boolean {
    if (a === b || mod.Equals(a, b)) return true;

    return mod.IsType(a, mod.Types.Object) && mod.IsType(b, mod.Types.Object)
        ? mod.GetObjId(a as mod.Object) == mod.GetObjId(b as mod.Object)
        : false;
}

export function showEventGameModeMessage(event: mod.Message, target?: mod.Player | mod.Team) {
    const text = new UIText({
        position: { x: 0, y: 0 },
        size: { width: 2500, height: 80 },
        anchor: mod.UIAnchor.TopCenter,
        parent: UI.ROOT_NODE,
        visible: true,
        padding: 8,
        bgColor: UI.COLORS.BLACK,
        bgAlpha: 0.7,
        bgFill: mod.UIBgFill.Blur,
        message: event,
        textSize: 30,
        textColor: UI.COLORS.WHITE,
        textAlpha: 1,
        textAnchor: mod.UIAnchor.Center,
        receiver: target,
    });

    Timers.setTimeout(() => text.delete(), 6_000);
}
