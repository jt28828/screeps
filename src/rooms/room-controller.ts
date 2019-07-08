import { IMyCreep } from "../interfaces/my-creep";
import { BuilderController } from "../creeps/builder";
import { HarvesterController } from "../creeps/harvester";
import { MinerController } from "../creeps/miner";
import { UpgraderController } from "../creeps/upgrader";
import { SpawnController } from "../structures/spawn";
import { TowerController } from "../structures/tower";
import { isBuilder, isClaimer, isHarvester, isMiner, isRemoteBuilder, isUpgrader } from "../utility/creep-utils";
import { ICreepRole } from "../creeps/creep-role";
import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { ClaimerController } from "../creeps/claimer";
import { claimFlag } from "../constants/flags";
import { allyUsernames } from "../constants/allies";
import { RemoteBuilderController } from "../creeps/specializations/remote-builder";
import { RoomState } from "../models/room/room-state";
import { myUserName } from "../constants/signature";
import { filterForEnergy } from "../utility/filters";

export class RoomController {
    private readonly room: Room;
    private readonly roomState: RoomState;

    constructor(room: Room) {
        this.room = room;

        if (this.room.memory.isMyRoom == null) {
            this.room.memory = RoomController.createDefaultRoomMemory();
        }
        if (this.room.memory.isMyRoom) {
            this.roomState = this.calculateCurrentRoomState();
        } else {
            this.roomState = this.getForeignRoomState();
        }
    }

    private static createDefaultRoomMemory(): RoomMemory {
        return {
            isMyRoom: false,
            roomIsSigned: false,
            damagedStructureIds: [],
            enemyIds: [],
            structureIds: [],
            myStructureIds: [],
            constructionSiteIds: [],
            droppedEnergyIds: [],
            sourceIds: []
        }
    }

    /**
     * Commands all of the creeps / structures in a room to do a task.
     * Runs once every loop
     */
    public control(): void {
        if (this.room.memory.isMyRoom) {
            // Controlling my room
            this.commandStructures();
        }

        this.commandCreeps();
    }

    /** Commands all the structures in the room to perform their actions */
    private commandStructures() {
        // Command all the structures to perform actions
        this.commandTowers();
        this.commandSpawners();
    }

    /** Commands the towers in this room to shoot or heal */
    private commandTowers() {
        const towers = this.roomState.sortedStructures.towers;
        if (towers == null || towers.length === 0) {
            // No towers present
            return;
        }

        const towerCount = towers.length;
        for (let i = 0; i < towerCount; i++) {
            // Command a tower to perform an action if applicable
            const towerController = new TowerController(towers[i], this.roomState);
            towerController.command();
        }
    }

    /** Commands the spawners in this room to spawn if necessary */
    private commandSpawners() {
        const spawns = this.roomState.sortedStructures.spawns;
        if (spawns == null || spawns.length === 0) {
            // No spawns present
            return;
        }

        const spawnCount = spawns.length;
        for (let i = 0; i < spawnCount; i++) {
            // Command a spawn to perform an action if applicable
            SpawnController.spawn(spawns[i], this.roomState, this.room);
        }
    }

    /** Calculates the state of items in the room that don't change often */
    private calculateNonVolatileRoomState(): RoomState {
        const allStructures = this.room.find(FIND_STRUCTURES);
        const myStructures = this.room.find(FIND_MY_STRUCTURES);
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        // Any dropped energy points
        const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES).filter(filterForEnergy);
        const enemies = this.room.find(FIND_HOSTILE_CREEPS).filter(creep => allyUsernames.indexOf(creep.owner.username) === -1).sort((a, b) => a.hits - b.hits);
        const roomSources = this.room.find(FIND_SOURCES);

        let isRoomSigned = false;
        if (this.room.controller != null) {
            isRoomSigned = (this.room.controller.sign != null && this.room.controller.sign.username == myUserName);
        }
        const damagedStructures = allStructures.filter((x) => x.hits < x.hitsMax).sort((a, b) => a.hits - b.hits);

        // Store in long term memory for quick retrieval
        this.room.memory.isMyRoom = (this.room.controller != null && this.room.controller.my);
        this.room.memory.roomIsSigned = isRoomSigned;
        this.room.memory.damagedStructureIds = damagedStructures.map(x => x.id);
        this.room.memory.enemyIds = enemies.map(x => x.id);
        this.room.memory.structureIds = allStructures.map(x => x.id);
        this.room.memory.myStructureIds = myStructures.map(x => x.id);
        this.room.memory.constructionSiteIds = constructionSites.map(site => site.id);
        this.room.memory.droppedEnergyIds = droppedEnergy.map(resource => resource.id);
        this.room.memory.sourceIds = roomSources.map(source => source.id);

        // Finally Create the new room state object from the retrieved values. and return
        return RoomState.fromRetrievedValues(
            this.room, damagedStructures, enemies, allStructures, myStructures, constructionSites, roomSources, droppedEnergy
        );
    }

    /** Returns information about the current state of the room */
    private calculateCurrentRoomState(): RoomState {
        let roomState: RoomState;
        // Either regenerate the whole memory or just the volatile things depending on game ticks
        if (Game.time % 10) {
            // Update things that don't need to be updated all the time
            roomState = this.calculateNonVolatileRoomState();
        } else {
            // Get data from stored state. Will update the volatile items as well
            roomState = new RoomState(this.room);
        }

        return roomState;
    }

    /** Returns the state of an unowned room */
    private getForeignRoomState(): RoomState {
        // Create a new state object for this room
        const roomState = new RoomState();
        if (Game.time % 10) {
            // Check every 10 loops if the room is now mine
            this.room.memory.isMyRoom = (this.room.controller != null && this.room.controller.my);
        }

        // Because room isn't ours yet, calculate everything every tick
        const slaves = this.room.find(FIND_MY_CREEPS) as IMyCreep[];
        const allStructures = this.room.find(FIND_STRUCTURES);
        const myStructures = this.room.find(FIND_MY_STRUCTURES);
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);

        roomState.slaves = slaves;
        roomState.structures = allStructures;
        roomState.myStructures = myStructures;
        roomState.constructionSites = constructionSites;
        return roomState;
    }

    /** Commands all the creeps in the room to perform their actions */
    private commandCreeps(): void {

        const creepCount = this.roomState.slaves.length;

        for (let i = 0; i < creepCount; i++) {
            const thisCreep = this.roomState.slaves[i];
            let controller: ICreepRole;
            if (isHarvester(thisCreep)) {
                controller = new HarvesterController(thisCreep, this.roomState);
            } else if (isUpgrader(thisCreep)) {
                controller = new UpgraderController(thisCreep, this.roomState);
            } else if (isBuilder(thisCreep)) {
                controller = new BuilderController(thisCreep, this.roomState);
            } else if (isMiner(thisCreep)) {
                controller = new MinerController(thisCreep, this.roomState);
            } else if (isClaimer(thisCreep)) {
                controller = new ClaimerController(thisCreep, this.roomState, Game.flags[claimFlag]);
            } else if (isRemoteBuilder(thisCreep)) {
                controller = new RemoteBuilderController(thisCreep, this.roomState);
            } else {
                console.log("Attempted to control an unsupported creep. Falling back to Harvester");
                console.log(`Name: ${thisCreep.name} Role: ${thisCreep.memory.role}`);
                controller = new HarvesterController(thisCreep as IHarvesterCreep, this.roomState);
            }
            controller.startWork();
        }
    }
}
