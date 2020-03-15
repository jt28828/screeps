import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { UpgradeModule } from "./modules/upgrade-module";
import { CreepTasks } from "../../enums/creep-tasks";

export class UpgraderCreepController extends CreepController {
    protected modules: { transfer: EnergyTransferModule, upgrade: UpgradeModule };


    constructor(roomState: RoomMemoryManager, creep: Creep) {
        super(roomState, creep);
        this.modules = {
            transfer: new EnergyTransferModule(creep, this),
            upgrade: new UpgradeModule(creep, this)
        };
    }

    public control(): void {
        switch (super.memory.currentTask) {
            case CreepTasks.collectingEnergy: // Collect energy
                this.modules.transfer.retrieveEnergy();
                break;
            case CreepTasks.upgrading: // Upgrade
                this.modules.upgrade.upgradeController();
                break;
            default:
                this.getNewTaskForCreep();
                break;
        }
    }

    protected getNewTaskForCreep() {
        if (super.creepIsFull()) {
            // Start upgrading
            super.setTask(CreepTasks.upgrading);
            this.modules.upgrade.upgradeController();
        } else {
            // Collect energy
            super.setTask(CreepTasks.collectingEnergy);
            this.modules.transfer.retrieveEnergy();
        }
    }
}