export interface IRoomState {
    // Updates only once every 10 tick
    isMyRoom: boolean;
    damagedStructures: Structure[];
    enemies: Creep[];
    structures: AnyStructure[];
    myStructures: AnyOwnedStructure[];
    constructionSites: ConstructionSite[];

    // Updates every tick
    slaves: Creep[];
    /** Structures that are not yet full and can be filled with energy */
    nonEmptyStorage: AnyOwnedStructure[];
}
