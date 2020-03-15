import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";
import { StorageUtils } from "../../../utilities/storage-utils";

/** Provides functions to move energy around the room to towers, spread energy to different containers etc. */
export class EnergyMaintenanceModule extends CreepControllerModule {
    public fillTowers(): CustomActionResponse {
        let targetTower: StructureTower;
        if (this._creep.memory.currentTaskTargetId === undefined) {
            const newTower = this.getNewNonFullTowerTarget();
            if (newTower == null) {
                // No towers present in the room
                this._controller.clearTask();
                return CustomActionResponse.noEntitiesPresent;
            }
            targetTower = newTower;
            this._creep.memory.currentTaskTargetId = newTower.id;
        } else {
            let newTower = this.getTower(this._creep.memory.currentTaskTargetId);

            if (newTower == null) {
                // Tower has been destroyed, try and get a new target
                this._controller.clearTaskTarget();
                newTower = this.getNewNonFullTowerTarget();

                if (newTower == null) {
                    // There are no non-full towers in the current room
                    return CustomActionResponse.noEntitiesPresent;
                }
            }
            targetTower = newTower;
            this._creep.memory.currentTaskTargetId = newTower.id;
        }

        // Creep has a valid target
        const response = this._creep.transfer(targetTower, RESOURCE_ENERGY);

        if (response === ERR_NOT_IN_RANGE) {
            // Need to move closer
            this._controller.moveTo(targetTower.pos);
        } else if (response === ERR_FULL) {
            // The tower is full, reset the creeps target
            this._controller.clearTaskTarget();
        } else if (response === ERR_NOT_ENOUGH_ENERGY) {
            // Creep is out of energy and needs to restock
            this._controller.clearTask();
            return CustomActionResponse.creepNotValid;
        }
        return CustomActionResponse.ok;
    }

    /** Returns the closest tower to the current creep as a new target. Tower must NOT be full of energy */
    private getNewNonFullTowerTarget(): StructureTower | null {
        const towers = this._controller._roomState.myStructures
            .filter(struct =>
                struct.structureType === STRUCTURE_TOWER && !StorageUtils.energyIsFull(struct)
            ) as StructureTower[];

        return this._controller.findClosest(towers);
    }

    private getTower(towerId: string): StructureTower | null {
        return this._controller._roomState.myStructures.find(struct => struct.id === towerId) as StructureTower | null;
    }
}