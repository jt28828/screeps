import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";

/** Adds the ability for a creep to deposit and retrieve energy from containers */
export class EnergyTransferModule extends CreepControllerModule {
    /** Deposits carried energy into the closest energy storage */
    public depositEnergy(): CustomActionResponse {
        let newTarget: string | undefined;
        if (!this._controller.creepHasEnergyTarget()) {
            // Get a target first
            newTarget = this._controller.getNewEnergyTarget();
        }

        if (newTarget === undefined) {
            // Couldn't retrieve a target
            return CustomActionResponse.noEntitiesPresent;
        }

        const collectionTarget = Game.getObjectById<StructureContainer | StructureStorage>(this._creep.memory.currentTaskTargetId);

        if (collectionTarget == null) {
            // Somehow the target was deleted since the last turn. Remove the reference from memory and try again
            this._controller.clearTaskTarget();
            return this.depositEnergy();
        }

        if (collectionTarget.store.energy === collectionTarget.storeCapacity) {
            // Storage is full, don't move to another as creep is slow, just dump energy and mine again
            this._controller.clearTaskTarget();
            this._creep.drop(RESOURCE_ENERGY);
        } else {
            if (!this._creep.pos.inRangeTo(collectionTarget.pos, 1)) {
                // Needs to move closer
                this._controller.moveTo(collectionTarget.pos);
            } else {
                // Is close enough to deposit
                this._creep.transfer(collectionTarget, RESOURCE_ENERGY);
                this._controller.clearTaskTarget();
            }
            this._creep.say("Depositing Energy ⚡");
        }
        return CustomActionResponse.ok;
    }


    /** Retrieves stored energy from the closest energy storage */
    public retrieveEnergy(): CustomActionResponse {
        let newTarget: string | undefined;
        if (!this._controller.creepHasEnergyTarget()) {
            // Get a target first
            newTarget = this._controller.getNewEnergyTarget(true);

            if (newTarget === undefined) {
                // Couldn't retrieve a target
                return CustomActionResponse.noEntitiesPresent;
            }
        }

        const collectionTarget = this.getContainerOrStorage(this._creep.memory.currentTaskTargetId as string);

        if (collectionTarget == null) {
            // Somehow the target was deleted since the last turn. Remove the reference from memory and skip this turn
            this._controller.clearTaskTarget();
        } else {
            const response = this._creep.withdraw(collectionTarget, RESOURCE_ENERGY);

            if (response === ERR_NOT_IN_RANGE) {
                // Needs to move closer
                this._controller.moveTo(collectionTarget.pos);
            } else if (response === ERR_NOT_ENOUGH_ENERGY) {
                // Pick a new container
                this._controller.clearTaskTarget();
            }
        }

        return CustomActionResponse.ok;
    }

    public getContainerOrStorage(structId: string) {
        return this._controller._roomState.structures.find(struct => struct.id === structId) as StructureContainer | StructureStorage;
    }
}