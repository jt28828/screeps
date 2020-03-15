import { CreepControllerModule } from "./base/creep-controller-module";
import { CustomActionResponse } from "../../../enums/custom-action-response";
import { CreepController } from "../base/creep-controller";
import { CreepRole } from "../../../enums/creep-role";

/** Adds the ability for a creep to mine */
export class MinerModule<TCreepType extends Creep = Creep> extends CreepControllerModule<TCreepType> {

    constructor(creep: Creep, controller: CreepController<TCreepType>) {
        super(creep, controller);
    }

    /** Collects energy from a source */
    public mineForEnergy(): CustomActionResponse {
        let source: Source;
        if (this._creep.memory.currentTaskTargetId === undefined) {
            const newTarget = this.getNewMiningTarget();
            if (newTarget == null) {
                // Couldn't find a source
                return CustomActionResponse.noEntitiesPresent;
            }
            source = newTarget;
            this._creep.memory.currentTaskTargetId = source.id;
        } else {
            // Source's can't be deleted so force type as it'll always return the source, not null
            source = Game.getObjectById(this._creep.memory.currentTaskTargetId) as Source;
        }

        const response = this._creep.harvest(source);

        if (response === ERR_NOT_IN_RANGE) {
            // Needs to move closer
            this.moveToSourceOrContainer(source);
        }

        return CustomActionResponse.ok;
    }

    /** Finds the closest source in the room to the current creep and sets that as their permanent target */
    public getNewMiningTarget(): Source | null {
        // Creep hasn't been assigned a target yet. Assign it and save in the room's memory as well.
        let sources = this._controller._roomState.room.find(FIND_SOURCES);

        if (this.creepIsMiner(this._creep)) {
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

    /** Moves the creep to any source block or on top of a container if a miner */
    private moveToSourceOrContainer(source: Source) {
        let targetPosition = source.pos;
        if (this.creepIsMiner(this._creep)) {
            if (this._creep.memory.containerTargetId === undefined) {
                // Need to position self on top of container, if possible. Get one
                const allContainers = this.getRoomContainers();

                // Get the closest one to the target source. No need for pathing
                const closestContainer = source.pos.findInRange(allContainers, 1)[0];

                if (closestContainer != null) {
                    // Found a container, set it as the target
                    this._creep.memory.containerTargetId = closestContainer.id;
                    targetPosition = closestContainer.pos;
                }
            } else {
                // Creep already travelling to a container. set it as the target
                const target = this.getTargetContainer(this._creep.memory.containerTargetId);

                if (target == null) {
                    // Target container has been deleted, wipe it from memory but continue heading towards source
                    delete this._creep.memory.containerTargetId;
                } else {
                    // Target was found. Set as travel point
                    targetPosition = target.pos;
                }
            }
        }
        // Move to the selected position, either source or container
        this._controller.moveTo(targetPosition);
    }

    /** Returns whether the creep is a miner*/
    private creepIsMiner(creep: Creep): creep is MinerCreep {
        return creep.memory.currentRole === CreepRole.miner;
    }

    private getRoomContainers(): StructureContainer[] {
        return this._controller._roomState.structures.filter(struct => struct.structureType === STRUCTURE_CONTAINER) as StructureContainer[];
    }

    private getTargetContainer(structId: Id<StructureContainer>): StructureContainer | null {
        return this._controller._roomState.structures.find(struct => struct.id == structId) as StructureContainer;
    }
}