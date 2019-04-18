export class StructureUtils {
    /** Finds and returns storage structures in the given array that have energy in them */
    public static findNonEmptyStorageStructures(structures: Structure[]): Structure[] | null {
        const found = structures.filter((structure) => {
            return (
                structure.structureType === STRUCTURE_CONTAINER &&
                (structure as StructureContainer).store.energy > 0
            );
        });

        if (found == null || found.length === 0) {
            // No energy storing structures found
            return null;
        }

        return found;
    }

    /** Finds and returns storage structures in the given array */
    public static findNonFullStorageStructures(structures: Structure[]): Structure[] | null {
        const found = structures.filter((structure) => {
            return (
                structure.structureType === STRUCTURE_CONTAINER &&
                (structure as StructureContainer).store.energy < (structure as StructureContainer).storeCapacity
            );
        });

        if (found == null || found.length === 0) {
            // No energy storing structures found
            return null;
        }

        return found;
    }
}
