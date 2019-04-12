import { IMyCreep } from "../interfaces/my-creep";

/** Contains functions that are used across all creep types */
export class CreepController {

    /** Attempts to harvest energy if within range or moves closer if not */
    protected static harvestOrTravel(creep: IMyCreep) {
        let miningZone: Source = this.getClosestSource(creep);
        // if (creep.memory.miningTarget == null) {
        //     miningZone = this.getRandomSource(creep);
        //     creep.memory.miningTarget = miningZone.id;
        // } else {
        //     const currentMiningTarget = Game.getObjectById(creep.memory.miningTarget) as Source;
        //     miningZone = (currentMiningTarget != null) ?
        //         currentMiningTarget :
        //         this.getClosestSource(creep);
        // }

        if (creep.harvest(miningZone) === ERR_NOT_IN_RANGE) {
            creep.moveTo(miningZone, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
    }

    /** Removes the current mining target from the creep so it can do something else */
    protected static stopHarvesting(creep: IMyCreep) {
        creep.memory.miningTarget = undefined;
    }

    // private static getRandomSource(creep: Creep): Source {
    //     const zones = creep.room.find(FIND_SOURCES);
    //     const index = Math.floor(Math.random() * zones.length);
    //     return zones[index];
    // }

    private static getClosestSource(creep: Creep): Source {
        return creep.room.find(FIND_SOURCES)[0];
    }
}
