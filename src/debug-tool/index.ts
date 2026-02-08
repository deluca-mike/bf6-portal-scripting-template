import { Logger } from 'bf6-portal-utils/logger/index.ts';
import { UI } from 'bf6-portal-utils/ui/index.ts';
import { UIContainer } from 'bf6-portal-utils/ui/components/container/index.ts';
import { UITextButton } from 'bf6-portal-utils/ui/components/text-button/index.ts';

export class DebugTool {
    public constructor(player: mod.Player, options?: DebugTool.Options) {
        this._player = player;

        this._staticLogger = new Logger(player, {
            staticRows: true,
            visible: options?.staticLogger?.visible ?? false,
            anchor: options?.staticLogger?.anchor ?? mod.UIAnchor.TopLeft,
            width: options?.staticLogger?.width ?? 500,
            height: options?.staticLogger?.height ?? 500,
            textColor: UI.COLORS.BF_RED_BRIGHT,
            bgAlpha: 0.8,
            bgFill: mod.UIBgFill.Blur,
        });

        this._dynamicLogger = new Logger(player, {
            staticRows: false,
            visible: options?.dynamicLogger?.visible ?? false,
            anchor: options?.dynamicLogger?.anchor ?? mod.UIAnchor.TopRight,
            width: options?.dynamicLogger?.width ?? 500,
            height: options?.dynamicLogger?.height ?? 500,
            textColor: UI.COLORS.BF_GREEN_BRIGHT,
            bgAlpha: 0.8,
            bgFill: mod.UIBgFill.Blur,
        });

        const childrenParams: UIContainer.ChildParams<UITextButton.Params>[] = [
            {
                type: UITextButton,
                y: 0,
                width: 300,
                height: 20,
                anchor: mod.UIAnchor.TopCenter,
                bgColor: UI.COLORS.GREY_25,
                baseColor: UI.COLORS.BLACK,
                message: mod.Message(mod.stringkeys.debugTool.buttons.toggleStaticLogger),
                textSize: 20,
                textColor: UI.COLORS.BF_GREEN_BRIGHT,
                onClick: async (player: mod.Player): Promise<void> => {
                    this._staticLogger.toggle();
                },
            },
            {
                type: UITextButton,
                y: 20,
                width: 300,
                height: 20,
                anchor: mod.UIAnchor.TopCenter,
                bgColor: UI.COLORS.GREY_25,
                baseColor: UI.COLORS.BLACK,
                message: mod.Message(mod.stringkeys.debugTool.buttons.toggleDynamicLogger),
                textSize: 20,
                textColor: UI.COLORS.BF_GREEN_BRIGHT,
                onClick: async (player: mod.Player): Promise<void> => {
                    this._dynamicLogger.toggle();
                },
            },
            {
                type: UITextButton,
                y: 40,
                width: 300,
                height: 20,
                anchor: mod.UIAnchor.TopCenter,
                bgColor: UI.COLORS.GREY_25,
                baseColor: UI.COLORS.BLACK,
                message: mod.Message(mod.stringkeys.debugTool.buttons.clearStaticLogger),
                textSize: 20,
                textColor: UI.COLORS.BF_GREEN_BRIGHT,
                onClick: async (player: mod.Player): Promise<void> => {
                    this._staticLogger.clear();
                },
            },
            {
                type: UITextButton,
                y: 60,
                width: 300,
                height: 20,
                anchor: mod.UIAnchor.TopCenter,
                bgColor: UI.COLORS.GREY_25,
                baseColor: UI.COLORS.BLACK,
                message: mod.Message(mod.stringkeys.debugTool.buttons.clearDynamicLogger),
                textSize: 20,
                textColor: UI.COLORS.BF_GREEN_BRIGHT,
                onClick: async (player: mod.Player): Promise<void> => {
                    this._dynamicLogger.clear();
                },
            },
            {
                type: UITextButton,
                y: 0,
                width: 300,
                height: 20,
                anchor: mod.UIAnchor.BottomCenter,
                bgColor: UI.COLORS.GREY_25,
                baseColor: UI.COLORS.BLACK,
                message: mod.Message(mod.stringkeys.debugTool.buttons.close),
                textSize: 20,
                textColor: UI.COLORS.BF_RED_BRIGHT,
                onClick: async (player: mod.Player): Promise<void> => {
                    mod.EnableUIInputMode(false, player);
                    this._debugMenu.hide();
                },
            },
        ];

        const debugConfig: UIContainer.Params = {
            receiver: player,
            width: options?.debugMenu?.width ?? 300,
            height: options?.debugMenu?.height ?? 300,
            anchor: mod.UIAnchor.Center,
            bgColor: UI.COLORS.BLACK,
            bgFill: mod.UIBgFill.Blur,
            bgAlpha: 0.8,
            visible: options?.debugMenu?.visible ?? false,
            uiInputModeWhenVisible: true,
            childrenParams,
        };

        this._debugMenu = new UIContainer(debugConfig);
    }

    private _player: mod.Player;

    private _staticLogger: Logger;

    private _dynamicLogger: Logger;

    private _debugMenu: UIContainer;

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
        this._staticLogger.logAsync(text, row);
    }

    public dynamicLog(text: string): void {
        this._dynamicLogger.logAsync(text);
    }

    public destroy(): void {
        this._staticLogger.destroy();
        this._dynamicLogger.destroy();
        this._debugMenu.delete();
    }

    public addDebugMenuButton(text: mod.Message, onClick: (player: mod.Player) => Promise<void>): void {
        const requiredHeight = (this._debugMenu.children.length + 1) * 20; // If we include the new button.

        if (requiredHeight > this._debugMenu.height) {
            this._debugMenu.height = requiredHeight;
        }

        new UITextButton({
            x: 0,
            y: (this._debugMenu.children.length - 1) * 20, // Place second to last.
            width: 300,
            height: 20,
            anchor: mod.UIAnchor.TopCenter,
            bgColor: UI.COLORS.GREY_25,
            baseColor: UI.COLORS.BLACK,
            message: text,
            textSize: 20,
            textColor: UI.COLORS.BF_GREEN_BRIGHT,
            onClick,
            parent: this._debugMenu,
            receiver: this._player,
        });
    }
}

export namespace DebugTool {
    export interface Options {
        staticLogger?: {
            visible?: boolean;
            anchor?: mod.UIAnchor;
            width?: number;
            height?: number;
        };
        dynamicLogger?: {
            visible?: boolean;
            anchor?: mod.UIAnchor;
            width?: number;
            height?: number;
        };
        debugMenu?: {
            visible?: boolean;
            width?: number;
            height?: number;
        };
    }
}
