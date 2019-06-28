import { IMyCreep } from "../../interfaces/my-creep";
import { StructureUtils } from "../../utility/structure-utils";
import { ICurrentRoomState } from "../../interfaces/room";

/** Contains functions that are used across all creep types */
export class CreepController {
    /** A reference to the creep to control */
    protected creep: IMyCreep;
    /** An indicator as to the current state of the room this creep is in */
    protected roomState: ICurrentRoomState;

    constructor(creep: IMyCreep, roomState: ICurrentRoomState) {
        this.creep = creep;
        this.roomState = roomState;
    }

    protected creepIsFull(): boolean {
        return this.creep.carry.energy === this.creep.carryCapacity;
    }

    /** Attempts to harvest energy if within range or moves closer if not */
    protected harvestOrTravel() {
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

        if (this.creep.pos.isNearTo(miningZone.pos)) {
            this.creep.harvest(miningZone);
        } else {
            this.moveCreepToPos(miningZone.pos);
        }
    }

    /** Attempts to take energy from either containers or storage */
    protected retrieveEnergyFromStorage(): boolean {
        let destinationStructure: Structure | null = null;

        if (this.creep.memory.storageTarget == null) {
            // Get a new storage target
            const storageStructures = StructureUtils.findNonEmptyStorageStructures(this.roomState.structures);

            if (storageStructures != null) {
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
            return false;
        }

        // Move to and take energy from any storage container
        if (this.creep.pos.isNearTo(destinationStructure.pos)) {
            const success = this.creep.withdraw(destinationStructure, RESOURCE_ENERGY);
            if (success !== OK) {
                // Clear memory and try another
                this.wipeTaskMemory();
                return false;
            }
        } else {
            this.moveCreepToPos(destinationStructure.pos);
        }
        return true;
    }

    /** Attempts to deposit energy in either containers or storage */
    protected depositEnergyInStorage(): boolean {
        let destinationStructure: Structure | null = null;

        if (this.creep.memory.storageTarget == null) {
            // Get a new storage target
            const storageStructures = StructureUtils.findNonFullStorageStructures(this.roomState.structures);

            if (storageStructures != null) {
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
            visualizePathStyle: {stroke: "#ffaa00"},
            reusePath: 10,
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
    protected getClosestRoomObject<T extends RoomObject>(objectList: T[]): T | null {
        return this.creep.pos.findClosestByPath(objectList);
    }

    private getClosestSource(): Source | null {
        return this.creep.pos.findClosestByPath(this.creep.room.find(FIND_SOURCES));
    }
}
