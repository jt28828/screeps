import { IUpgraderCreep } from "../interfaces/upgrader-creep";
import { CreepController } from "./creep";

export class UpgraderController extends CreepController {
    public static work(creep: IUpgraderCreep, roomStructures: Structure[]) {

        if (creep.memory.isUpgrading && creep.carry.energy === 0) {
            this.startHarvesting(creep);
        }

        if (!creep.memory.isUpgrading && creep.carry.energy === creep.carryCapacity) {
            this.startUpgrading(creep);
        }

        if (creep.memory.isUpgrading) {
            this.upgradeOrTravel(creep);
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

    /** Start collecting energy to use for upgrading */
    private static startHarvesting(creep: IUpgraderCreep) {
        creep.memory.isUpgrading = false;
        creep.memory.isCollecting = false;
        creep.memory.isMining = false;
        creep.say("harvesting");
    }

    /** Start using collected energy to upgrade structures */
    private static startUpgrading(creep: IUpgraderCreep) {
        creep.memory.isUpgrading = true;
        creep.memory.isCollecting = false;
        creep.memory.isMining = false;
        this.stopHarvesting(creep);
        creep.say("upgrading");
    }

    private static upgradeOrTravel(creep: IUpgraderCreep) {
        const structureController = creep.room.controller;
        if (structureController != null) {
            if (creep.upgradeController(structureController) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structureController, { visualizePathStyle: { stroke: "#ffffff" } });
            }
        }
    }
}
