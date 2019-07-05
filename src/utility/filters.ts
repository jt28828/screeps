export function filterForEnergy(resource: Resource) {
    const minAmount = 100;
    return resource.amount >= minAmount && resource.resourceType === RESOURCE_ENERGY;
}

export function filterNonEmptyStorage(structure: Structure) {
    const structureIsStorage = structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
    if (!structureIsStorage) {
        return false;
    }
    const structureIsEmpty = (structure as StructureContainer).store.energy > 0;
    return !structureIsEmpty;
}

export function filterNonFullStorage(structure: Structure) {
    const structureIsContainer = structure.structureType === STRUCTURE_CONTAINER;
    if (!structureIsContainer) {
        return false;
    }
    const structureIsFull = (structure as StructureContainer).store.energy === (structure as StructureContainer).storeCapacity;
    return !structureIsFull;
}
