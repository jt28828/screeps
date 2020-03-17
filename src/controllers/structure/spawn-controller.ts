/** Contains logic to control room spawns */
import { RoomMemoryManager } from "../../memory/room-memory-manager";
import { CreepRole } from "../../enums/creep-role";
import { maxCreepCounts } from "../../constants/creep-counts";
import { CreepFactory } from "../../factories/creep-factory";

export class SpawnController {
    private _spawner: StructureSpawn;
    private _roomState: RoomMemoryManager;


    constructor(spawner: StructureSpawn, roomState: RoomMemoryManager) {
        this._spawner = spawner;
        this._roomState = roomState;
    }

    /**
     * Spawns a predefined number of creeps.
     * allows changing logic based on controller level.
     * Order of spawn priority is:
     */
    public spawn() {
        let creepType: CreepRole | undefined;

        const allRounders = this._roomState.myCreeps.filter(x => x.memory.currentRole === CreepRole.allRounder);
        const miners = this._roomState.myCreeps.filter((x) => x.memory.currentRole === CreepRole.miner);
        const upgraders = this._roomState.myCreeps.filter((x) => x.memory.currentRole === CreepRole.upgrader);
        const transporters = this._roomState.myCreeps.filter((x) => x.memory.currentRole === CreepRole.transporter);
        const builders = this._roomState.myCreeps.filter((x) => x.memory.currentRole === CreepRole.builder);

        const requiredCreeps = maxCreepCounts[this._roomState.room.memory.currentLevel];
        if (allRounders.length < requiredCreeps.allRounder) {
            // Create an allrounder
            creepType = CreepRole.allRounder;
        } else if (miners.length < requiredCreeps.miner) {
            // Create a Miner
            creepType = CreepRole.miner;
        } else if (transporters.length < requiredCreeps.transporter) {
            // Create a Transporter
            creepType = CreepRole.transporter;
        } else if (upgraders.length < requiredCreeps.upgrader) {
            // Create an Upgrader
            creepType = CreepRole.upgrader;
        } else if (builders.length < requiredCreeps.builder) {
            // Create a Builder
            creepType = CreepRole.builder;
        }

        if (creepType !== undefined) {
            // Create the creep
            const roomIsMaxedOut = this._roomState.room.controller?.level === 8;
            const newCreep = CreepFactory.generateCreep(creepType, this._roomState.room, roomIsMaxedOut);
            this._spawner.spawnCreep(newCreep.bodyParts, newCreep.name, newCreep.spawnOptions);
        }
    }
}
