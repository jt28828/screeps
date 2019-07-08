import { IMyCreep } from "../../interfaces/my-creep";
import { RoomState } from "../../models/room/room-state";
import { CreepAction } from "../../models/enums/creep-action";

/** Contains functions that are used across all creep types */
export class CreepController {
    /** A reference to the creep to control */
    protected creep: IMyCreep;
    /** An indicator as to the current state of the room this creep is in */
    protected roomState: RoomState;

    constructor(creep: IMyCreep, roomState: RoomState) {
        this.creep = creep;
        this.roomState = roomState;
    }

    /** Whether or not the current creep is full */
    protected get creepEnergyFull(): boolean {
        return this.creep.carry.energy === this.creep.carryCapacity;
    }

    /** Whether or not the current creep is empty */
    protected get creepEnergyEmpty(): boolean {
        return this.creep.carry.energy === 0;
    }

    /** Whether or not the current creep is collecting energy */
    protected get creepCurrentlyCollecting(): boolean {
        return this.creep.memory.isMining === true || this.creep.memory.isCollecting === true;
    }

    /** Indicates whether this creep should begin collecting energy */
    protected get creepShouldCollect() {
        return !this.creepCurrentlyCollecting && this.creepEnergyEmpty;
    }

    /** Determines whether the creep should stop collecting energy and switch jobs */
    protected get creepShouldStopCollecting(): boolean {
        return this.creepEnergyFull && this.creepCurrentlyCollecting;
    }

    /** Gets the creep to say whichever action they are switching to */
    protected sayNewAction(action: CreepAction) {
        let message = "";
        switch (action) {
            case CreepAction.harvest:
                message = "⛏️ harvest";
                break;
            case CreepAction.fillSpawn:
                message = "📦 Fill";
                break;
            case CreepAction.build:
                message = "👷 build";
                break;
            case CreepAction.upgrade:
                message = "⬆️ upgrade";
                break;
            case CreepAction.store:
                message = "📦 Store";
                break;
            case CreepAction.travel:
                message = "🗺 Travel";
                break;
        }
        this.creep.say(message);
    }

    /** Attempts to harvest energy if within range or moves closer if not */
    protected collectEnergy(allowStorage: boolean = false) {
        if (this.roomState.resources.droppedEnergy.length !== 0) {
            // Try and collect the dropped energy first
            this.collectDroppedEnergy();
        } else if (allowStorage) {
            // Try storage next
            this.collectEnergyFromStorage();
        } else {
            // Otherwise mine for it
            this.mineForResources();
        }
    }

    /** Attempts to deposit energy in either containers or storage */
    protected depositEnergyInStorage(): boolean {
        let destinationStructure: Structure | null = null;

        if (this.creep.memory.storageTarget == null) {
            // Get a new storage target
            const storageStructures = this.roomState.storage.getNonFull();

            if (storageStructures.length === 0) {
                // No storage found.
                return false;
            }

            let closestStorage = this.creep.pos.findClosestByPath(storageStructures);

            if (closestStorage == null) {
                // No storage was found to path to. Just try any one
                closestStorage = storageStructures[0];
            }

            this.creep.memory.storageTarget = closestStorage.id;
            destinationStructure = closestStorage;

        } else {
            // Find existing target
            destinationStructure = Game.getObjectById(this.creep.memory.storageTarget) as Structure;
        }

        if (destinationStructure == null) {
            return false;
        }
        // Move to and store energy in any storage container
        let success: ScreepsReturnCode;
        if (this.creep.pos.isNearTo(destinationStructure)) {
            success = this.creep.transfer(destinationStructure, RESOURCE_ENERGY);
        } else {
            success = this.moveCreepToPos(destinationStructure.pos);
        }

        return success === OK;
    }

    /** Wipes the memory of the current creep's task */
    protected wipeTaskMemory() {
        this.creep.memory.storageTarget = null;
        this.creep.memory.miningTarget = null;
        this.creep.memory.isCollecting = false;
        this.creep.memory.isMining = false;
    }

    /** Moves a creep to the given position and handles stuck detection if required */
    protected moveCreepToPos(position: RoomPosition): ScreepsReturnCode {
        const success = this.creep.moveTo(position, {
            visualizePathStyle: {stroke: "#777a71"},
            reusePath: 15,
            ignoreCreeps: false
        });

        if (success !== OK && success !== ERR_TIRED) {
            // Creep got stuck this turn. Mark it down and if it's been stuck for at least 2 turns then force re-path
            if (++this.creep.memory.stuckCounter >= 2) {
                this.creep.say("I'm Stuck");
                this.creep.memory.stuckCounter = 0;
                return this.creep.moveTo(position, {reusePath: 0, ignoreCreeps: false});
            }
        }
        return OK;
    }

    /** Moves the currently controller creep to the provided room object */
    protected moveCreepToRoomObject<T extends RoomObject>(roomObject: T): ScreepsReturnCode {
        return this.moveCreepToPos(roomObject.pos);
    }

    /** Returns the object out of the given list that is closest to the current creep */
    protected getClosestItem<T extends RoomObject>(objectList: T[]): T | null {
        return this.creep.pos.findClosestByPath(objectList);
    }

    /** Attempts to take energy from either containers or storage */
    private collectEnergyFromStorage(): boolean {
        let destinationStructure: Structure | null = null;

        if (this.creep.memory.storageTarget == null) {
            // Get a new storage target
            const storageStructures = this.roomState.storage.getNonEmpty();

            if (storageStructures.length !== 0) {
                const closestStorage = this.creep.pos.findClosestByPath(storageStructures);

                if (closestStorage) {
                    this.creep.memory.storageTarget = closestStorage.id;
                    destinationStructure = closestStorage;
                } else {
                    this.creep.memory.storageTarget = storageStructures[0].id;
                    destinationStructure = storageStructures[0];
                }
            }
        } else {
            // Find existing target
            destinationStructure = Game.getObjectById(this.creep.memory.storageTarget) as Structure;
        }

        if (destinationStructure == null) {
            // No storage in this room
            return false;
        }

        // Move to and take energy from any storage container
        const success = this.creep.withdraw(destinationStructure, RESOURCE_ENERGY);
        if (success === ERR_NOT_IN_RANGE) {
            this.moveCreepToPos(destinationStructure.pos);
        } else if (success !== OK) {
            // Clear memory and try another
            this.wipeTaskMemory();
            return false;
        }

        this.creep.memory.isCollecting = true;
        return true;
    }

    /** Directs this creep to pick up energy that has been dropped on the ground */
    private collectDroppedEnergy() {
        const closestDropPoint = this.creep.pos.findClosestByPath(this.roomState.resources.droppedEnergy);

        if (closestDropPoint != null) {
            const response = this.creep.pickup(closestDropPoint);
            if (response === ERR_NOT_IN_RANGE) {
                this.moveCreepToRoomObject(closestDropPoint);
            }
        }
    }

    /** Chooses a mining spot and mines for resources */
    private mineForResources(): void {
        let miningZone: Source | null;
        if (this.creep.memory.miningTarget == null) {
            miningZone = this.getClosestSource();
            if (miningZone == null) {
                // There are no sources in this room
                return;
            }
            this.creep.memory.miningTarget = miningZone.id;
        } else {
            const currentMiningTarget = Game.getObjectById(this.creep.memory.miningTarget) as Source;
            miningZone = (currentMiningTarget != null) ? currentMiningTarget : this.getClosestSource();
        }

        if (miningZone == null) {
            // There are no sources in this room that the creep can currently reach
            return;
        }

        const response = this.creep.harvest(miningZone);
        if (response === ERR_NOT_IN_RANGE) {
            this.moveCreepToRoomObject(miningZone);
        }
        this.creep.memory.isMining = true;
    }

    private getClosestSource(): Source | null {
        // Try and find either the closest source or just any if need
        const roomSources = this.roomState.resources.sources;
        let closestSource = this.creep.pos.findClosestByPath(roomSources);

        if (closestSource == null) {
            closestSource = roomSources[0];
        }
        return closestSource;
    }
}
