import { UI } from 'bf6-portal-utils/ui/index.ts';
import { Logger } from 'bf6-portal-utils/logger/index.ts';

export class DebugTool {
    public constructor(player: mod.Player) {
        this._player = player;

        this._staticLogger = new Logger(player, {
            staticRows: true,
            visible: false,
            anchor: mod.UIAnchor.TopLeft,
            width: 500,
            height: 500,
            textColor: UI.COLORS.BF_RED_BRIGHT,
            bgAlpha: 0.75,
        });

        this._dynamicLogger = new Logger(player, {
            staticRows: false,
            visible: false,
            anchor: mod.UIAnchor.TopRight,
            width: 500,
            height: 500,
            textColor: UI.COLORS.BF_GREEN_BRIGHT,
            bgAlpha: 0.75,
        });

        const debugConfig = {
            x: 0,
            y: 0,
            width: 300,
            height: 300,
            anchor: mod.UIAnchor.Center,
            bgColor: UI.COLORS.BLACK,
            bgFill: mod.UIBgFill.Blur,
            bgAlpha: 0.75,
            visible: false,
            childrenParams: [
                {
                    type: UI.Type.Button,
                    x: 0,
                    y: 0,
                    width: 300,
                    height: 20,
                    anchor: mod.UIAnchor.TopCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    label: {
                        message: mod.Message(mod.stringkeys.debugTool.buttons.toggleStaticLogger),
                        textSize: 20,
                        textColor: UI.COLORS.GREEN,
                    },
                    onClick: async (player: mod.Player): Promise<void> => {
                        this._staticLogger.toggle();
                    },
                },
                {
                    type: UI.Type.Button,
                    x: 0,
                    y: 20,
                    width: 300,
                    height: 20,
                    anchor: mod.UIAnchor.TopCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    label: {
                        message: mod.Message(mod.stringkeys.debugTool.buttons.toggleDynamicLogger),
                        textSize: 20,
                        textColor: UI.COLORS.GREEN,
                    },
                    onClick: async (player: mod.Player): Promise<void> => {
                        this._dynamicLogger.toggle();
                    },
                },
                {
                    type: UI.Type.Button,
                    x: 0,
                    y: 40,
                    width: 300,
                    height: 20,
                    anchor: mod.UIAnchor.TopCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    label: {
                        message: mod.Message(mod.stringkeys.debugTool.buttons.clearStaticLogger),
                        textSize: 20,
                        textColor: UI.COLORS.GREEN,
                    },
                    onClick: async (player: mod.Player): Promise<void> => {
                        this._staticLogger.clear();
                    },
                },
                {
                    type: UI.Type.Button,
                    x: 0,
                    y: 60,
                    width: 300,
                    height: 20,
                    anchor: mod.UIAnchor.TopCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    label: {
                        message: mod.Message(mod.stringkeys.debugTool.buttons.clearDynamicLogger),
                        textSize: 20,
                        textColor: UI.COLORS.GREEN,
                    },
                    onClick: async (player: mod.Player): Promise<void> => {
                        this._dynamicLogger.clear();
                    },
                },
                {
                    type: UI.Type.Button,
                    x: 0,
                    y: 0,
                    width: 300,
                    height: 20,
                    anchor: mod.UIAnchor.BottomCenter,
                    bgColor: UI.COLORS.GREY_25,
                    baseColor: UI.COLORS.BLACK,
                    label: {
                        message: mod.Message(mod.stringkeys.debugTool.buttons.close),
                        textSize: 20,
                        textColor: UI.COLORS.GREEN,
                    },
                    onClick: async (player: mod.Player): Promise<void> => {
                        mod.EnableUIInputMode(false, player);
                        this._debugMenu.hide();
                    },
                },
            ],
        };

        this._debugMenu = new UI.Container(debugConfig, player);
    }

    private _player: mod.Player;

    private _staticLogger: Logger;

    private _dynamicLogger: Logger;

    private _debugMenu: UI.Container;

    public hideStaticLogger(): void {
        this._staticLogger.hide();
    }

    public hideDynamicLogger(): void {
        this._dynamicLogger.hide();
    }

    public showStaticLogger(): void {
        this._staticLogger.show();
    }

    public showDynamicLogger(): void {
        this._dynamicLogger.show();
    }

    public clearStaticLogger(): void {
        this._staticLogger.clear();
    }

    public clearDynamicLogger(): void {
        this._dynamicLogger.clear();
    }

    public hideDebugMenu(): void {
        this._debugMenu.hide();
        mod.EnableUIInputMode(false, this._player);
    }

    public showDebugMenu(): void {
        this._debugMenu.show();
        mod.EnableUIInputMode(true, this._player);
    }

    public staticLog(text: string, row: number): void {
        this._staticLogger.log(text, row);
    }

    public dynamicLog(text: string): void {
        this._dynamicLogger.log(text);
    }
}
