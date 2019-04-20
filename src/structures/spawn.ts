import { level1CreepCounts, level2CreepCounts, level3CreepCounts } from "../constants/creep-counts";
import { CreepFactory } from "../factories/creep-factory";
import { ICreepCounts } from "../interfaces/creep-counts";
import { IMyCreep } from "../interfaces/my-creep";
import { INewCreep } from "../interfaces/new-creep";
import { ICurrentRoomState } from "../interfaces/room";

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
    public static spawn(spawner: StructureSpawn, roomState: ICurrentRoomState) {
        switch (roomState.roomLevel) {
            case 1:
                this.spawnCreeps(spawner, roomState.slaves, level1CreepCounts, 1);
                break;
            case 2:
                this.spawnCreeps(spawner, roomState.slaves, level2CreepCounts, 2);
                break;
            case 3:
                this.spawnCreeps(spawner, roomState.slaves, level3CreepCounts, 3);
                break;
            default:
                this.spawnCreeps(spawner, roomState.slaves, level1CreepCounts, 1);
                break;
        }
    }

    /** Spawns a creep if required */
    private static spawnCreeps(spawner: StructureSpawn, creeps: IMyCreep[], counts: ICreepCounts, level: number) {
        let newCreep: INewCreep | null = null;
        let response: ScreepsReturnCode = 0;
        // The percentage of difference between the current amount and the required
        let current: number = 1;
        const upgraders = creeps.filter((x) => x.memory.role === "upgrader");
        const harvesters = creeps.filter((x) => x.memory.role === "harvester");
        const builders = creeps.filter((x) => x.memory.role === "builder");
        const miners = creeps.filter((x) => x.memory.role === "miner");

        if (harvesters.length < counts.harvester) {
            // Check Harvesters
            current = this.calculateCurrentPercentage(counts.harvester, harvesters.length);
            newCreep = CreepFactory.generateHarvester(level);
            response = spawner.spawnCreep(newCreep.bodyParts, newCreep.name, newCreep.spawnOptions);
        } else if (upgraders.length < counts.upgrader) {
            // Check Upgraders
            current = this.calculateCurrentPercentage(counts.upgrader, upgraders.length);
            newCreep = CreepFactory.generateUpgrader(level);
            response = spawner.spawnCreep(newCreep.bodyParts, newCreep.name, newCreep.spawnOptions);
        } else if (builders.length < counts.builder) {
            // Check Builders
            current = this.calculateCurrentPercentage(counts.builder, builders.length);
            newCreep = CreepFactory.generateBuilder(level);
            response = spawner.spawnCreep(newCreep.bodyParts, newCreep.name, newCreep.spawnOptions);
        } else if (miners.length < counts.miner) {
            // Check Builders
            current = this.calculateCurrentPercentage(counts.miner, builders.length);
            newCreep = CreepFactory.generateMiner(level);
            response = spawner.spawnCreep(newCreep.bodyParts, newCreep.name, newCreep.spawnOptions);
        }

        if (newCreep != null) {
            // A new creep was created. Generate it
            if (response !== OK) {
                // Not enough energy to generate a creep of this level. If creeps not at required amount,
                // Roll back a level and attempt to spawn a weaker creep to keep up with demand
                if (level > 1 && current < 1) {
                    this.spawnCreeps(spawner, creeps, counts, --level);
                }
            }
        }
    }

    /** Calculates the current percentage of creeps currently spawned compared to required */
    private static calculateCurrentPercentage(target: number, current: number) {
        if (current === 0 || target === 0) {
            return 0;
        }
        return current / target;
    }
}
