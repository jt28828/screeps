import { IUpgraderCreep } from "../interfaces/upgrader-creep";
import { CreepController } from "./creep";
import { ICurrentRoomState } from "../interfaces/room";
import { ICreepRole } from "./creep-role";

export class UpgraderController extends CreepController implements ICreepRole {
    protected creep: IUpgraderCreep;

    constructor(creep: IUpgraderCreep, roomState: ICurrentRoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    public startWork() {

        if (this.creep.memory.isUpgrading && this.creep.carry.energy === 0) {
            this.startHarvesting(this.creep);
        }

        if (!this.creep.memory.isUpgrading && this.creep.carry.energy === this.creep.carryCapacity) {
            this.startUpgrading(this.creep);
        }

        if (this.creep.memory.isUpgrading) {
            this.upgradeOrTravel(this.creep);
        } else {
            if (!this.creep.memory.isMining) {
                // Creep isn't mining yet
                const success = this.retrieveEnergyFromStorage();
                if (success) {
                    // Container was found and has energy in it. Collect from it
                    this.creep.memory.isCollecting = true;
                    return;
                }
            }
            this.creep.memory.isCollecting = false;
            this.creep.memory.isMining = true;
            this.harvestOrTravel(true);
        }
    }

    /** Start collecting energy to use for upgrading */
    private startHarvesting(creep: IUpgraderCreep) {
        creep.memory.isUpgrading = false;
        creep.memory.isCollecting = false;
        creep.memory.isMining = false;
        creep.say("harvesting");
    }

    /** Start using collected energy to upgrade structures */
    private startUpgrading(creep: IUpgraderCreep) {
        creep.memory.isUpgrading = true;
        creep.memory.isCollecting = false;
        creep.memory.isMining = false;
        this.stopHarvesting();
        creep.say("upgrading");
    }

    private upgradeOrTravel(creep: IUpgraderCreep) {
        const structureController = creep.room.controller;
        if (structureController != null) {
            // Check if room signature written first. Comment out after all rooms are claimed for a miniscule speed boost
            // if (structureController.sign != null && structureController.sign.text !== mySignature) {
            //     // Need to claim room first
            //     this.signControllerOrTravel(creep, structureController);
            // }

            if (creep.upgradeController(structureController) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structureController, {visualizePathStyle: {stroke: "#ffffff"}});
            }
        }
    }

    // private static signControllerOrTravel(creep: IUpgraderCreep, controller: StructureController) {
    //     if (controller != null) {
    //         if (creep.signController(controller, mySignature) === ERR_NOT_IN_RANGE) {
    //             creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
    //         }
    //     }
    // }
}
