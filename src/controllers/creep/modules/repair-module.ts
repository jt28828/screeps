import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";

export class RepairModule extends CreepControllerModule {

    /** Repairs the closest damaged structure site */
    public repairStructures(): CustomActionResponse {

        if (this._controller.memory.currentTaskTargetId !== undefined) {
            // Creep has a target.
            const damagedBuilding = this.getTargetStructure(this._controller.memory.currentTaskTargetId);
            if (damagedBuilding === undefined) {
                // Building site doesn't exist, wipe from memory and start again
                this._controller.clearTaskTarget();
                this.repairStructures();
            } else {
                const response = this._creep.repair(damagedBuilding);

                if (response === ERR_NOT_IN_RANGE) {
                    // Not close enough, move to the structure
                    this._controller.moveTo(damagedBuilding.pos);
                } else if (response === ERR_NOT_ENOUGH_ENERGY) {
                    // This creep is out of energy. Reset their task
                    this._controller.clearTask();
                }
            }
        } else {
            return this.getNewRepairTarget();
        }
        return CustomActionResponse.ok;
    }

    /** Gets a new repair target for the current creep */
    private getNewRepairTarget(): CustomActionResponse {
        const closestDamaged = this._controller.findClosest(this._controller._roomState.damagedStructures);
        if (closestDamaged != null) {
            this._controller.memory.currentTaskTargetId = closestDamaged.id;
        } else {
            // No damaged structures in the room, clear the creep's task so they can do something else
            this._controller.clearTask();
            return CustomActionResponse.noEntitiesPresent;
        }

        return CustomActionResponse.ok;
    }

    /** Retrieves the structure a creep has chosen to repair */
    private getTargetStructure(structureId: string): Structure | undefined {
        return this._controller._roomState.damagedStructures.find(struct => struct.id === structureId);
    }
}