import { filterNonEmptyStorage, filterNonFullStorage } from "./filters";

export class StructureUtils {

    /** Finds and returns storage structures in the given array that have energy in them */
    public static findNonEmptyStorageStructures(structures: Structure[]): Structure[] {
        // Find containers that aren't yet full
        return structures.filter(filterNonEmptyStorage);
    }

    /** Finds and returns storage structures in the given array */
    public static findNonFullStorage(structures: Structure[], creep: Creep): Structure[] {
        // Find both containers AND storage
        const containersAndStorage = structures.filter(filterNonFullStorage);
        // Finally append the current room's store if it exists
        const roomStore = creep.room.storage;
        if (roomStore != null) {
            containersAndStorage.push(roomStore);
        }

        return containersAndStorage;
    }
}
