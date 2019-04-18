import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { IMyCreep } from "../interfaces/my-creep";
import { CreepController } from "./creep";

/** Contains functions to control creeps designed to haul energy around */
export class HaulerController extends CreepController {

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
        const myStructures = creep.room.find(FIND_STRUCTURES);
        const energyStructures = myStructures.filter((structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_TOWER) &&
                structure.energy < structure.energyCapacity;
        });

        if (energyStructures.length > 0) {
            if (creep.transfer(energyStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                const didMove = creep.moveTo(energyStructures[0], { visualizePathStyle: { stroke: "#ffffff" } });
                if (didMove === ERR_NO_PATH) {
                    // Creep is stuck. Hand off energy to creeps around it
                    this.transferEnergy(creep);
                }
            }
        } else {
            // There are no structures around with space left for energy.
            // Attempt to store the energy in long term storage
            const response = this.depositEnergyInStorage(creep, myStructures);

            if (response !== OK) {
                // Couldn't store in containers either. Gather at the flag to get out of the way
                this.gatherAtFlag(creep);
            }
        }
    }

    /** Attempts to deposit energy in either containers or storage */
    private static depositEnergyInStorage(creep: IHarvesterCreep, myStructures: Structure[]): ScreepsReturnCode {
        const storageStructures = myStructures.filter((structure) => {
            return (
                structure.structureType === STRUCTURE_CONTAINER ||
                structure.structureType === STRUCTURE_STORAGE
            );
        });

        if (storageStructures == null || storageStructures.length === 0) {
            // No energy storing structures found
            return ERR_NOT_FOUND;
        }

        // Move to and store energy in any storage container
        if (creep.transfer(storageStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            return creep.moveTo(storageStructures[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return OK;
    }

    /** Sends the harvester creep to gather at the idle flag */
    private static gatherAtFlag(creep: IHarvesterCreep): void {
        const gatherFlag = Game.flags.harvesterIdle;
        creep.moveTo(gatherFlag);
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
