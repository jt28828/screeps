import { CreepControllerModule } from "./base/creep-controller-module";
import { mySignature, myUserName } from "../../../constants/signature";

/** Provides methods for a creep to upgrade and manage a room's controller */
export class UpgradeModule extends CreepControllerModule {
    /** Upgrades the controller in the current room */
    public upgradeController() {
        const inGameController = this._controller.currentRoom.controller;
        if (inGameController === undefined) {
            return;
        }

        const response = this._creep.upgradeController(inGameController);

        if (response === ERR_NOT_IN_RANGE) {
            // Move closer first
            this._controller.moveTo(inGameController.pos);
        } else if (response === ERR_NOT_ENOUGH_ENERGY) {
            // No energy left, go get some
            this._controller.clearTask();
        }
    }

    /** Signs the controller with the predefined phase */
    public signController() {
        const inGameController = this._controller.currentRoom.controller;
        if (inGameController === undefined) {
            return;
        }

        const response = this._creep.signController(inGameController, mySignature);

        if (response === ERR_NOT_IN_RANGE) {
            // Move closer first
            this._controller.moveTo(inGameController.pos);
        }
    }

    /** Returns whether or not the in-game controller is signed */
    public isControllerSigned() {
        return this._controller.currentRoom.controller?.sign?.username === myUserName;
    }
}