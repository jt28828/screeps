import { allyUsernames } from "../constants/ally-usernames";
import { RoomStatus } from "../enums/room-status";
import { RoomLevels } from "../enums/room-levels";

export class RoomMemoryManager {
    // Store all the values directly from memory
    public room: Room;

    // Private arrays are lazily initialised
    private _damagedStructures?: Structure[];
    private _enemies?: Creep[];
    private _allStructures?: AnyStructure[];
    private _myStructures?: AnyOwnedStructure[];
    private _constructionSites?: ConstructionSite[];
    private _myCreeps?: Creep[];
    private _droppedEnergy?: Resource[];
    public roomStatus: RoomStatus;
    public roomFlags: ReadonlyArray<Flag>;

    public get damagedStructures(): Structure[] {
        if (this._damagedStructures === undefined) {
            // Lazily initialise
            this._damagedStructures =
                this.room.memory.damagedStructureIds.map(id => Game.getObjectById(id) as Structure)
                    .filter(entity => entity != null);
        }
        return this._damagedStructures;
    }

    public get enemies(): Creep[] {
        if (this._enemies === undefined) {
            this._enemies = this.room.memory.enemyIds
                .map(id => (Game.getObjectById(id) as Creep))
                .filter(entity => entity != null);
        }
        return this._enemies;
    }

    public get structures(): AnyStructure[] {
        if (this._allStructures === undefined) {
            this._allStructures = this.room.memory.structureIds
                .map(id => (Game.getObjectById(id) as AnyStructure))
                .filter(entity => entity != null);
        }
        return this._allStructures;
    }

    public get myStructures(): AnyOwnedStructure[] {
        if (this._myStructures === undefined) {
            this._myStructures = this.room.memory.myStructureIds
                .map(id => (Game.getObjectById(id) as AnyOwnedStructure))
                .filter(entity => entity != null);
        }
        return this._myStructures;
    }

    public get constructionSites(): ConstructionSite[] {
        if (this._constructionSites === undefined) {
            this._constructionSites = this.room.memory.constructionSiteIds
                .map(id => (Game.getObjectById(id) as ConstructionSite))
                .filter(entity => entity != null);
        }
        return this._constructionSites;
    }

    public get myCreeps(): Creep[] {
        if (this._myCreeps === undefined) {
            this._myCreeps = this.room.find(FIND_MY_CREEPS);
        }
        return this._myCreeps;
    }

    public get droppedEnergy(): Resource[] {
        if (this._droppedEnergy === undefined) {
            this._droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES)
                .filter(dropPoint => dropPoint.resourceType === RESOURCE_ENERGY && dropPoint.amount > 100);
        }
        return this._droppedEnergy;
    }

    constructor(room: Room, roomFlags: ReadonlyArray<Flag>) {
        this.room = room;
        this.roomFlags = roomFlags;
        this.roomStatus = this.room.memory.roomStatus;
    }

    /** Calculates the state of items in the room that don't change often */
    public calculateNonVolatileRoomState(): RoomMemoryManager {
        const allStructures = this.room.find(FIND_STRUCTURES);
        const myStructures = this.room.find(FIND_MY_STRUCTURES);
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        // Dropped energy needs to be more than 150 to be worth navigating to collect
        const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES)
            .filter(dropPoint => dropPoint.resourceType === RESOURCE_ENERGY && dropPoint.amount > 150);

        const enemies = this.room.find(FIND_HOSTILE_CREEPS)
            .filter(creep => allyUsernames.indexOf(creep.owner.username) === -1)
            .sort((a, b) => a.hits - b.hits);

        // Only heal walls up to a max of 10 million
        const damagedStructures = allStructures
            .filter((x) => x.hits < x.hitsMax && x.hits < 10_000_000)
            .sort((a, b) => a.hits - b.hits);

        const roomIsOwned = this.room.controller?.my;

        // Store in long term memory for quick retrieval
        this._damagedStructures = damagedStructures;
        this._enemies = enemies;
        this._allStructures = allStructures;
        this._myStructures = myStructures;
        this._constructionSites = constructionSites;
        this._droppedEnergy = droppedEnergy;
        this.roomStatus = (roomIsOwned) ? RoomStatus.owned : RoomStatus.unclaimed;

        // Finally Create the new room state object from the retrieved values. and return
        return this;
    }

    /** Saves the existing room state back into memory for use later */
    public saveStateToMemory(): RoomMemoryManager {
        this.room.memory.damagedStructureIds = this._damagedStructures?.map(x => x.id) ?? [];
        this.room.memory.enemyIds = this._enemies?.map(x => x.id) ?? [];
        this.room.memory.structureIds = this._allStructures?.map(x => x.id) ?? [];
        this.room.memory.myStructureIds = this._myStructures?.map(x => x.id) ?? [];
        this.room.memory.constructionSiteIds = this._constructionSites?.map(site => site.id) ?? [];
        this.room.memory.droppedEnergyIds = this._droppedEnergy?.map(dropSite => dropSite.id) ?? [];
        this.room.memory.roomStatus = this.roomStatus;
        return this;
    }


    /** Figures out the custom level of the room, used to perform different actions depending on how well a room is going */
    public calculateRoomLevel(): this {
        const roomExtensions = this.myStructures.filter(struct => struct.structureType === STRUCTURE_EXTENSION);
        const numberOfCreeps = this.myCreeps.length;

        if (roomExtensions.length < 2 || (this.room.energyAvailable < 500 && numberOfCreeps < 3)) {
            // Room has less than 2 extensions or is performing badly.
            this.room.memory.currentLevel = RoomLevels.starter;
        } else if ((this.room.memory.sourceCount < 2)) {
            // Room has more than 2 extensions filled, but is only a 1 source room, upgrade to level 1
            this.room.memory.currentLevel = RoomLevels.hasEnergy;
        } else {
            // Room has more than 2 extensions and 2 sources upgrade to level 2
            this.room.memory.currentLevel = RoomLevels.hasEnergyAndMultipleSources;
        }
        return this;
    }

    /**
     * Counts the number of sources in the current room
     * TODO only run once on room entry to memory. For now run with rare tasks
     */
    public countRoomSources(): this {
        this.room.memory.sourceCount = this.room.find(FIND_SOURCES).length;
        return this;
    }
}
