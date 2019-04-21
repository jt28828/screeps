import { IMinerCreep } from "../interfaces/miner-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { StructureUtils } from "../utility/structure-utils";
import { CreepController } from "./creep";

export class MinerController extends CreepController {

    public static work(creep: IMinerCreep, roomState: ICurrentRoomState) {

        if (creep.memory.isDepositing && creep.carry.energy === 0) {
            this.startHarvesting(creep);
        }

        if (creep.memory.isMining && creep.carry.energy === creep.carryCapacity) {
            this.startDepositing(creep);
        }

        if (creep.memory.isDepositing) {
            this.depositEnergyOrTravel(creep, roomState);
        } else {
            if (!creep.memory.isMining) {
                this.startHarvesting(creep);
            }
            this.harvestOrTravel(creep);
        }
    }

    /** Start collecting energy to use for upgrading */
    private static startHarvesting(creep: IMinerCreep) {
        creep.memory.isMining = true;
        creep.memory.isDepositing = false;
        creep.say("⛏️ harvest");
    }

    /** Start using collected energy to upgrade structures */
    private static startDepositing(creep: IMinerCreep) {
        creep.memory.isDepositing = true;
        creep.memory.isMining = false;
        this.stopHarvesting(creep);
        creep.say("🔋 Storing energy");
    }

    private static depositEnergyOrTravel(creep: IMinerCreep, roomState: ICurrentRoomState): void {
        // Attempt to store the energy in long term storage
        const response = this.depositEnergyInStorage(creep, roomState.structures);

        if (response === OK) {
            // stored energy ok
            return;
        }

        // No storage. Try a tower
        const towers = roomState.myStructures.filter((structure) => {
            return structure.structureType === STRUCTURE_TOWER &&
                structure.energy < structure.energyCapacity;
        });

        if (towers.length > 0) {
            if (creep.transfer(towers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(towers[0], { visualizePathStyle: { stroke: "#ffffff" } });
            }
        }
    }

    /** Attempts to deposit energy in either containers or storage */
    private static depositEnergyInStorage(creep: IMinerCreep, myStructures: Structure[]): ScreepsReturnCode {
        const storageStructures = StructureUtils.findNonFullStorageStructures(myStructures);

        if (storageStructures == null) {
            return ERR_NOT_FOUND;
        }

        // Move to and store energy in any storage container
        if (creep.transfer(storageStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            return creep.moveTo(storageStructures[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return OK;
    }
}
