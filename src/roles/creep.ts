import { IMyCreep } from "../interfaces/my-creep";
import { StructureUtils } from "../utility/structure-utils";
import { ICurrentRoomState } from "../interfaces/room";

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
    protected harvestOrTravel(allowLongrange: boolean = false) {
        let miningZone: Source;
        if (this.creep.memory.miningTarget == null) {
            if (!allowLongrange) {
                miningZone = this.getClosestSource();
            } else {
                miningZone = this.getRandomSource();
            }
            this.creep.memory.miningTarget = miningZone.id;
        } else {
            const currentMiningTarget = Game.getObjectById(this.creep.memory.miningTarget) as Source;
            miningZone = (currentMiningTarget != null) ? currentMiningTarget : this.getClosestSource();
        }

        if (this.creep.pos.inRangeTo(miningZone.pos, 1)) {
            this.creep.harvest(miningZone);
        } else {
            this.creep.moveTo(miningZone, {visualizePathStyle: {stroke: "#ffaa00"}});
        }
    }

    /** Removes the current mining target from the creep so it can do something else */
    protected stopHarvesting() {
        this.creep.memory.miningTarget = null;
    }

    /** Attempts to take energy from either containers or storage */
    protected retrieveEnergyFromStorage(): boolean {
        let destinationStructure: Structure | null = null;

        if (this.creep.memory.storageTarget == null) {
            // Get a new storage target
            const storageStructures = StructureUtils.findNonEmptyStorageStructures(this.roomState.structures);

            if (storageStructures != null) {
                this.creep.memory.storageTarget = storageStructures[0].id;
                destinationStructure = storageStructures[0];
            }
        } else {
            // Find existing target
            destinationStructure = Game.getObjectById(this.creep.memory.storageTarget) as Structure;
        }

        if (destinationStructure == null) {
            return false;
        }

        // Move to and take energy from any storage container
        if (this.creep.pos.inRangeTo(destinationStructure.pos, 1)) {
            this.creep.withdraw(destinationStructure, RESOURCE_ENERGY);
        } else {
            this.creep.moveTo(destinationStructure, {visualizePathStyle: {stroke: "#ffffff"}});
        }
        return true;
    }

    /** Attempts to deposit energy in either containers or storage */
    protected depositEnergyInStorage(): boolean {
        const storageStructures = StructureUtils.findNonFullStorageStructures(this.roomState.structures);

        if (storageStructures == null) {
            return false;
        }

        // Move to and store energy in any storage container
        if (this.creep.transfer(storageStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(storageStructures[0], {visualizePathStyle: {stroke: "#ffffff"}});
        }
        return true;
    }

    private getRandomSource(): Source {
        const zones = this.creep.room.find(FIND_SOURCES);
        const index = Math.floor(Math.random() * zones.length);
        return zones[index];
    }

    private getClosestSource(): Source {
        return this.creep.room.find(FIND_SOURCES)[0];
    }
}
