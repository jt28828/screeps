import { IMyCreep } from "../../interfaces/my-creep";
import { RoomStorage } from "./room-storage";
import { IRoomResources } from "./room-resources";
import { filterNonEmptyContainers, filterNonFullContainers } from "../../utility/filters";
import { RoomStructures } from "./room-structures";

export class RoomState {
    public damagedStructures: Structure[] = [];
    public enemies: Creep[] = [];
    public structures: AnyStructure[] = [];
    public myStructures: AnyOwnedStructure[] = [];
    public constructionSites: ConstructionSite[] = [];
    // Updates every tick
    public slaves: IMyCreep[] = [];
    /** Objects in the room that store resources */
    public storage!: RoomStorage;
    /** Objects in the room where resources can be retrieved from */
    public resources!: IRoomResources;
    /** The structures for this room sorted into types */
    public sortedStructures!: RoomStructures;
    private room!: Room;

    constructor(room?: Room) {
        if (room == null) {
            return;
        }
        this.room = room;

        this.damagedStructures = room.memory.damagedStructureIds.map(id => Game.getObjectById(id) as Structure)
            .filter(structure => structure != null);

        this.enemies = room.memory.enemyIds.map(id => Game.getObjectById(id) as IMyCreep)
            .filter(enemy => enemy != null);

        this.structures = room.memory.structureIds.map(id => Game.getObjectById(id) as AnyStructure)
            .filter(structure => structure != null);

        this.myStructures = room.memory.myStructureIds.map(id => Game.getObjectById(id) as AnyOwnedStructure)
            .filter(structure => structure != null);

        this.constructionSites = room.memory.constructionSiteIds.map(id => Game.getObjectById(id) as ConstructionSite);

        this.slaves = room.find(FIND_MY_CREEPS) as IMyCreep[];

        // Get resource info
        const droppedEnergy = room.memory.droppedEnergyIds.map(id => Game.getObjectById(id) as Resource);
        const sources = room.memory.sourceIds.map(id => Game.getObjectById(id) as Source);
        this.resources = {droppedEnergy, sources};

        // Get storage info
        this.organiseStorage();

        // Sort structures into types
        this.organiseStructures();
    }

    /** Creates a room state from already retrieved values. Called when persistent data is recalculated */
    public static fromRetrievedValues(room: Room, damagedStructures: Structure[], enemies: Creep[], allStructures: AnyStructure[],
                                      myStructures: AnyOwnedStructure[], constructionSites: ConstructionSite[],
                                      roomSources: Source[], droppedEnergy: Resource[]): RoomState {
        const newState = new RoomState();
        newState.room = room;
        newState.damagedStructures = damagedStructures;
        newState.enemies = enemies;
        newState.structures = allStructures;
        newState.myStructures = myStructures;
        newState.constructionSites = constructionSites;
        newState.slaves = room.find(FIND_MY_CREEPS) as IMyCreep[];
        newState.setResources(roomSources, droppedEnergy);

        return newState;
    }

    /** Sets the state of resource sites in this room */
    public setResources(sources: Source[], energy?: Resource[]): void {
        const droppedEnergy = energy || [];
        this.resources = {
            droppedEnergy,
            sources
        };
    }

    /** Organises the storage structures for easier access */
    private organiseStorage() {
        const nonEmptyContainers = this.structures.filter(filterNonEmptyContainers);
        const nonFullContainers = this.structures.filter(filterNonFullContainers);
        const storage = this.room.storage;

        this.storage = new RoomStorage(nonEmptyContainers, nonFullContainers, storage);
    }


    /** Organises the structures into the different types use for performing different actions */
    private organiseStructures(): void {
        const extensions: StructureExtension[] = [];
        const spawns: StructureSpawn[] = [];
        const towers: StructureTower[] = [];

        this.structures.forEach(structure => {
            switch (structure.structureType) {
                case "extension":
                    extensions.push(structure);
                    break;
                case "spawn":
                    spawns.push(structure);
                    break;
                case "tower":
                    towers.push(structure);
                    break;
            }
        });
        this.sortedStructures = new RoomStructures(extensions, spawns, towers);
    }
}
