import { IMyCreep } from "../interfaces/my-creep";

/** Contains functions that are used across all creep types */
export class CreepController {

    /** Attempts to harvest energy if within range or moves closer if not */
    protected static harvestOrTravel(creep: IMyCreep) {
        const closestMiningZone = creep.room.find(FIND_SOURCES)[0];
        if (creep.harvest(closestMiningZone) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestMiningZone, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
    }
}
