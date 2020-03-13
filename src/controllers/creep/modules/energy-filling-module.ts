import { CreepControllerModule } from "./base/creep-controller-module";

/** Provides methods for filling the spawn or extensions with energy */
export class EnergyFillingModule extends CreepControllerModule {
    public fillClosest() {
        if (this._creep.memory.currentTaskTargetId !== undefined) {
            // Creep already on the way to a target.
            const target = this.getEnergyTarget(this._creep.memory.currentTaskTargetId);

            if (target == null) {
                // Target has been removed, wipe and start again
                this._controller.clearTask();
            } else {
                const response = this._creep.transfer(target, RESOURCE_ENERGY);

                if (response === ERR_NOT_IN_RANGE) {
                    this._controller.moveTo(target.pos);
                } else if (response === ERR_NOT_ENOUGH_ENERGY) {
                    this._controller.clearTask();
                }
            }
        } else {
            this.findNewEnergyFillTarget();
        }
    }

    private findNewEnergyFillTarget(): void {
        const energyTargets = this._controller._roomState.myStructures.filter(
            struct => struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION
        ) as (StructureExtension | StructureSpawn)[];

        const energyTarget = this._controller.findClosest(energyTargets);
        this._controller.memory.currentTaskTargetId = energyTarget?.id ?? undefined;
    }

    private getEnergyTarget(targetId: string) {
        return this._controller._roomState.myStructures.find(struct => struct.id === targetId);
    }
}