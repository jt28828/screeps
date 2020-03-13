import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";

/** Provides methods for building and repairing structures */
export class BuildModule extends CreepControllerModule {

    /** Builds the closest construction site */
    public buildConstructionSite(): CustomActionResponse {

        if (this._controller.memory.currentTaskTargetId !== undefined) {
            // Creep has a target.
            const constructionSite = this.getTargetConstructionSite(this._controller.memory.currentTaskTargetId);
            if (constructionSite === undefined) {
                // Construction site doesn't exist, wipe from memory and start again
                this._controller.clearTaskTarget();
                this.buildConstructionSite();
            } else {
                const response = this._creep.build(constructionSite);

                if (response === ERR_NOT_IN_RANGE) {
                    // Not close enough, move to the construction site
                    this._controller.moveTo(constructionSite.pos);
                } else if (response === ERR_NOT_ENOUGH_ENERGY) {
                    // This creep is out of energy. Reset their task
                    this._controller.clearTask();
                }
            }
        } else {
            return this.getNewConstructionSite();
        }
        return CustomActionResponse.ok;
    }

    /** Gets a new construction target for the current creep */
    public getNewConstructionSite(): CustomActionResponse {
        let response: CustomActionResponse = CustomActionResponse.ok;

        const closestSite = this._controller.findClosest(this._controller._roomState.constructionSites);
        if (closestSite != null) {
            this._controller.memory.currentTaskTargetId = closestSite.id;
        } else {
            // No construction sites in the room, clear the creep's task so they can do something else
            this._controller.clearTask();
            response = CustomActionResponse.noEntitiesPresent;
        }

        return response;
    }

    /** Retrieves the construction site a creep has chosen to build */
    public getTargetConstructionSite(siteId: string): ConstructionSite | undefined {
        return this._controller._roomState.constructionSites.get(siteId);
    }

    /** Returns whether there are any construction sites in the room at all */
    public roomHasConstructionSites(): boolean {
        return this._controller._roomState.constructionSites.size !== 0;
    }
}