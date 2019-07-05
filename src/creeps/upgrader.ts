import { IUpgraderCreep } from "../interfaces/upgrader-creep";
import { CreepController } from "./base/creep";
import { ICreepRole } from "./creep-role";
import { RoomState } from "../models/room-state";
import { mySignature } from "../constants/signature";

export class UpgraderController extends CreepController implements ICreepRole {
    protected creep: IUpgraderCreep;

    constructor(creep: IUpgraderCreep, roomState: RoomState) {
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
            this.collectEnergy(true);
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
            // Check if room signature written first.
            if (this.creep.room.memory.isMyRoom && !this.creep.room.memory.roomIsSigned) {
                // Sign the controller with my signature
                this.signControllerOrTravel();
                return;
            }

            if (this.creep.upgradeController(structureController) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(structureController, {visualizePathStyle: {stroke: "#ffffff"}});
            }
        }
    }

    private signControllerOrTravel() {
        if (this.creep.room.controller != null) {
            if (this.creep.signController(this.creep.room.controller, mySignature) === ERR_NOT_IN_RANGE) {
                this.moveCreepToRoomObject(this.creep.room.controller);
            }
        }
    }
}
