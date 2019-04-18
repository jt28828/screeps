import { IMyCreep } from "../interfaces/my-creep";
import { StructureUtils } from "../utility/structure-utils";

/** Contains functions that are used across all creep types */
export class CreepController {

    /** Attempts to harvest energy if within range or moves closer if not */
    protected static harvestOrTravel(creep: IMyCreep, allowLongrange: boolean = false) {
        let miningZone: Source;
        if (creep.memory.miningTarget == null) {
            if (!allowLongrange) {
                miningZone = this.getClosestSource(creep);
            } else {
                miningZone = this.getRandomSource(creep);
            }
            creep.memory.miningTarget = miningZone.id;
        } else {
            const currentMiningTarget = Game.getObjectById(creep.memory.miningTarget) as Source;
            miningZone = (currentMiningTarget != null) ?
                currentMiningTarget :
                this.getClosestSource(creep);
        }

        if (creep.harvest(miningZone) === ERR_NOT_IN_RANGE) {
            creep.moveTo(miningZone, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
    }

    /** Removes the current mining target from the creep so it can do something else */
    protected static stopHarvesting(creep: IMyCreep) {
        creep.memory.miningTarget = undefined;
    }

    /** Attempts to take energy from either containers or storage */
    protected static retrieveEnergyFromStorage(creep: IMyCreep, myStructures: Structure[]): ScreepsReturnCode {
        const storageStructures = StructureUtils.findNonEmptyStorageStructures(myStructures) as StructureContainer[];

        if (storageStructures == null) {
            return ERR_NOT_FOUND;
        }

        // Move to and take energy from any storage container
        const response = creep.withdraw(storageStructures[0], RESOURCE_ENERGY);
        if (response === ERR_NOT_IN_RANGE) {
            return creep.moveTo(storageStructures[0], { visualizePathStyle: { stroke: "#ffffff" } });
        } else if (response !== OK) {
            // Something else went wrong. Return to let caller to know to stop
            return ERR_NOT_ENOUGH_ENERGY;
        }

        return OK;
    }

    private static getRandomSource(creep: Creep): Source {
        const zones = creep.room.find(FIND_SOURCES);
        const index = Math.floor(Math.random() * zones.length);
        return zones[index];
    }

    private static getClosestSource(creep: Creep): Source {
        return creep.room.find(FIND_SOURCES)[0];
    }
}
