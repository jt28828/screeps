import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";
import { CreepController } from "../base/creep-controller";
import { CreepRole } from "../../../enums/creep-role";

/** Adds the ability for a creep to mine */
export class MinerModule extends CreepControllerModule {
    private readonly _forMiner: boolean;

    constructor(creep: Creep, controller: CreepController, forSpecialisedMiner: boolean = false) {
        super(creep, controller);
        this._forMiner = forSpecialisedMiner;
    }

    /** Collects energy from a source */
    public mineForEnergy(): CustomActionResponse {
        let source: Source;
        if (!this.creepHasMiningTarget()) {
            const newTarget = this.getNewMiningTarget();
            if (newTarget == null) {
                // Couldn't find a source
                return CustomActionResponse.noEntitiesPresent;
            }
            source = newTarget;
            this._creep.memory.currentTaskTargetId = source.id;
        } else {
            // Source's can't be deleted so force type as it'll always return the source, not null
            source = Game.getObjectById(this._creep.memory.currentTaskTargetId as Id<Source>) as Source;
        }

        const response = this._creep.harvest(source);

        if (response === ERR_NOT_IN_RANGE) {
            // Needs to move closer
            this._controller.moveTo(source.pos);
        }

        return CustomActionResponse.ok;
    }

    /** Returns whether the current creep has selected an energy storage target for collection or depositing */
    public creepHasMiningTarget() {
        return this._creep.memory.currentTaskTargetId !== undefined;
    }

    /** Finds the closest source in the room to the current creep and sets that as their permanent target */
    public getNewMiningTarget(): Source | null {
        // Creep hasn't been assigned a target yet. Assign it and save in the room's memory as well.
        let sources = this._controller._roomState.room.find(FIND_SOURCES);

        if (this._forMiner) {
            // This module is being used for a specialised miner, only return them a source that doesn't have a miner creep next to it
            // Can be expensive but should only be run once for the lifetime of each miner
            const approvedSources: Source[] = [];

            const otherMiners = this._controller._roomState.myCreeps.filter(creep => creep.memory.currentRole === CreepRole.miner);

            for (let i = 0; i < sources.length; i++) {
                if (otherMiners.every(miner => miner.memory.currentTaskTargetId !== sources[i].id)) {
                    // No miners have this source as their target, add it to the approved list
                    approvedSources.push(sources[i]);
                }
            }

            sources = approvedSources;
        }

        const closestSource = this._creep.pos.findClosestByPath(sources, {});

        if (closestSource == null && this._controller._roomState.room.memory.sourceCount === 0) {
            console.error("A mining creep is in a room with no sources");
            // Kill the creep
            this._creep.say("I have no reason to live");
            Game.notify(`You have more miner creeps than sources in room: ${this._controller._roomState.room.name}`);
            this._creep.suicide();
            return null;
        }

        return closestSource;
    }
}