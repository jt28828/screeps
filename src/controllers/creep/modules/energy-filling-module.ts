import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";

/** Provides methods for filling the spawn or extensions with energy */
export class EnergyFillingModule extends CreepControllerModule {
    public fillClosest(): CustomActionResponse {
        if (this._creep.memory.currentTaskTargetId !== undefined) {
            // Creep already on the way to a target.
            const target = this.getEnergyTarget(this._creep.memory.currentTaskTargetId);

            if (target == null) {
                // Target has been removed, wipe and start again
                this._controller.clearTask();
            } else {
                const response = this._creep.transfer(target, RESOURCE_ENERGY);

                if (response === ERR_NOT_IN_RANGE) {
                    this._controller.moveTo(target.pos);
                } else if (response === ERR_NOT_ENOUGH_ENERGY || response === ERR_FULL || this._controller.creepIsEmpty()) {
                    this._controller.clearTask();
                } else {
                    // Succeeded, if the creep has no energy left, reset task, else just reset target
                    this._controller.clearTaskTarget();
                }
            }
        } else {
            return this.findNonFullEnergyTargets();
        }

        return CustomActionResponse.ok;
    }

    private findNonFullEnergyTargets(): CustomActionResponse {
        const energyTargets = this._controller._roomState.myStructures.filter(
            struct => (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION) &&
                struct.energy !== struct.energyCapacity
        ) as (StructureExtension | StructureSpawn)[];

        const energyTarget = this._controller.findClosest(energyTargets);

        if (energyTarget == null) {
            return CustomActionResponse.noEntitiesPresent;
        }

        this._controller.memory.currentTaskTargetId = energyTarget.id;

        return CustomActionResponse.ok;
    }

    private getEnergyTarget(targetId: string) {
        return this._controller._roomState.myStructures.find(struct => struct.id === targetId);
    }
}