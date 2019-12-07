import { IMyCreep } from "../interfaces/my-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { BuilderController } from "../roles/builder";
import { HarvesterController } from "../roles/harvester";
import { MinerController } from "../roles/miner";
import { UpgraderController } from "../roles/upgrader";
import { SpawnController } from "../structures/spawn";
import { TowerController } from "../structures/tower";
import { isBuilder, isClaimer, isHarvester, isMiner, isRemoteBuilder, isUpgrader } from "../utility/creep-utils";
import { ICreepRole } from "../roles/creep-role";
import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { ClaimerController } from "../roles/claimer";
import { claimFlag } from "../constants/flags";
import { allyUsernames } from "../constants/allies";
import { RemoteBuilderController } from "../roles/specializations/remote-builder";

export class RoomController {
    private readonly isMyRoom: boolean | undefined;
    private readonly room: Room;
    private readonly roomState: ICurrentRoomState;

    constructor(room: Room) {
        this.room = room;
        this.isMyRoom = room.controller?.my;
        if (this.isMyRoom) {
            this.roomState = this.getCurrentRoomState();
        } else {
            this.roomState = this.getForeignRoomState();
        }
    }

    /**
     * Commands all of the creeps / structures in a room to do a task.
     * Runs once every loop
     */
    public control(): void {
        if (this.isMyRoom) {
            // Controlling my room
            this.commandStructures();
        }

        this.commandCreeps();
    }

    /** Commands all the structures in the room to perform their actions */
    private commandStructures() {
        const justTowers = this.roomState.structures.filter((s) => s.structureType === STRUCTURE_TOWER) as StructureTower[];
        const justSpawners = this.roomState.structures.filter((s) => s.structureType === STRUCTURE_SPAWN) as StructureSpawn[];

        // Command all the structures to perform actions
        this.commandTowers(justTowers);
        this.commandSpawners(justSpawners);
    }

    /** Commands the towers in this room to shoot or heal */
    private commandTowers(towers?: StructureTower[]) {
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
    private commandSpawners(spawns?: StructureSpawn[]) {
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

    /** Returns information about the current state of the room */
    private getCurrentRoomState(): ICurrentRoomState {
        const slaves = this.room.find(FIND_MY_CREEPS) as IMyCreep[];
        const structures = this.room.find(FIND_STRUCTURES);
        const myStructures = this.room.find(FIND_MY_STRUCTURES);
        const roomHasSpawn = structures.filter((s) => s.structureType === STRUCTURE_SPAWN).length > 0;
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        const enemies = this.room.find(FIND_HOSTILE_CREEPS)
            .filter(creep => allyUsernames.indexOf(creep.owner.username) === -1)
            .sort((a, b) => a.hits - b.hits);

        const fillableStructures = myStructures.filter((structure) =>
            structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER &&
            structure.energy < structure.energyCapacity);

        const damagedAllies = slaves.filter((x) => x.hits < x.hitsMax).sort((a, b) => a.hits - b.hits);
        const damagedStructures = structures.filter((x) => x.hits < x.hitsMax).sort((a, b) => a.hits - b.hits);

        return {
            constructionSites,
            damagedAllies,
            damagedStructures,
            enemies,
            myStructures,
            fillableStructures,
            roomHasSpawn,
            slaves,
            structures,
        };
    }

    /** Returns the state of an unowned room */
    private getForeignRoomState(): ICurrentRoomState {
        const slaves = this.room.find(FIND_MY_CREEPS) as IMyCreep[];
        const structures = this.room.find(FIND_STRUCTURES);
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        const roomHasSpawn = structures.filter((s) => s.structureType === STRUCTURE_SPAWN).length > 0;
        const enemies = this.room.find(FIND_HOSTILE_CREEPS).sort((a, b) => a.hits - b.hits);

        return {
            constructionSites,
            enemies,
            slaves,
            structures,
            damagedAllies: [],
            damagedStructures: [],
            myStructures: [],
            fillableStructures: [],
            roomHasSpawn,
        };
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
