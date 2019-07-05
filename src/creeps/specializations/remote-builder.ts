import { BuilderController } from "../builder";
import { IBuilderCreep } from "../../interfaces/builder-creep";
import { remoteBuildSiteFlag } from "../../constants/flags";
import { MyCreepRoles } from "../../types/roles";
import { RoomState } from "../../models/room-state";

export class RemoteBuilderController extends BuilderController {
    private readonly remoteBuildFlag: Flag;

    constructor(creep: IBuilderCreep, roomState: RoomState) {
        super(creep, roomState);
        this.remoteBuildFlag = Game.flags[remoteBuildSiteFlag];
    }

    public startWork(): void {

        if (this.remoteBuildFlag == null) {
            this.convertToHarvester();
        }
        const isInRoom = this.creep.pos.roomName === this.remoteBuildFlag.pos.roomName;
        const isNextToFlag = this.creep.pos.inRangeTo(this.remoteBuildFlag.pos, 1);

        if (!isInRoom || !isNextToFlag) {
            this.creep.say("🗺 Travel");
            this.moveCreepToRoomObject(this.remoteBuildFlag);
        } else {
            // Is currently in the right room. Convert to a regular builder and delete flag if needed
            this.convertToRegularBuilder();
            const roomHasSpawn = this.creep.room.find(FIND_MY_SPAWNS);
            if (roomHasSpawn) {
                // Room already has spawn. Delete the flag so no more builders come
                this.remoteBuildFlag.remove();
            }
        }
    }

    /** Converts the builder into a harvest to supply the energy for the new room */
    private convertToHarvester() {
        // Clear memory variables that won't be used by harvester
        delete this.creep.memory.isBuilding;

        // Convert into a builder
        this.creep.say(" Switching");
        this.creep.memory.role = MyCreepRoles.harvester;
    }

    /** Converts back into a regular builder for this room */
    private convertToRegularBuilder() {
        this.creep.memory.role = MyCreepRoles.builder;
        this.wipeTaskMemory();
    }
}
