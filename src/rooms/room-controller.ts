import { IMyCreep } from "../interfaces/my-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { BuilderController } from "../roles/builder";
import { HarvesterController } from "../roles/harvester";
import { MinerController } from "../roles/miner";
import { UpgraderController } from "../roles/upgrader";
import { SpawnController } from "../structures/spawn";
import { TowerController } from "../structures/tower";
import { isBuilder, isHarvester, isMiner, isUpgrader } from "../utility/creep-utils";
import { ICreepRole } from "../roles/creep-role";
import { IHarvesterCreep } from "../interfaces/harvester-creep";

export class RoomController {
    /**
     * Commands all of the creeps / structures in a room to do a task.
     * Runs once every loop
     */
    public static control(room: Room): void {
        const roomState = this.getCurrentRoomState(room);
        this.commandCreeps(roomState);
        this.commandStructures(roomState);
    }

    /** Returns information about the current state of the room */
    private static getCurrentRoomState(room: Room): ICurrentRoomState {
        const slaves = room.find(FIND_MY_CREEPS) as IMyCreep[];
        const structures = room.find(FIND_STRUCTURES);
        const myStructures = room.find(FIND_MY_STRUCTURES);
        const enemies = room.find(FIND_HOSTILE_CREEPS);
        const fillableStructures = myStructures.filter((structure) =>
            structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER &&
            structure.energy < structure.energyCapacity);

        const damagedAllies = slaves.filter((x) => x.hits < x.hitsMax);
        const damagedStructures = structures.filter((x) => x.hits < x.hitsMax);

        // Calculate room level by the number of extensions and controller level
        const roomLevel = this.calculateRoomLevel(room, myStructures);

        return {
            damagedAllies,
            damagedStructures,
            enemies,
            myStructures,
            fillableStructures,
            roomLevel,
            slaves,
            structures,
        };
    }

    /** Calculates the level of the room based off the controller level and the number of extensions */
    private static calculateRoomLevel(room: Room, structures: AnyOwnedStructure[]) {
        const controllerLvl = (room.controller as StructureController).level;
        const extensionCount = structures.filter((struct) => struct.structureType === STRUCTURE_EXTENSION).length;

        if (controllerLvl > 2 && extensionCount >= 4) {
            return 3;
        }

        if (controllerLvl > 1 && extensionCount >= 2) {
            return 2;
        }

        return 1;
    }

    /** Commands all the creeps in the room to perform their actions */
    private static commandCreeps(state: ICurrentRoomState): void {

        const creepCount = state.slaves.length;

        for (let i = 0; i < creepCount; i++) {
            const thisCreep = state.slaves[i];
            let controller: ICreepRole;
            if (isHarvester(thisCreep)) {
                controller = new HarvesterController(thisCreep, state);
            } else if (isUpgrader(thisCreep)) {
                controller = new UpgraderController(thisCreep, state);
            } else if (isBuilder(thisCreep)) {
                controller = new BuilderController(thisCreep, state);
            } else if (isMiner(thisCreep)) {
                controller = new MinerController(thisCreep, state);
            } else {
                console.log("Attempted to control an unsupported creep. Falling back to Harvester");
                controller = new HarvesterController(thisCreep as IHarvesterCreep, state);
            }
            controller.startWork();
        }
    }

    /** Commands all the structures in the room to perform their actions */
    private static commandStructures(roomState: ICurrentRoomState) {
        const justTowers = roomState.structures.filter((s) => s.structureType === STRUCTURE_TOWER) as StructureTower[];
        const justSpawners = roomState.structures.filter((s) => s.structureType === STRUCTURE_SPAWN) as StructureSpawn[];

        // Command all the structures to perform actions
        this.commandTowers(roomState, justTowers);
        this.commandSpawners(roomState, justSpawners);
    }

    /** Commands the towers in this room to shoot or heal */
    private static commandTowers(state: ICurrentRoomState, towers?: StructureTower[]) {
        if (towers == null || towers.length === 0) {
            // No towers present
            return;
        }

        const towerCount = towers.length;
        for (let i = 0; i < towerCount; i++) {
            // Command a tower to perform an action if applicable
            TowerController.command(towers[i], state);
        }
    }

    /** Commands the spawners in this room to spawn if necessary */
    private static commandSpawners(state: ICurrentRoomState, spawns?: StructureSpawn[]) {
        if (spawns == null || spawns.length === 0) {
            // No spawns present
            return;
        }

        const spawnCount = spawns.length;
        for (let i = 0; i < spawnCount; i++) {
            // Command a spawn to perform an action if applicable
            SpawnController.spawn(spawns[i], state);
        }
    }
}
