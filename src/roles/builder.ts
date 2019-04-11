import { IBuilderCreep } from "../interfaces/creeps/builder-creep";

export class BuilderFunctions {
    public static work(creep: IBuilderCreep): void {

        if (creep.memory.isBuilding && creep.carry.energy === 0) {
            this.startHarvesting(creep);
        }

        if (!creep.memory.isBuilding && creep.carry.energy === creep.carryCapacity) {
            this.startBuilding(creep);
        }

        if (creep.memory.isBuilding) {
            this.buildOrTravel(creep);
        } else {
            this.harvestOrTravel(creep);
        }
    }

    /** Do Something here at some stage */
    public static retreat() {
        // TODO Implement
        throw new Error("Not Implemented");
    }

    /** Start collecting energy to use for building */
    private static startHarvesting(creep: IBuilderCreep) {
        creep.memory.isBuilding = false;
        creep.say("⛏️ harvest");
    }

    /** Start using collected energy to build structures */
    private static startBuilding(creep: IBuilderCreep) {
        creep.memory.isBuilding = true;
        creep.say("👷 build");
    }

    /** Attempts to build if within range or moves closer if not */
    private static buildOrTravel(creep: IBuilderCreep) {
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length) {
            const closestSite = constructionSites[0];

            if (creep.build(closestSite) === ERR_NOT_IN_RANGE) {
                // Move and color with construction yellow
                creep.moveTo(closestSite, { visualizePathStyle: { stroke: "#FFCC00" } });
            }
        }
    }

    /** Attempts to harvest energy if within range or moves closer if not */
    private static harvestOrTravel(creep: IBuilderCreep) {
        const closestMiningZone = creep.room.find(FIND_SOURCES)[0];
        if (creep.harvest(closestMiningZone) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestMiningZone, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
    }
}
