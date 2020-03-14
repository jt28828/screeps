import { CreepControllerModule } from "./base/creep-controller-module";

/** Adds the ability for a creep to mine */
export class MinerModule extends CreepControllerModule {

    /** Collects energy from a source */
    public mineForEnergy() {
        let source: Source;
        if (!this.creepHasMiningTarget()) {
            const newTarget = this.getNewMiningTarget();
            if (newTarget == null) {
                // Couldn't find a source
                return;
            }
            source = newTarget;

        } else {
            // Source's can't be deleted so force type as it'll always return the source, not null
            source = Game.getObjectById(this._creep.memory.currentTaskTargetId) as Source;
        }

        if (this._creep.pos.inRangeTo(source.pos, 1)) {
            // Is close enough to harvest
            this._creep.harvest(source);
        } else {
            // Needs to move closer
            this._controller.moveTo(source.pos);
        }
    }

    /** Returns whether the current creep has selected an energy storage target for collection or depositing */
    public creepHasMiningTarget() {
        return this._creep.memory.currentTaskTargetId !== undefined;
    }

    /** Finds the closest source in the room to the current creep and sets that as their permanent target */
    public getNewMiningTarget(excludeSourceId?: string): Source | null {
        // Creep hasn't been assigned a target yet. Assign it and save in the room's memory as well.
        let sources = this._controller._roomState.room.find(FIND_SOURCES);

        // Strip out excluded sources
        if (excludeSourceId != null) {
            sources = sources.filter(source => source.id !== excludeSourceId);
        }

        const closestSource = this._creep.pos.findClosestByPath(sources, {});

        if (closestSource == null) {
            console.error("A mining creep is in a room with no sources or all the sources were already full");
            // Kill the creep
            this._creep.say("I have no reason to live");
            this._creep.suicide();
            return null;
        }

        this._creep.memory.currentTaskTargetId = closestSource.id;
        return closestSource;
    }
}