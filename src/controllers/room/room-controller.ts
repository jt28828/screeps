import { TownPlanner } from "./town-planner";
import { RoomStatus } from "../../enums/room-status";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { IController } from "../../models/interfaces/controller";

export class RoomController implements IController {
    private readonly _room: Room;
    private readonly _roomFlags: ReadonlyArray<Flag>;
    private readonly _roomState: RoomMemoryManager | undefined;


    constructor(room: Room) {
        this._room = room;
        if (this._room != null) {
            this._roomFlags = this._room.find(FIND_FLAGS);
            if (this._room.memory.roomStatus == null) {
                this._room.memory = RoomController.createDefaultRoomMemory(room);
            }
            if (this._room.memory.roomStatus === RoomStatus.owned) {
                this._roomState = new RoomMemoryManager(this._room);
            } else {
                this._roomState = new RoomMemoryManager(this._room);
            }

        } else {
            // Room doesn't exist? (It always should)
            this._roomFlags = [];
        }
    }

    private static createDefaultRoomMemory(room: Room): RoomMemory {
        return {
            sourceMiners: {},
            roomStatus: RoomStatus.unclaimed,
            roomIsSigned: false,
            damagedStructureIds: [],
            enemyIds: [],
            structureIds: [],
            myStructureIds: [],
            constructionSiteIds: [],
            // Sources won't change while the room exists, set and forget
            sourceIds: room.find(FIND_SOURCES).map(source => source.id)
        }
    }

    /** Controls the creeps and buildings in the current room */
    public control() {
        const test = this._roomState?.myCreeps;
        if (test?.length != null) {

        }

    }

    /** Runs non-critical tasks, usually only every few ticks */
    public runNonCriticalTasks() {
        this._roomState?.calculateNonVolatileRoomState()
            .saveStateToMemory();
    }

    /** Runs tasks for this room that only need to be run rarely */
    public runRareTasks() {
        // Place automated build sites
        if (this._room.memory.roomStatus === RoomStatus.owned) {
            // Only build in owned rooms
            const townPlanner = new TownPlanner(this._room, this._roomFlags);
            townPlanner.control();
        }
    }
}
