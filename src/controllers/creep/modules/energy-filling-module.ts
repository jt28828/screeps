import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";

/** Provides methods for filling the spawn or extensions with energy */
export class EnergyFillingModule extends CreepControllerModule {
    public fillClosest(): CustomActionResponse {
        let target: SpawnStructures;
        if (this._creep.memory.currentTaskTargetId === undefined) {
            // Creep doesn't have a target yet. Find one
            const newTarget = this.findNonFullEnergyTargets();

            if (newTarget == null) {
                // Couldn't find a target, clear the creeps task
                this._controller.clearTask();
                return CustomActionResponse.noEntitiesPresent;
            }
            // Target was found
            target = newTarget;
            this._creep.memory.currentTaskTargetId = target.id;
        } else {
            // Creep already on the way to a target.
            target = this.getEnergyTarget(this._creep.memory.currentTaskTargetId);

            if (target == null) {
                // Target has been removed, wipe and start again
                this._controller.clearTaskTarget();
                return CustomActionResponse.ok;
            }
        }

        const response = this._creep.transfer(target, RESOURCE_ENERGY);

        if (response === ERR_NOT_IN_RANGE) {
            this._controller.moveTo(target.pos);
        } else if (response === ERR_NOT_ENOUGH_ENERGY) {
            this._controller.clearTask();
            return CustomActionResponse.creepNotValid;
        }else if (response === ERR_FULL) {
            this._controller.clearTaskTarget();
        } else {
            // Succeeded, if the creep has no energy left, reset task, else just reset target
            this._controller.clearTaskTarget();
        }

        return CustomActionResponse.ok;
    }

    private findNonFullEnergyTargets(): SpawnStructures | null {
        const energyTargets = this._controller._roomState.myStructures.filter(
            struct => (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION) &&
                struct.energy !== struct.energyCapacity
        ) as (SpawnStructures)[];

        return this._controller.findClosest(energyTargets);
    }

    private getEnergyTarget(targetId: string) {
        return this._controller._roomState.myStructures.find(struct => struct.id === targetId) as SpawnStructures;
    }
}