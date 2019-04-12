import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { CreepController } from "./creep";

export class HarvesterController extends CreepController {

    public static work(creep: IHarvesterCreep) {
        if (creep.carry.energy < creep.carryCapacity) {
            if (!creep.memory.isMining) {
                // Set their status to mining and display a popup
                creep.say("⛏️ harvest");
                creep.memory.isMining = true;
            }
            this.harvestOrTravel(creep);
        } else {
            if (creep.memory.isMining) {
                // Set their status to not mining and display a popup
                creep.say("🛒 deliver");
                creep.memory.isMining = false;
            }
            this.depositEnergyOrTravel(creep);
        }
    }

    /** Do Something here at some stage */
    public static retreat() {
        // TODO Implement
        throw new Error("Not Implemented");
    }

    private static depositEnergyOrTravel(creep: IHarvesterCreep) {
        const structures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER) &&
                    structure.energy < structure.energyCapacity;
            },
        });

        if (structures.length > 0) {
            if (creep.transfer(structures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
            }
        }
    }
}
