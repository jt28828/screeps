import { IMinerCreep } from "../interfaces/miner-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { CreepController } from "./creep";
import { ICreepRole } from "./creep-role";

export class MinerController extends CreepController implements ICreepRole {
    protected creep: IMinerCreep;

    constructor(creep: IMinerCreep, roomState: ICurrentRoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    public startWork(): void {

        if (this.creep.memory.isDepositing && this.creep.carry.energy === 0) {
            this.startHarvesting(this.creep);
        }

        if (this.creep.memory.isMining && this.creep.carry.energy === this.creep.carryCapacity) {
            this.startDepositing(this.creep);
        }

        if (this.creep.memory.isDepositing) {
            this.depositEnergyOrTravel(this.creep, this.roomState);
        } else {
            if (!this.creep.memory.isMining) {
                this.startHarvesting(this.creep);
            }
            this.harvestOrTravel();
        }
    }

    /** Start collecting energy to use for upgrading */
    private startHarvesting(creep: IMinerCreep) {
        creep.memory.isMining = true;
        creep.memory.isDepositing = false;
        creep.say("⛏️ harvest");
    }

    /** Start using collected energy to upgrade structures */
    private startDepositing(creep: IMinerCreep) {
        creep.memory.isDepositing = true;
        creep.memory.isMining = false;
        this.stopHarvesting();
        creep.say("🔋 Storing energy");
    }

    private depositEnergyOrTravel(creep: IMinerCreep, roomState: ICurrentRoomState): void {
        // Attempt to store the energy in long term storage
        const success = this.depositEnergyInStorage();

        if (success) {
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
                creep.moveTo(towers[0], {visualizePathStyle: {stroke: "#ffffff"}});
            }
        }
    }
}
