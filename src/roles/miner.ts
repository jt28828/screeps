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
            this.harvestOrTravel();
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
        this.creep.memory.isDepositing = true;
        this.creep.memory.isMining = false;
        this.stopHarvesting();
        this.creep.say("🔋 Storing energy");
    }
}
