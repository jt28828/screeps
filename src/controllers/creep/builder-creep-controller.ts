import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { BuildModule } from "./modules/build-module";
import { CreepTasks } from "../../enums/creep-tasks";
import { RepairModule } from "./modules/repair-module";
import { CustomActionResponse } from "../../enums/custom-action-response";

export class BuilderCreepController extends CreepController {
    protected modules: { transfer: EnergyTransferModule, build: BuildModule, repair: RepairModule };


    constructor(roomState: RoomMemoryManager, creep: Creep) {
        super(roomState, creep);
        this.modules = {
            transfer: new EnergyTransferModule(creep, this),
            build: new BuildModule(creep, this),
            repair: new RepairModule(creep, this)
        };
    }

    public control(): void {
        if (super.memory.currentTask === CreepTasks.repairing) {
            this.modules.repair.repairStructures();
        } else if (super.memory.currentTask === CreepTasks.building) {
            this.modules.build.buildConstructionSite();
        } else if (super.creepIsFull()) {
            // Start building or repairing
            super.setTask(CreepTasks.building);
            const response = this.modules.build.buildConstructionSite();

            if (response !== CustomActionResponse.ok) {
                // Couldn't build, try repairing instead
                super.setTask(CreepTasks.repairing);
                this.modules.repair.repairStructures();
            }
        } else {
            // Creep needs energy
            this.modules.transfer.retrieveEnergy();
        }
    }

}