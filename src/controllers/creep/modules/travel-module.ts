import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";
import { CreepTasks } from "../../../enums/creep-tasks";
import { CreepRole } from "../../../enums/creep-role";

/** Adds the ability for a creep to deposit and retrieve energy from containers */
export class TravelModule extends CreepControllerModule {
    /** Deposits carried energy into the closest storage */
    public travelToOtherRoom(travelFlag?: Flag): CustomActionResponse {
        if (travelFlag != null) {
            if (this.creepIsTraveller(this._creep) && !this._creep.memory.hasReachedDestination) {
                if (!this._controller.isNextTo(travelFlag.pos)) {
                    this._creep.moveTo(travelFlag.pos);
                    this._controller.setTask(CreepTasks.travelling);
                    return CustomActionResponse.ok;
                } else {
                    this.onDestinationReached(this._creep);
                }
            }
        }
        this._controller.clearTask();
        return CustomActionResponse.noEntitiesPresent;
    }

    /** When the destination has been reach then convert to an allrounder */
    private onDestinationReached(creep: TravellerCreep) {
        creep.memory.hasReachedDestination = true;
        this._controller.clearTask();
        this._controller.changeRole(CreepRole.allRounder);
    }

    /** Returns whether the creep is a miner*/
    private creepIsTraveller(creep: Creep): creep is TravellerCreep {
        return creep.memory.currentRole === CreepRole.traveller;
    }

}