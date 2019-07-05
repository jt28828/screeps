import { IMyCreep } from "../interfaces/my-creep";

export class RoomState {
    public damagedStructures: Structure[] = [];
    public enemies: Creep[] = [];
    public structures: AnyStructure[] = [];
    public myStructures: AnyOwnedStructure[] = [];
    public constructionSites: ConstructionSite[] = [];
    public droppedResources: Resource[] = [];

    // Updates every tick
    public slaves: IMyCreep[] = [];
    /** Structures that are not yet full and can be filled with energy. Extensions, Spawn or Towers */
    public nonFullStructures: AnyOwnedStructure[] = [];
    /** Structures that store energy and are not currently empty */
    public nonEmptyStorage: Structure[] = [];
    public sources: Source[] = [];

    constructor(storedState?: RoomMemory) {
        if (storedState == null) {
            return;
        }
        this.damagedStructures = storedState.damagedStructureIds.map(id => Game.getObjectById(id) as Structure)
            .filter(structure => structure != null);

        this.enemies = storedState.enemyIds.map(id => Game.getObjectById(id) as IMyCreep)
            .filter(enemy => enemy != null);

        this.structures = storedState.structureIds.map(id => Game.getObjectById(id) as AnyStructure)
            .filter(structure => structure != null);

        this.myStructures = storedState.myStructureIds.map(id => Game.getObjectById(id) as AnyOwnedStructure)
            .filter(structure => structure != null);

        this.constructionSites = storedState.constructionSiteIds.map(id => Game.getObjectById(id) as ConstructionSite);

        this.droppedResources = storedState.droppedEnergyIds.map(id => Game.getObjectById(id) as Resource);
    }
}
