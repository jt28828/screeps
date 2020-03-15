import { TownPlanner } from "./town-planner";
import { RoomStatus } from "../../enums/room-status";
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { CreepRole } from "../../enums/creep-role";
import { AllRounderCreepController } from "../creep/allrounder-creep-controller";
import { MinerCreepController } from "../creep/miner-creep-controller";
import { TransporterCreepController } from "../creep/transporter-creep-controller";
import { UpgraderCreepController } from "../creep/upgrader-creep-controller";
import { BuilderCreepController } from "../creep/builder-creep-controller";
import { CreepController } from "../creep/base/creep-controller";
import { TowerController } from "../structure/tower-controller";
import { SpawnController } from "../structure/spawn-controller";
import { RoomLevels } from "../../enums/room-levels";

export class RoomController {
    private readonly _room: Room;
    private readonly _roomFlags: ReadonlyArray<Flag>;
    private readonly _roomState!: RoomMemoryManager;


    constructor(room: Room) {
        this._room = room;
        if (this._room != null) {
            this._roomFlags = this._room.find(FIND_FLAGS);
            if (this._room.memory.roomStatus === undefined || this._room.memory.currentLevel === undefined) {
                this._room.memory = RoomController.createDefaultRoomMemory(room);
            }
            if (this._room.memory.roomStatus === RoomStatus.owned) {
                this._roomState = new RoomMemoryManager(this._room);
            } else {
                this._roomState = new RoomMemoryManager(this._room);
            }

        } else {
            // Room doesn't exist? (It always should)
            this._roomFlags = [];
        }
    }

    private static createDefaultRoomMemory(room: Room): RoomMemory {
        return {
            roomStatus: RoomStatus.unclaimed,
            currentLevel: RoomLevels.starter,
            sourceCount: 1,
            damagedStructureIds: [],
            droppedEnergyIds: [],
            enemyIds: [],
            structureIds: [],
            myStructureIds: [],
            constructionSiteIds: [],
            // Sources won't change while the room exists, set and forget
            sourceIds: room.find(FIND_SOURCES).map(source => source.id)
        }
    }

    /** Runs non-critical tasks, usually only every few ticks */
    public runNonCriticalTasks() {
        this._roomState?.calculateNonVolatileRoomState()
            .saveStateToMemory();
    }

    /** Runs tasks for this room that only need to be run rarely */
    public runRareTasks() {
        // Place automated build sites
        if (this._room.memory.roomStatus === RoomStatus.owned) {
            // Only build in owned rooms
            new TownPlanner(this._room, this._roomFlags).control();
            this._roomState.countRoomSources().calculateRoomLevel();
        }
    }

    /** Controls the creeps and buildings in the current room */
    public control() {
        this.controlCreeps();
        if (this._room.controller?.my) {
            this.controlStructures();
        }
    }

    private controlCreeps() {
        const myCreeps = this._roomState.myCreeps;
        const roomExtensions = this._roomState.myStructures
            .filter(struct => struct.structureType === STRUCTURE_EXTENSION);

        myCreeps.forEach((creep) => {
            let controller: CreepController | undefined;
            switch (creep.memory.currentRole) {
                case CreepRole.allRounder:
                    controller = new AllRounderCreepController(this._roomState, creep, roomExtensions.length > 2);
                    break;
                case CreepRole.miner:
                    controller = new MinerCreepController(this._roomState, creep);
                    break;
                case CreepRole.transporter:
                    controller = new TransporterCreepController(this._roomState, creep);
                    break;
                case CreepRole.upgrader:
                    controller = new UpgraderCreepController(this._roomState, creep);
                    break;
                case CreepRole.builder:
                    controller = new BuilderCreepController(this._roomState, creep);
                    break;
                default:
                    console.log("An unsupported creep attempted to be controlled");
                    break;
            }
            // Control the provided creep
            controller?.control();
        });
    }

    private controlStructures() {
        this.controlTowers();
        this.controlSpawners();
    }

    /** Controls the towers in this room to shoot or heal */
    private controlTowers() {
        const towers = this._roomState.myStructures.filter(struct => struct.structureType === STRUCTURE_TOWER);
        if (towers?.length < 1) {
            // No towers present
            return;
        }

        const towerCount = towers.length;
        for (let i = 0; i < towerCount; i++) {
            // Command a tower to perform an action if applicable
            new TowerController(towers[i] as StructureTower, this._roomState).control();
        }
    }

    /** Controls the spawners in this room to spawn if necessary */
    private controlSpawners() {
        const spawns = this._roomState.myStructures.filter(struct => struct.structureType === STRUCTURE_SPAWN);
        if (spawns?.length < 1) {
            // No spawns present
            return;
        }

        const spawnCount = spawns.length;
        for (let i = 0; i < spawnCount; i++) {
            // Command a spawn to perform an action if applicable
            new SpawnController(spawns[i] as StructureSpawn, this._roomState).spawn();
        }
    }

}
