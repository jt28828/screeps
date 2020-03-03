import { IController } from "../../../models/interfaces/controller";
import { RoomMemoryManager } from "../../../memory/room-memory-manager";

export class CreepController<TCreepType extends Creep = Creep> implements IController {
    /** The state of the room the creep is currently in */
    protected readonly _roomState: RoomMemoryManager;
    /** The creep this controller instance is performing actions for */
    protected readonly _creep: TCreepType;

    constructor(roomState: RoomMemoryManager, creep: TCreepType) {
        this._roomState = roomState;
        this._creep = creep;
    }

    public control() {
        this._creep.say("You haven't given me anything to do!!");
    }

    /** Moves the creep to the given target while using path caching and stuck detection */
    protected moveTo(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        // TODO Optimise beyond this
        return this._creep.moveTo(target);
    }

    /** Returns whether the current creep has selected an energy storage target for collection or depositing */
    protected creepHasEnergyTarget() {
        return this._creep.memory.energyCollectionTargetId !== undefined;
    }

    /** Used by creeps that use energy for their tasks (All except miners) */
    protected collectEnergy() {
        // TODO store energy storage targets in Roomstate
        if (!this.creepHasEnergyTarget()) {
            // No energy collection target set yet. Get one first
            this.getNewEnergyTarget();
        }
        const collectionTarget = Game.getObjectById<StructureContainer | StructureStorage>(this._creep.memory.energyCollectionTargetId);

        if (collectionTarget == null) {
            // Somehow the target was deleted since the last turn. Remove the reference from memory and try this function again
            this.clearEnergyTarget();
            this.collectEnergy();
            return;
        }

        if (!this._creep.pos.inRangeTo(collectionTarget.pos, 1)) {
            // Needs to move closer
            this.moveTo(collectionTarget.pos);
        } else {
            // Is close enough to collect
            this._creep.withdraw(collectionTarget, RESOURCE_ENERGY);
            this.clearEnergyTarget();
        }
    }

    /** Finds the closest source of saved energy to the current creep and saves it to the creeps memory */
    protected getNewEnergyTarget() {
        // No energy collection target set yet. Get one first
        const energyTargets: AnyStructure[] = this._roomState.structures
            .filter(struct => struct.structureType === STRUCTURE_CONTAINER || struct.structureType === STRUCTURE_STORAGE);

        // Get the closest to the current position
        const closest = this._creep.pos.findClosestByPath(energyTargets);

        // Save the target to memory
        this._creep.memory.energyCollectionTargetId = closest?.id;
    }

    /** Clears the managed creeps current energy target */
    protected clearEnergyTarget() {
        delete this._creep.memory.energyCollectionTargetId;
    }
}
