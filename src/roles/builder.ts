import { IBuilderCreep } from "../interfaces/builder-creep";
import { CreepController } from "./creep";

export class BuilderController extends CreepController {
    public static work(creep: IBuilderCreep, roomStructures: Structure[]): void {

        if (creep.memory.isBuilding && creep.carry.energy === 0) {
            this.startHarvesting(creep);
        }

        if (!creep.memory.isBuilding && creep.carry.energy === creep.carryCapacity) {
            this.startBuilding(creep);
        }

        if (creep.memory.isBuilding) {
            this.buildOrTravel(creep);
        } else {
            if (!creep.memory.isMining) {
                // Creep isn't mining yet
                const attempt = this.retrieveEnergyFromStorage(creep, roomStructures);
                if (attempt !== ERR_NOT_FOUND && attempt !== ERR_NOT_ENOUGH_ENERGY) {
                    // Container was found and has energy in it. Collect from it
                    creep.memory.isCollecting = true;
                    return;
                }
            }
            creep.memory.isCollecting = false;
            creep.memory.isMining = true;
            this.harvestOrTravel(creep, true);
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
        creep.memory.isMining = false;
        creep.memory.isCollecting = false;
        creep.say("⛏️ harvest");
    }

    /** Start using collected energy to build structures */
    private static startBuilding(creep: IBuilderCreep) {
        this.stopHarvesting(creep);
        creep.memory.isBuilding = true;
        creep.memory.isMining = false;
        creep.memory.isCollecting = false;
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
}
