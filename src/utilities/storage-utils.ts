export class StorageUtils {
    public static storeIsFull<T extends { store: StoreDefinition }>(storageEntity: T) {
        return storageEntity.store.energy === storageEntity.store.getCapacity();
    }

    public static storeIsEmpty<T extends { store: StoreDefinition }>(storageEntity: T) {
        return storageEntity.store.energy === 0;
    }

    public static energyIsFull<T extends { store: Store<RESOURCE_ENERGY, false> }>(storageEntity: T) {
        return storageEntity.store.energy === storageEntity.store.getCapacity();
    }

    public static energyIsEmpty<T extends { energy: number, energyCapacity: number }>(storageEntity: T) {
        return storageEntity.energy === 0;
    }
}