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
            repair: new RepairModule(creep, this),
        };
    }

    public control(): void {
        switch (super.memory.currentTask) {
            case CreepTasks.pickingUpDroppedEnergy: // Continue collecting / travelling to dropped energy
                this.modules.transfer.pickupDroppedEnergy();
                break;
            case CreepTasks.collectingEnergy: // Collect Energy from containers
                this.modules.transfer.retrieveEnergy();
                break;
            case CreepTasks.repairing: // Repair damaged buildings
                this.modules.repair.repairStructures();
                break;
            case CreepTasks.building: // Build new buildings
                this.modules.build.buildConstructionSite();
                break;
            default:
                this.getNewTaskForCreep();
                break;
        }
    }

    protected getNewTaskForCreep() {
        if (super.creepIsFull()) {
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
            super.setTask(CreepTasks.collectingEnergy);
            this.modules.transfer.retrieveEnergy();
        }
    }

}