import { allyUsernames } from "../constants/ally-usernames";
import { myUserName } from "../constants/signature";
import { RoomStatus } from "../enums/room-status";
import { MapUtils } from "../utilities/map-utils";

export class RoomMemoryManager {
    // Store all the values directly from memory
    public room: Room;

    // Private arrays are lazily initialised
    private _damagedStructures?: Map<string, Structure>;
    private _enemies?: Map<string, Creep>;
    private _allStructures?: Map<string, AnyStructure>;
    private _myStructures?: Map<string, AnyOwnedStructure>;
    private _constructionSites?: Map<string, ConstructionSite>;
    private _myCreeps?: Creep[];

    public roomStatus: RoomStatus;

    public get damagedStructures(): Map<string, Structure> {
        if (this._damagedStructures === undefined) {
            // Lazily initialise
            this._damagedStructures = new Map(
                this.room.memory.damagedStructureIds.map(id => [id, Game.getObjectById(id) as Structure])
            );
        }
        return this._damagedStructures;
    }

    public get enemies(): Map<string, Creep> {
        if (this._enemies === undefined) {
            this._enemies = new Map(this.room.memory.enemyIds
                .map(id => ([id, Game.getObjectById(id) as Creep]))
            );
        }
        return this._enemies;
    }

    public get structures(): Map<string, AnyStructure> {
        if (this._allStructures === undefined) {
            this._allStructures = new Map(this.room.memory.structureIds
                .map(id => ([id, Game.getObjectById(id) as AnyStructure]))
            );
        }
        return this._allStructures;
    }

    public get myStructures(): Map<string, AnyOwnedStructure> {
        if (this._myStructures === undefined) {
            this._myStructures = new Map(this.room.memory.myStructureIds
                .map(id => ([id, Game.getObjectById(id) as AnyOwnedStructure]))
            );
        }
        return this._myStructures;
    }

    public get constructionSites(): Map<string, ConstructionSite> {
        if (this._constructionSites === undefined) {
            this._constructionSites = new Map(this.room.memory.constructionSiteIds
                .map(id => ([id, Game.getObjectById(id) as ConstructionSite]))
            );
        }
        return this._constructionSites;
    }

    public get myCreeps(): Creep[] {
        if (this._myCreeps === undefined) {
            this._myCreeps = this.room.find(FIND_MY_CREEPS);
        }
        return this._myCreeps;
    }

    constructor(room: Room) {
        this.room = room;
        this.roomStatus = this.room.memory.roomStatus;
    }

    /** Calculates the state of items in the room that don't change often */
    public calculateNonVolatileRoomState(): RoomMemoryManager {
        const allStructures = this.room.find(FIND_STRUCTURES);
        const myStructures = this.room.find(FIND_MY_STRUCTURES);
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        const enemies = this.room.find(FIND_HOSTILE_CREEPS)
            .filter(creep => allyUsernames.indexOf(creep.owner.username) === -1)
            .sort((a, b) => a.hits - b.hits);

        const damagedStructures = allStructures
            .filter((x) => x.hits < x.hitsMax)
            .sort((a, b) => a.hits - b.hits);

        const roomIsOwned = this.room.controller?.my;

        // Store in long term memory for quick retrieval
        this._damagedStructures = MapUtils.arrayToMap(damagedStructures);
        this._enemies = MapUtils.arrayToMap(enemies);
        this._allStructures = MapUtils.arrayToMap(allStructures);
        this._myStructures = MapUtils.arrayToMap(myStructures);
        this._constructionSites = MapUtils.arrayToMap(constructionSites);
        this.roomStatus = (roomIsOwned) ? RoomStatus.owned : RoomStatus.unclaimed;

        // Finally Create the new room state object from the retrieved values. and return
        return this;
    }

    /** Saves the existing room state back into memory for use later */
    public saveStateToMemory(): RoomMemoryManager {
        this.room.memory.roomIsSigned = this.room.controller?.sign?.username == myUserName;
        this.room.memory.damagedStructureIds = MapUtils.mapToArray(this._damagedStructures).map(x => x.id);
        this.room.memory.enemyIds = MapUtils.mapToArray(this._enemies).map(x => x.id);
        this.room.memory.structureIds = MapUtils.mapToArray(this._allStructures).map(x => x.id);
        this.room.memory.myStructureIds = MapUtils.mapToArray(this._myStructures).map(x => x.id);
        this.room.memory.constructionSiteIds = MapUtils.mapToArray(this._constructionSites).map(site => site.id);
        this.room.memory.roomStatus = this.roomStatus;
        return this;
    }
}
