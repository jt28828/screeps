import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { CreepTasks } from "../../enums/creep-tasks";
import { AllRounderCreepController } from "./allrounder-creep-controller";
import { TravelModule } from "./modules/travel-module";
import { remoteRoomDestination } from "../../constants/flag-constants";
import { CustomActionResponse } from "../../enums/custom-action-response";

export class TravellerCreepController extends AllRounderCreepController {
    private _travelModule: TravelModule;

    constructor(roomState: RoomMemoryManager, creep: TravellerCreep) {
        super(roomState, creep);
        this._travelModule = new TravelModule(creep, this);
    }

    public control(): void {
        switch (super.memory.currentTask) {
            case CreepTasks.travelling: // Continue collecting / travelling to dropped energy
                this._travelModule.travelToOtherRoom(Game.flags[remoteRoomDestination]);
                break;
            default:
                super.control();
                break;
        }
    }

    public getNewTaskForCreep(){
        const response = this._travelModule.travelToOtherRoom(Game.flags[remoteRoomDestination]);
        if (response !== CustomActionResponse.ok){
            super.getNewTaskForCreep();
        }
    }
}