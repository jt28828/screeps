import { IUpgraderCreep } from "../interfaces/upgrader-creep";
import { CreepController } from "./creep";


export class UpgraderController extends CreepController {
    public static work(creep: IUpgraderCreep) {

        if (creep.memory.isUpgrading && creep.carry.energy === 0) {
            this.startHarvesting(creep);
        }

        if (!creep.memory.isUpgrading && creep.carry.energy === creep.carryCapacity) {
            this.startUpgrading(creep);
        }

        if (creep.memory.isUpgrading) {
            this.upgradeOrTravel(creep);
        } else {
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
        creep.say("⛏️ harvest");
    }

    /** Start using collected energy to upgrade structures */
    private static startUpgrading(creep: IUpgraderCreep) {
        creep.memory.isUpgrading = true;
        this.stopHarvesting(creep);
        creep.say("⚡ upgrade");
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
