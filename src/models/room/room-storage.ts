/** Stores the reference to structures like containers and storage where energy can be stored later */
export class RoomStorage {
    /** Structures that store energy and are not currently empty */
    public nonEmptyContainers: StructureContainer[];
    /** Structures that store energy and are not currently full */
    public nonFullContainers: StructureContainer[];
    /** A reference to the storage in the room */
    public storage: StructureStorage | undefined;

    constructor(nonEmptyContainers: StructureContainer[], nonFullContainers: StructureContainer[], storage?: StructureStorage) {
        this.nonEmptyContainers = nonEmptyContainers;
        this.nonFullContainers = nonFullContainers;
        this.storage = storage;
    }

    /** Returns a list of storage containers that are not full */
    public getNonFull(): (StructureStorage | StructureContainer)[] {
        if (this.storage != null && this.storage.store.energy < this.storage.storeCapacity) {
            return [...this.nonFullContainers, this.storage];
        } else {
            return this.nonFullContainers;
        }
    }

    /** Returns a list of storage containers that are not empty */
    public getNonEmpty(): (StructureStorage | StructureContainer)[] {
        if (this.storage != null && this.storage.store.energy > 0) {
            return [...this.nonEmptyContainers, this.storage];
        } else {
            return this.nonEmptyContainers;
        }
    }
}
