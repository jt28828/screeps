import { CreepFactory } from "../factories/creep-factory";
import { ICreepCounts } from "../interfaces/creep-counts";
import { IMyCreep } from "../interfaces/my-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { MyCreepRoles } from "../types/roles";
import { maxCreepCounts } from "../constants/creep-counts";

/** Contains logic to control room spawns */
export class SpawnController {

    /**
     * Spawns a predefined number of creeps.
     * allows changing logic based on controller level.
     * Order of spawn priority is:
     * 1. Harvester
     * 2. Upgrader
     * 3. Builder
     * 4. Miner
     */
    public static spawn(spawner: StructureSpawn, roomState: ICurrentRoomState, room: Room) {
        this.spawnCreeps(spawner, roomState.slaves, maxCreepCounts, room);
    }

    /** Spawns a creep if required */
    private static spawnCreeps(spawner: StructureSpawn, creeps: IMyCreep[], counts: ICreepCounts, room: Room) {
        let creepType: MyCreepRoles = MyCreepRoles.escapeCase;

        const upgraders = creeps.filter((x) => x.memory.role === MyCreepRoles.upgrader);
        const harvesters = creeps.filter((x) => x.memory.role === MyCreepRoles.harvester);
        const builders = creeps.filter((x) => x.memory.role === MyCreepRoles.builder);
        const miners = creeps.filter((x) => x.memory.role === MyCreepRoles.miner);

        if (harvesters.length < counts.harvester) {
            // Check Harvesters
            creepType = MyCreepRoles.harvester;
        } else if (upgraders.length < counts.upgrader) {
            // Check Upgraders
            creepType = MyCreepRoles.upgrader;
        } else if (builders.length < counts.builder) {
            // Check Builders
            creepType = MyCreepRoles.builder;
        } else if (miners.length < counts.miner) {
            // Check Miners
            creepType = MyCreepRoles.miner;
        } else if (Game.flags.claimMe != null && !Memory.myMemory.claimerPresent) {
            // Spawn a Claimer only if the flag is present and a claimer doesn't already exist
            this.spawnClaimer(spawner, room);
        }

        if (creepType !== MyCreepRoles.escapeCase) {
            // Create the creep
            const newCreep = CreepFactory.generateCreep(creepType, room);
            spawner.spawnCreep(newCreep.bodyParts, newCreep.name, newCreep.spawnOptions);
        }
    }

    /** Spawning claimers is a special case as they must be marked down */
    private static spawnClaimer(spawner: StructureSpawn, room: Room) {
        const newClaimer = CreepFactory.generateCreep(MyCreepRoles.claimer, room);
        const response = spawner.spawnCreep(newClaimer.bodyParts, newClaimer.name, newClaimer.spawnOptions);
        if (response === OK) {
            // Succeeded. Save in memory
            Memory.myMemory.claimerPresent = true;
        }
    }
}
