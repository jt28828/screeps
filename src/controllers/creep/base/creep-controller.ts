import { RoomMemoryManager } from "../../../memory/room-memory-manager";
import { CreepTasks } from "../../../enums/creep-tasks";
import { CreepControllerModule } from "../modules/base/creep-controller-module";
import { StorageUtils } from "../../../utilities/storage-utils";

export abstract class CreepController<TCreepType extends Creep = Creep> {
    /** The state of the room the creep is currently in */
    public readonly _roomState: RoomMemoryManager;
    /** The creep this controller instance is performing actions for */
    protected readonly _creep: TCreepType;

    protected abstract modules: { [key: string]: CreepControllerModule };

    protected constructor(roomState: RoomMemoryManager, creep: TCreepType) {
        this._roomState = roomState;
        this._creep = creep;
    }

    public abstract control(): void;

    protected abstract getNewTaskForCreep(): void;

    public get memory(): TCreepType["memory"] {
        return this._creep.memory;
    }

    public get currentRoom(): Room {
        return this._roomState.room;
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
        return this._creep.memory.currentTaskTargetId !== undefined && (this.memory.currentTask === CreepTasks.collectingEnergy || this.memory.currentTask === CreepTasks.depositingEnergy);
    }

    /** Returns whether the managed creep is next to the provided position */
    public isNextTo(position: RoomPosition) {
        return this._creep.pos.inRangeTo(position, 1);
    }

    /** Returns whether the managed creep is next to the provided position */
    public findClosest<T extends { pos: RoomPosition }>(list: T[]): T | null {
        return this._creep.pos.findClosestByPath(list);
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
        if (this._creep.memory.currentTask === null) {
            this.sayNewTask(task);
        }
        this._creep.memory.currentTask = task;
    }

    public creepIsFull(): boolean {
        return StorageUtils.storeIsFull(this._creep);
    }

    public creepIsEmpty(): boolean {
        StorageUtils.storeIsEmpty(this._creep);
        return this._creep.store.energy === 0;
    }

    /** Get the creep to say when they're switching tasks */
    private sayNewTask(task: CreepTasks) {
        let sayText: string;
        switch (task) {
            case CreepTasks.mining:
                sayText = "⛏ Mine";
                break;
            case CreepTasks.depositingEnergy:
                sayText = "⚡ Deposit";
                break;
            case CreepTasks.collectingEnergy:
                sayText = "🔌 Collect";
                break;
            case CreepTasks.building:
                sayText = "🛠 Build";
                break;
            case CreepTasks.repairing:
                sayText = "🛠 Repair";
                break;
            case CreepTasks.upgrading:
                sayText = "⬆ Upgrade";
                break;
            case CreepTasks.fillingSpawns:
                sayText = "➕ Spawn";
                break;
            case CreepTasks.maintaining:
                sayText = "🔫 Towers";
                break;
            case CreepTasks.transporting:
                sayText = "🚚 Storing";
                break;
            default:
                sayText = "Unknown";
        }
        this._creep.say(sayText);
    }
}
