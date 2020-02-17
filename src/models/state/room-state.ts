import { allyUsernames } from "../../constants/ally-usernames";
import { myUserName } from "../../constants/signature";

export class RoomState {
    // Store all the values directly from memory
    private _room: Room;

    // Private arrays are lazily initialised
    private _damagedStructures!: Structure[];
    private _enemies!: Creep[];
    private _allStructures!: AnyStructure[];
    private _myStructures!: AnyOwnedStructure[];
    private _constructionSites!: ConstructionSite[];
    private _myCreeps!: Creep[];

    public get damagedStructures(): Structure[] {
        if (this._damagedStructures == null) {
            // Lazily initialise
            this._damagedStructures = this._room.memory.damagedStructureIds
                .map(id => Game.getObjectById(id) as Structure)
                .filter(structure => structure != null);
        }
        return this._damagedStructures;
    }

    public get enemies(): Creep[] {
        if (this._enemies == null) {
            this._enemies = this._room.memory.enemyIds.map(id => Game.getObjectById(id) as Creep)
                .filter(enemy => enemy != null);
        }
        return this._enemies;
    }

    public get structures(): AnyStructure[] {
        if (this._allStructures == null) {
            this._allStructures = this._room.memory.structureIds.map(id => Game.getObjectById(id) as AnyStructure)
                .filter(structure => structure != null);
        }
        return this._allStructures;
    }

    public get myStructures(): AnyOwnedStructure[] {
        if (this._myStructures == null) {
            this._myStructures = this._room.memory.myStructureIds.map(id => Game.getObjectById(id) as AnyOwnedStructure)
                .filter(structure => structure != null);
        }
        return this._myStructures;
    }

    public get constructionSites(): ConstructionSite[] {
        if (this._constructionSites == null) {
            this._constructionSites = this._room.memory.constructionSiteIds.map(id => Game.getObjectById(id) as ConstructionSite);
        }
        return this._constructionSites;
    }

    public get myCreeps(): Creep[] {
        if (this._myCreeps == null) {
            this._myCreeps = this._room.find(FIND_MY_CREEPS);
        }
        return this._myCreeps;
    }


    constructor(room: Room) {
        this._room = room;
    }

    /** Calculates the state of items in the room that don't change often */
    public calculateNonVolatileRoomState(): RoomState {
        const allStructures = this._room.find(FIND_STRUCTURES);
        const myStructures = this._room.find(FIND_MY_STRUCTURES);
        const constructionSites = this._room.find(FIND_CONSTRUCTION_SITES);
        const enemies = this._room.find(FIND_HOSTILE_CREEPS)
            .filter(creep => allyUsernames.indexOf(creep.owner.username) === -1)
            .sort((a, b) => a.hits - b.hits);


        const damagedStructures = allStructures
            .filter((x) => x.hits < x.hitsMax)
            .sort((a, b) => a.hits - b.hits);

        // Store in long term memory for quick retrieval
        this._damagedStructures = damagedStructures;
        this._enemies = enemies;
        this._allStructures = allStructures;
        this._myStructures = myStructures;
        this._constructionSites = constructionSites;

        // Finally Create the new room state object from the retrieved values. and return
        return this;
    }

    /** Saves the existing room state back into memory for use later */
    public saveStateToMemory(): RoomState {
        this._room.memory.roomIsSigned = this._room.controller?.sign?.username == myUserName;
        this._room.memory.damagedStructureIds = this._damagedStructures.map(x => x.id);
        this._room.memory.enemyIds = this._enemies.map(x => x.id);
        this._room.memory.structureIds = this._allStructures.map(x => x.id);
        this._room.memory.myStructureIds = this._myStructures.map(x => x.id);
        this._room.memory.constructionSiteIds = this._constructionSites.map(site => site.id);
        return this;
    }
}
