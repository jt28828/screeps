import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { IMyCreep } from "../interfaces/my-creep";
import { CreepController } from "./creep";

export class HarvesterController extends CreepController {

    public static work(creep: IHarvesterCreep) {
        if (creep.carry.energy < creep.carryCapacity) {
            if (!creep.memory.isMining) {
                this.startHarvesting(creep);
            }
            this.harvestOrTravel(creep);
        } else {
            if (creep.memory.isMining) {
                this.startDepositing(creep);
            }
            this.depositEnergyOrTravel(creep);
        }
    }

    /** Start collecting energy to use for upgrading */
    private static startHarvesting(creep: IHarvesterCreep) {
        creep.memory.isMining = true;
        creep.say("⛏️ harvest");
    }

    /** Start using collected energy to upgrade structures */
    private static startDepositing(creep: IHarvesterCreep) {
        creep.memory.isMining = false;
        this.stopHarvesting(creep);
        creep.say("🚚 deposit");
    }

    private static depositEnergyOrTravel(creep: IHarvesterCreep): void {
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
                const didMove = creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
                if (didMove === ERR_NO_PATH) {
                    // Creep is stuck. Hand off energy to creeps around it
                    this.transferEnergy(creep);
                }
            }
        } else {
            // There are no structures around with space left for energy. For now go to the gather flag
            // TODO add logic for storing in containers
            const gatherFlag = Game.flags.gatherFlag;
            creep.moveTo(gatherFlag);
        }
    }

    /** Transfers energy to a nearby harvester creep */
    private static transferEnergy(creep: IHarvesterCreep): void {
        // Find creeps within 1 space of this one
        const nearbyCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 1) as IMyCreep[];
        if (nearbyCreeps != null && nearbyCreeps.length > 0) {
            const nearbyCreepCount = nearbyCreeps.length;
            for (let i = 0; i < nearbyCreepCount; i++) {
                const creepi = nearbyCreeps[i];

                // Transfer to a harvester if nearby
                if (creepi.memory.role === "harvester" && creepi.carry.energy < creepi.carryCapacity) {
                    creep.transfer(creepi, RESOURCE_ENERGY);
                }
            }
        }
    }
}
