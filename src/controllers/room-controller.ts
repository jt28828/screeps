import { TownPlanner } from "./town-planner";
import { RoomStatus } from "../enums/room-status";
import { RoomState } from "../models/state/room-state";

export class RoomController {
    private _room: Room;
    private _roomFlags: ReadonlyArray<Flag>;
    private readonly _roomState: RoomState;


    constructor(room: Room) {
        this._room = room;
        if (this._room != null) {
            this._roomFlags = this._room.find(FIND_FLAGS);
            if (this._room.memory.roomStatus == null) {
                this._room.memory = RoomController.createDefaultRoomMemory(room);
            }
            if (this._room.memory.roomStatus === RoomStatus.owned) {
                this._roomState = this.calculateCurrentRoomState();
            } else {
                this._roomState = this.getForeignRoomState();
            }

        } else {
            // Room doesn't exist? (It always should)
            this._roomFlags = [];
        }
    }

    private static createDefaultRoomMemory(room: Room): RoomMemory {
        return {
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

    /** Returns information about the current state of the room */
    private calculateCurrentRoomState(): RoomState {
        const roomState = new RoomState(this._room);
        // Either regenerate the whole memory or just the volatile things depending on game ticks
        if (Game.time % 10) {
            // Update things that don't need to be updated all the time
            roomState.calculateNonVolatileRoomState().saveStateToMemory();
        }

        return roomState;
    }

    /** Controls the creeps and buildings in the current room */
    public controlRoom() {

    }

    /** Runs non-critical tasks, usually only every few ticks */
    public runNonCriticalTasks() {
        // Place automated build sites
        if (this._room.memory.roomStatus === RoomStatus.owned) {
            // Only build in owned rooms
            const townPlanner = new TownPlanner(this._room, this._roomFlags);
            townPlanner.placeBuildsites();
        }
    }

    private controlCreeps() {

    }
}
