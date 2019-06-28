export class StructureUtils {

    /** Finds and returns storage structures in the given array that have energy in them */
    public static findNonEmptyStorageStructures(structures: Structure[]): Structure[] | null {
        // Find both containers AND storage
        const containersAndStorage: Structure[] = [];

        for (let i = 0; i < structures.length; i++) {
            // Check for containers
            if (structures[i].structureType === STRUCTURE_CONTAINER || structures[i].structureType === STRUCTURE_STORAGE &&
                (structures[i] as StructureContainer).store.energy > 0) {
                // Found a non-full container or storage
                containersAndStorage.push(structures[i]);
            }
        }

        if (containersAndStorage.length === 0) {
            // No energy storing structures found
            return null;
        }

        return containersAndStorage;
    }

    /** Finds and returns storage structures in the given array */
    public static findNonFullStorageStructures(structures: Structure[]): Structure[] | null {
        // Find both containers AND storage
        const containersAndStorage: Structure[] = [];

        for (let i = 0; i < structures.length; i++) {
            // Check for containers
            const thisStructure = structures[i];
            if (thisStructure.structureType === STRUCTURE_CONTAINER || thisStructure.structureType === STRUCTURE_STORAGE) {
                if ((thisStructure as StructureContainer).store.energy < (thisStructure as StructureContainer).storeCapacity) {
                    // Found a non-full container or storage
                    containersAndStorage.push(thisStructure);
                }
            }
        }

        if (containersAndStorage.length === 0) {
            // No energy storing structures found
            return null;
        }

        return containersAndStorage;
    }
}
