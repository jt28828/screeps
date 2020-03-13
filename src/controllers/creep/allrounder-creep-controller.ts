import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { CreepTasks } from "../../enums/creep-tasks";
import { CreepController } from "./base/creep-controller";
import { MinerModule } from "./modules/miner-module";
import { EnergyTransferModule } from "./modules/energy-transfer-module";
import { BuildModule } from "./modules/build-module";
import { UpgradeModule } from "./modules/upgrade-module";
import { CustomActionResponse } from "../../enums/custom-action-response";

/** Controls the allrounder creep, the creep generated by the room only at lower levels */
export class AllRounderCreepController extends CreepController<AllRounderCreep> {
    protected modules: { mine: MinerModule, transfer: EnergyTransferModule, build: BuildModule, upgrade: UpgradeModule };

    constructor(roomState: RoomMemoryManager, creep: AllRounderCreep) {
        super(roomState, creep);
        this.modules = {
            mine: new MinerModule(creep, this),
            transfer: new EnergyTransferModule(creep, this),
            build: new BuildModule(creep, this),
            upgrade: new UpgradeModule(creep, this)
        }
    }

    /**
     * Orders the allrounder creep to perform actions in this order of importance:
     * Build Structures, Upgrade, Collect Energy, Mine Energy
     */
    public control() {
        if (this.memory.currentTask === CreepTasks.building) {
            // Continue building / travelling to build site
            this.modules.build.buildConstructionSite();
        } else if (this.memory.currentTask === CreepTasks.upgrading) {
            // Continue upgrading / travelling to controller
            this.modules.upgrade.upgradeController();
        } else if (this.creepIsFull()) {
            if (this.modules.build.roomHasConstructionSites()) {
                // Try building
                super.setTask(CreepTasks.building);
                this.modules.build.buildConstructionSite();
            } else {
                // Upgrade instead
                super.setTask(CreepTasks.upgrading);
                this.modules.upgrade.upgradeController();
            }
        } else {
            // Retrieve energy from the closest storage
            super.setTask(CreepTasks.collectingEnergy);
            const retrieveSucceeded = (this.modules.transfer.retrieveEnergy() !== CustomActionResponse.ok);

            if (!retrieveSucceeded) {
                // Mine for more energy
                super.setTask(CreepTasks.mining);
                this.modules.mine.mineForEnergy();
            }
        }
    }

}
