import { IController } from "../../../models/interfaces/controller";
import { RoomMemoryManager } from "../../../memory/room-memory-manager";
import { CreepTasks } from "../../../enums/creep-tasks";
import { CreepControllerModule } from "../modules/base/creep-controller-module";

export abstract class CreepController<TCreepType extends Creep = Creep> implements IController {
    /** The state of the room the creep is currently in */
    public readonly _roomState: RoomMemoryManager;
    /** The creep this controller instance is performing actions for */
    protected readonly _creep: TCreepType;

    protected abstract modules: { [key: string]: CreepControllerModule };

    constructor(roomState: RoomMemoryManager, creep: TCreepType) {
        this._roomState = roomState;
        this._creep = creep;
    }

    public get memory(): TCreepType["memory"] {
        return this._creep.memory;
    }

    public get currentRoom(): Room {
        return this._roomState.room;
    }

    public control() {
        this._creep.say("You haven't given me anything to do!!");
    }

    /** Moves the creep to the given target while using path caching and stuck detection */
    public moveTo(target: RoomPosition): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        const success = this._creep.moveTo(target, {
            visualizePathStyle: {stroke: "#257eff"},
            reusePath: 10,
            ignoreCreeps: false
        });

        if (success !== OK && success !== ERR_TIRED) {
            // Creep got stuck this turn. Mark it down and if it's been stuck for at least 2 turns then force re-path
            if (++this._creep.memory.stuckCounter >= 2) {
                this._creep.say("I'm Stuck");
                this._creep.memory.stuckCounter = 0;
                return this._creep.moveTo(target, {reusePath: 0, ignoreCreeps: false});
            }
        }
        return OK;
    }

    /** Returns whether the current creep has selected an energy storage target for collection or depositing */
    public creepHasEnergyTarget() {
        return this.memory.currentTask === CreepTasks.collectingEnergy || this.memory.currentTask === CreepTasks.depositingEnergy && this._creep.memory.currentTaskTargetId !== undefined;
    }

    /** Used by creeps that use energy for their tasks (All except miners) */
    public collectEnergy() {
        // TODO store energy storage targets in Roomstate
        if (!this.creepHasEnergyTarget()) {
            // No energy collection target set yet. Get one first
            this.getNewEnergyTarget();
        }
        const collectionTarget = Game.getObjectById<StructureContainer | StructureStorage>(this._creep.memory.currentTaskTargetId);

        if (collectionTarget == null) {
            // Somehow the target was deleted since the last turn. Remove the reference from memory and try this function again
            this.clearTaskTarget();
            this.collectEnergy();
            return;
        }

        if (!this._creep.pos.inRangeTo(collectionTarget.pos, 1)) {
            // Needs to move closer
            this.moveTo(collectionTarget.pos);
        } else {
            // Is close enough to collect
            this._creep.withdraw(collectionTarget, RESOURCE_ENERGY);
            this.clearTaskTarget();
        }
    }

    /** Finds the closest source of saved energy to the current creep and saves it to the creeps memory */
    public getNewEnergyTarget(nonEmpty: boolean = false): string | undefined {
        // No energy collection target set yet. Get one first
        const energyTargets: AnyStructure[] = [];

        this._roomState.structures.forEach((struct) => {
            if (struct.structureType === STRUCTURE_CONTAINER || struct.structureType === STRUCTURE_STORAGE) {
                if (nonEmpty && struct.store.energy !== 0) {
                    energyTargets.push(struct);
                }
            }
        });

        // Get the closest to the current position
        const closest = this._creep.pos.findClosestByPath(energyTargets);

        // Save the target to memory and return
        return this._creep.memory.currentTaskTargetId = closest?.id;
    }

    /** Returns whether the managed creep is next to the provided position */
    public isNextTo(position: RoomPosition) {
        return this._creep.pos.inRangeTo(position, 1);
    }

    /** Returns whether the managed creep is next to the provided position */
    public findClosest<T extends { pos: RoomPosition }>(objectMap: Map<string, T>): T | null {
        const objArray: T[] = [];

        for (const [, entry] of objectMap.entries()) {
            objArray.push(entry);
        }

        return this._creep.pos.findClosestByPath(objArray);
    }

    /** Clears the managed creep's current task target */
    public clearTaskTarget() {
        delete this._creep.memory.currentTaskTargetId;
    }

    /** Clears the managed creep's current task */
    public clearTask() {
        delete this._creep.memory.currentTaskTargetId;
        delete this._creep.memory.currentTask;
    }

    /** Sets the current task of the managed creep */
    public setTask(task: CreepTasks) {
        this._creep.memory.currentTask = task;
    }

    public creepIsFull(): boolean {
        return this._creep.carry.energy === this._creep.carryCapacity;
    }
}
