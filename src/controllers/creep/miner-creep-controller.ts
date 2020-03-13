import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { IController } from "../../models/interfaces/controller";
import { MinerModule } from "./modules/miner-module";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { CreepTasks } from "../../enums/creep-tasks";

export class MinerCreepController extends CreepController<MinerCreep> implements IController {
    protected modules: { mine: MinerModule, transfer: EnergyTransferModule };

    constructor(roomState: RoomMemoryManager, creep: MinerCreep) {
        super(roomState, creep);
        this.modules = {
            mine: new MinerModule(creep, this),
            transfer: new EnergyTransferModule(creep, this)
        }
    }

    /** Orders the miner creep to mine energy or deposit it */
    public control() {
        if (this.creepIsFull()) {
            // Deposit energy in the closest storage
            this.setTask(CreepTasks.depositingEnergy);
            this.modules.transfer.depositEnergy()
        } else {
            // Mine for more energy
            this.setTask(CreepTasks.mining);
            this.modules.mine.mineForEnergy();
        }
    }
}
