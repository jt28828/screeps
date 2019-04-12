import { ICreepCounts } from "../interfaces/creep-counts";
import { ICurrentRoomState } from "../interfaces/room";
import { IMyCreepMemory } from "../interfaces/my-creep";

// The levels for a room at level 1
const level1Counts: ICreepCounts = {
    builder: 2,
    harvester: 3,
    upgrader: 2,
};

/** Contains logic to control room spawns */
export class SpawnController {

    /**
     * Spawns a predefined number of creeps.
     * allows changing logic based on controller level.
     * Order of spawn priority is:
     * 1. Harvester
     * 2. Upgrader
     * 3. Builder
     */
    public static spawn(spawner: StructureSpawn, roomState: ICurrentRoomState, controllerLevel: number = 1) {
        if (controllerLevel === 1) {
            // Check Harvesters
            const harvesters = roomState.slaves.filter((x) => x.memory.role === "harvester");
            if (harvesters.length < level1Counts.harvester) {
                this.spawnLevel1Harvester(spawner);
                return;
            }

            // Check Upgraders
            const upgraders = roomState.slaves.filter((x) => x.memory.role === "upgrader");
            if (upgraders.length < level1Counts.upgrader) {
                this.spawnLevel1Upgrader(spawner);
                return;
            }

            // Check Builders
            const builders = roomState.slaves.filter((x) => x.memory.role === "builder");
            if (builders.length < level1Counts.builder) {
                this.spawnLevel1Builder(spawner);
                return;
            }
        }
    }

    /** Spawns a level 1 harvester creep  */
    public static spawnLevel1Harvester(spawner: StructureSpawn) {
        const memory: IMyCreepMemory = { role: "harvester" };
        spawner.spawnCreep([WORK, MOVE, CARRY], `Harvester${Date.now()}`, { memory });
    }

    /** Spawns a level 1 upgrader creep  */
    public static spawnLevel1Upgrader(spawner: StructureSpawn) {
        const memory: IMyCreepMemory = { role: "harvester" };
        spawner.spawnCreep([WORK, MOVE, CARRY], `Upgrader${Date.now()}`, { memory });
    }

    /** Spawns a level 1 builder creep  */
    public static spawnLevel1Builder(spawner: StructureSpawn) {
        const memory: IMyCreepMemory = { role: "harvester" };
        spawner.spawnCreep([WORK, MOVE, CARRY], `Builder${Date.now()}`, { memory });
    }
}
