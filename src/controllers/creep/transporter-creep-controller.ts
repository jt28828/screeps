import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { EnergyFillingModule } from "./modules/energy-filling-module";
import { CreepTasks } from "../../enums/creep-tasks";

export class TransporterCreepController extends CreepController {
    protected modules: { transfer: EnergyTransferModule, filling: EnergyFillingModule };

    constructor(roomState: RoomMemoryManager, creep: Creep) {
        super(roomState, creep);

        this.modules = {
            transfer: new EnergyTransferModule(creep, this),
            filling: new EnergyFillingModule(creep, this)
        }
    }

    public control(): void {
        if (this.memory.currentTask === CreepTasks.fillingSpawns) {
            this.modules.filling.fillClosest();
        } else {
            if (this.creepIsFull()) {
                // Start filling spawn
                this.setTask(CreepTasks.fillingSpawns);
                this.modules.filling.fillClosest();
            } else {
                this.modules.transfer.retrieveEnergy();
            }
        }
    }

}