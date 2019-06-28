import { IUpgraderCreep } from "../interfaces/upgrader-creep";
import { CreepController } from "./base/creep";
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
            this.startHarvesting();
        }

        if (!this.creep.memory.isUpgrading && this.creep.carry.energy === this.creep.carryCapacity) {
            this.startUpgrading();
        }

        if (this.creep.memory.isUpgrading) {
            this.upgradeOrTravel();
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
            this.harvestOrTravel();
        }
    }

    /** Start collecting energy to use for upgrading */
    private startHarvesting() {
        this.creep.memory.isUpgrading = false;
        this.creep.memory.isCollecting = false;
        this.creep.memory.isMining = false;
        this.creep.say("harvesting");
    }

    /** Start using collected energy to upgrade structures */
    private startUpgrading() {
        this.wipeTaskMemory();
        this.creep.memory.isUpgrading = true;
        this.creep.memory.isCollecting = false;
        this.creep.memory.isMining = false;
        this.creep.say("upgrading");
    }

    private upgradeOrTravel() {
        const structureController = this.creep.room.controller;
        if (structureController != null) {
            // Check if room signature written first. Comment out after all rooms are claimed for a miniscule speed boost
            // if (structureController.sign != null && structureController.sign.text !== mySignature) {
            //     // Need to claim room first
            //     this.signControllerOrTravel();
            // }

            if (this.creep.upgradeController(structureController) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(structureController, {visualizePathStyle: {stroke: "#ffffff"}});
            }
        }
    }

    // private static signControllerOrTravel() {
    //     if (controller != null) {
    //         if (this.creep.signController(controller, mySignature) === ERR_NOT_IN_RANGE) {
    //             this.creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
    //         }
    //     }
    // }
}
