import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { MinerModule } from "./modules/miner-module";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { CreepTasks } from "../../enums/creep-tasks";

export class MinerCreepController extends CreepController {
    protected modules: { mine: MinerModule, transfer: EnergyTransferModule };

    constructor(roomState: RoomMemoryManager, creep: Creep) {
        super(roomState, creep);
        this.modules = {
            mine: new MinerModule(creep, this),
            transfer: new EnergyTransferModule(creep, this)
        }
    }

    /** Orders the miner creep to mine energy. Miner creeps drop their energy directly inside containers so need need for any other logic */
    public control() {
        // Mine for more energy
        this.setTask(CreepTasks.mining);
        this.modules.mine.mineForEnergy();
    }
}
