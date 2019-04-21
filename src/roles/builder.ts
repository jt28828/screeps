import { IBuilderCreep } from "../interfaces/builder-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { CreepController } from "./creep";

export class BuilderController extends CreepController {
    public static work(creep: IBuilderCreep, roomState: ICurrentRoomState): void {

        if (creep.memory.isBuilding && creep.carry.energy === 0) {
            this.startHarvesting(creep);
        }

        if (!creep.memory.isBuilding && creep.carry.energy === creep.carryCapacity) {
            this.startBuilding(creep);
        }

        if (creep.memory.isBuilding) {
            const didBuild = this.buildOrTravel(creep);

            if (!didBuild) {
                // No building sites left. Try repairing something
                this.repairOrTravel(creep, roomState.structures);
            }

        } else {
            if (!creep.memory.isMining) {
                // Creep isn't mining yet
                const attempt = this.retrieveEnergyFromStorage(creep, roomState.structures);
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
    private static buildOrTravel(creep: IBuilderCreep): boolean {
        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length) {
            const closestSite = constructionSites[0];

            const didBuild = creep.build(closestSite);

            if (didBuild === ERR_NOT_IN_RANGE) {
                // Move and color with construction yellow
                creep.moveTo(closestSite, { visualizePathStyle: { stroke: "#FFCC00" } });
            } else if (didBuild !== OK) {
                // Failed for a different reason. Return error
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    /** Attempts to repair if within range or moves closer if not */
    private static repairOrTravel(creep: IBuilderCreep, myStructures: AnyStructure[]): boolean {
        const repairSites = myStructures.filter((strct) => strct.hits < strct.hitsMax);

        if (repairSites.length) {
            const closestSite = repairSites[0];

            if (creep.repair(closestSite) === ERR_NOT_IN_RANGE) {
                // Move and color with construction yellow
                creep.moveTo(closestSite, { visualizePathStyle: { stroke: "#FFCC00" } });
            }
        } else {
            return false;
        }
        return true;
    }
}
