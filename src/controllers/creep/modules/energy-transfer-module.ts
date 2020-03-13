import { CreepControllerModule } from "./base/creep-controller-module";

/** Adds the ability for a creep to deposit and retrieve energy from containers */
export class EnergyTransferModule extends CreepControllerModule {
    /** Deposits carried energy into the closest energy storage */
    public depositEnergy() {
        if (!this._controller.creepHasEnergyTarget()) {
            // Get a target first
            this._controller.getNewEnergyTarget();
        }

        const collectionTarget = Game.getObjectById<StructureContainer | StructureStorage>(this._creep.memory.currentTaskTargetId);

        if (collectionTarget == null) {
            // Somehow the target was deleted since the last turn. Remove the reference from memory and skip this turn
            this._controller.clearTaskTarget();
            return;
        }

        if (collectionTarget.store.energy === collectionTarget.storeCapacity) {
            // Storage is full, don't move to another as creep is slow, just dump energy and mine again
            this._controller.clearTaskTarget();
            this._creep.drop(RESOURCE_ENERGY);
            return;
        }

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
}