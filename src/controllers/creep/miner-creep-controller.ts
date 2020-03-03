import { CreepController } from "./base/creep-controller";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { IController } from "../../models/interfaces/controller";

export class MinerCreepController extends CreepController<MinerCreep> implements IController {

    constructor(roomState: RoomMemoryManager, creep: MinerCreep) {
        super(roomState, creep);
    }

    /** Orders the miner creep to mine energy or deposit it */
    public control() {
        if (this.creepIsFull()) {
            // Deposit energy in the closest storage
            this.depositEnergy()
        } else {
            // Mine for more energy
            this.mineForEnergy();
        }
    }

    /** Deposits carried energy into the closest energy storage */
    private depositEnergy() {
        if (!super.creepHasEnergyTarget()) {
            // Get a target first
            super.getNewEnergyTarget();
        }

        const collectionTarget = Game.getObjectById<StructureContainer | StructureStorage>(this._creep.memory.energyCollectionTargetId);

        if (collectionTarget == null) {
            // Somehow the target was deleted since the last turn. Remove the reference from memory and skip this turn
            this.clearEnergyTarget();
            return;
        }

        if (collectionTarget.store.energy === collectionTarget.storeCapacity) {
            // Storage is full, don't move to another as creep is slow, just dump energy and mine again
            this.clearEnergyTarget();
            this._creep.drop(RESOURCE_ENERGY);
            return;
        }

        if (!this._creep.pos.inRangeTo(collectionTarget.pos, 1)) {
            // Needs to move closer
            this.moveTo(collectionTarget.pos);
        } else {
            // Is close enough to deposit
            this._creep.transfer(collectionTarget, RESOURCE_ENERGY);
            this.clearEnergyTarget();
        }
        this._creep.say("Depositing Energy ⚡");
    }

    /** Collects energy from a source */
    private mineForEnergy() {
        let source: Source;
        if (!this.creepHasMiningTarget()) {
            const newTarget = this.getNewMiningTarget();
            if (newTarget == null) {
                // Couldn't find a source and creep has killed itself.
                return;
            }
            source = newTarget;

        } else {
            // Source's can't be deleted so force type as it'll always return the source, not null
            source = Game.getObjectById(this._creep.memory.miningSourceId) as Source;
        }

        if (this._creep.pos.inRangeTo(source.pos, 1)) {
            // Is close enough to harvest
            this._creep.harvest(source);
        } else {
            // Needs to move closer
            this.moveTo(source.pos);
        }

        this._creep.say("Collecting Energy ⛏");
    }

    /** Returns whether the current creep has selected an energy storage target for collection or depositing */
    private creepHasMiningTarget() {
        return this._creep.memory.miningSourceId !== undefined;
    }

    /** Finds the closest source in the room to the current creep and sets that as their permanent target */
    private getNewMiningTarget(excludeSourceId?: string): Source | null {
        // Creep hasn't been assigned a target yet. Assign it and save in the room's memory as well.
        let sources = this._roomState.room.find(FIND_SOURCES);

        // Strip out excluded sources
        if (excludeSourceId != null) {
            sources = sources.filter(source => source.id !== excludeSourceId);
        }

        // TODO remove from memory in RoomMemoryManager after death
        const closestSource = this._creep.pos.findClosestByPath(sources, {});

        if (closestSource == null) {
            console.error("A mining creep is in a room with no sources or all the sources were already full");
            // Kill the creep
            this._creep.say("I have no reason to live");
            this._creep.suicide();
            return null;
        }

        this._creep.memory.miningSourceId = closestSource.id;

        if (this._roomState.room.memory.sourceMiners[closestSource.id] == null) {
            // First miner assigned to this source
            this._roomState.room.memory.sourceMiners[closestSource.id] = [];
        }

        if (this._roomState.room.memory.sourceMiners[closestSource.id].length < 2) {
            // Only 2 miners per source allowed max
            this._roomState.room.memory.sourceMiners[closestSource.id].push(this._creep.id);
        } else {
            // Source is already full, attempt to find another in the same room with less assigned
            return this.getNewMiningTarget(closestSource.id);
        }

        return closestSource;
    }

    private creepIsFull(): boolean {
        return this._creep.carry.energy === this._creep.carryCapacity;
    }
}
