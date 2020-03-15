import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";
import { StorageUtils } from "../../../utilities/storage-utils";

/** Adds the ability for a creep to deposit and retrieve energy from containers */
export class EnergyTransferModule extends CreepControllerModule {
    /** Deposits carried energy into the closest storage */
    public depositToStorage(): CustomActionResponse {

        // Only one storage per room so don't need to do multiple checks
        const storage = this.getNonFullStorage();

        if (storage === undefined) {
            // Storage not present or is full
            this._controller.clearTask();
            return CustomActionResponse.noEntitiesPresent;
        }

        // Attempt to deposit energy in storage
        const response = this._creep.transfer(storage, RESOURCE_ENERGY);

        if (response === ERR_NOT_IN_RANGE) {
            // Not close enough yet
            this._controller.moveTo(storage.pos);
        } else if (response === ERR_NOT_ENOUGH_ENERGY) {
            // Creep has no energy, clear task
            this._controller.clearTask();
            return CustomActionResponse.creepNotValid;
        }
        return CustomActionResponse.ok;
    }


    /**
     * Retrieves stored energy from the closest energy storage
     * Can be sent a boolean to indicate energy should only be collected from containers
     */
    public retrieveEnergy(fillingStorage: boolean = false): CustomActionResponse {
        let collectionTarget: EnergyStructures;
        if (!this._controller.creepHasEnergyTarget()) {
            // Get a target first
            const newTarget = this.getNewNonEmptyEnergyTarget(fillingStorage);

            if (newTarget == null) {
                // Couldn't retrieve a target
                this._controller.clearTask();
                return CustomActionResponse.noEntitiesPresent;
            }
            // Storage was found, set it in memory
            collectionTarget = newTarget;
            this._creep.memory.currentTaskTargetId = collectionTarget.id;
        } else {
            // Creep already has a target. Retrieve it
            const retrievedTarget = this.getContainerOrStorage(this._creep.memory.currentTaskTargetId as string);

            if (retrievedTarget == null) {
                // Target may have been destroyed Remove the reference from memory and skip this turn.
                this._controller.clearTaskTarget();
                return CustomActionResponse.ok;
            }
            collectionTarget = retrievedTarget;
        }

        // At this point creep has a valid target, attempt energy withdrawal or travel
        const response = this._creep.withdraw(collectionTarget, RESOURCE_ENERGY);

        if (response === ERR_NOT_IN_RANGE) {
            // Needs to move closer
            this._controller.moveTo(collectionTarget.pos);
        } else if (response === ERR_NOT_ENOUGH_ENERGY) {
            // Pick a new container
            this._controller.clearTaskTarget();
        } else if (response === ERR_FULL) {
            // Clear the task for the creep so they can use the energy for something else
            this._controller.clearTask();
            return CustomActionResponse.creepNotValid;
        }

        return CustomActionResponse.ok;
    }

    private getContainerOrStorage(structId: string) {
        return this._controller._roomState.structures.find(struct => struct.id === structId) as StructureContainer | StructureStorage;
    }

    /** Finds the closest source of stored energy to the current creep and saves it to the creeps memory */
    private getNewNonEmptyEnergyTarget(fillingStorage: boolean = false): EnergyStructures | null {
        // No energy collection target set yet. Get one first

        const energyTargets = this._controller._roomState.structures.filter((struct) => {
                let matches: boolean;
                if (fillingStorage) {
                    matches = struct.structureType === STRUCTURE_CONTAINER && !StorageUtils.storeIsEmpty(struct);
                } else {
                    matches = (struct.structureType === STRUCTURE_CONTAINER || struct.structureType === STRUCTURE_STORAGE) && !StorageUtils.storeIsEmpty(struct);
                }
                return matches;
            }
        ) as EnergyStructures[];

        // Get the closest to the current position or the most full if transporting to the central storage
        let foundStructure: EnergyStructures | null;
        if (fillingStorage) {
            // Find the most full
            foundStructure = energyTargets
                .sort((structA, structB) => structB.store.energy - structA.store.energy)[0];
        } else {
            foundStructure = this._creep.pos.findClosestByPath(energyTargets);
        }
        return foundStructure;
    }


    /** Finds the storage in the current room that isn't full of energy. Null if full */
    private getNonFullStorage(): StructureStorage | undefined {
        let returnValue = this._controller._roomState.room.storage;

        if (returnValue !== undefined && StorageUtils.storeIsFull(returnValue)) {
            // Storage exists but is full
            returnValue = undefined;
        }

        // Get the closest to the current position
        return returnValue;
    }
}