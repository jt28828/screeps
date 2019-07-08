import { IMinerCreep } from "../interfaces/miner-creep";
import { CreepController } from "./base/creep";
import { ICreepRole } from "./creep-role";
import { RoomState } from "../models/room/room-state";

export class MinerController extends CreepController implements ICreepRole {
    protected creep: IMinerCreep;

    constructor(creep: IMinerCreep, roomState: RoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    public startWork(): void {
        if (this.creep.memory.isDepositing && this.creep.carry.energy === 0) {
            this.startHarvesting();
        }

        if (this.creep.memory.isMining && this.creep.carry.energy === this.creep.carryCapacity) {
            this.startDepositing();
        }

        if (this.creep.memory.isDepositing) {
            this.depositEnergyInStorage();
        } else {
            if (!this.creep.memory.isMining) {
                this.startHarvesting();
            }
            this.collectEnergy();
        }
    }

    /** Start collecting energy to use for upgrading */
    private startHarvesting() {
        this.creep.memory.isMining = true;
        this.creep.memory.isDepositing = false;
        this.creep.say("⛏️ harvest");
    }

    /** Start using collected energy to upgrade structures */
    private startDepositing() {
        this.wipeTaskMemory();
        this.creep.memory.isDepositing = true;
        this.creep.memory.isMining = false;
        this.creep.say("📦 Storing energy");
    }
}
