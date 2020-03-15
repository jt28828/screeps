import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { EnergyFillingModule } from "./modules/energy-filling-module";
import { CreepTasks } from "../../enums/creep-tasks";
import { CustomActionResponse } from "../../enums/custom-action-response";
import { EnergyMaintenanceModule } from "./modules/energy-maintenance-module";

export class TransporterCreepController extends CreepController {
    protected modules: { transfer: EnergyTransferModule, filling: EnergyFillingModule, maintenance: EnergyMaintenanceModule };

    constructor(roomState: RoomMemoryManager, creep: Creep) {
        super(roomState, creep);

        this.modules = {
            transfer: new EnergyTransferModule(creep, this),
            filling: new EnergyFillingModule(creep, this),
            maintenance: new EnergyMaintenanceModule(creep, this)
        }
    }

    public control(): void {
        switch (this.memory.currentTask) {
            case CreepTasks.collectingEnergy:
                this.modules.transfer.retrieveEnergy();
                break;
            case CreepTasks.fillingSpawns:
                this.modules.filling.fillClosest();
                break;
            case CreepTasks.maintaining:
                this.modules.maintenance.fillTowers();
                break;
            case CreepTasks.transporting:
                this.depositToStorage();
                break;
            default:
                this.getNewTaskForCreep();
                break;
        }
    }

    /** Allows depositing to a storage structure or retrieves energy from another container to deposit */
    private depositToStorage() {
        const response = this.modules.transfer.depositToStorage();
        if (response === CustomActionResponse.creepNotValid) {
            // Creep out of energy, send it to retrieve energy from somewhere else so it doesn't loop energy from the storage
            this.setTask(CreepTasks.collectingEnergy);
            this.modules.transfer.retrieveEnergy(true);
        }
    }

    protected getNewTaskForCreep() {
        if (this.creepIsFull()) {
            // Start filling spawn
            this.setTask(CreepTasks.fillingSpawns);
            const response = this.modules.filling.fillClosest();

            if (response !== CustomActionResponse.ok) {
                // Failed to fill spawn, fill towers instead
                this.setTask(CreepTasks.maintaining);
                const towerResponse = this.modules.maintenance.fillTowers();

                if (towerResponse !== CustomActionResponse.ok) {
                    // Also failed to fill towers, move energy to storage as last resort
                    this.setTask(CreepTasks.transporting);
                    this.modules.transfer.depositToStorage();
                }
            }
        } else {
            this.setTask(CreepTasks.collectingEnergy);
            this.modules.transfer.retrieveEnergy();
        }
    }

}