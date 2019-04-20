import { IMyCreepMemory } from "../interfaces/my-creep";
import { INewCreep } from "../interfaces/new-creep";

/** Contains functions used for generating creeps of different types and levels */
export class CreepFactory {

    /** Generates a harvester of the designated level. Only supports level 1 and 2 for now */
    public static generateHarvester(level: number = 1): INewCreep {
        switch (level) {
            case 1:
                return this.generateLevel1Harvester();
            case 2:
                return this.generateLevel2Harvester();
            case 3:
                return this.generateLevel3Harvester();
            default:
                throw new Error(`Harvester level ${level} not supported`);
        }
    }

    public static generateBuilder(level: number): INewCreep {
        switch (level) {
            case 1:
                return this.generateLevel1Builder();
            case 2:
                return this.generateLevel2Builder();
            case 3:
                return this.generateLevel3Builder();
            default:
                throw new Error(`Builder level ${level} not supported`);
        }
    }

    public static generateUpgrader(level: number): INewCreep {
        switch (level) {
            case 1:
                return this.generateLevel1Upgrader();
            case 2:
                return this.generateLevel2Upgrader();
            case 3:
                return this.generateLevel3Upgrader();
            default:
                throw new Error(`Upgrader level ${level} not supported`);
        }
    }

    public static generateMiner(level: number): INewCreep {
        switch (level) {
            case 2:
                return this.generateLevel2Miner();
            case 3:
                return this.generateLevel3Miner();
            default:
                throw new Error(`Miner level ${level} not supported`);
        }
    }

    /**
     * Generates a level 1 harvester creep
     * Requires 250 Energy
     */
    private static generateLevel1Harvester(): INewCreep {
        const memory: IMyCreepMemory = { role: "harvester", level: 1 };
        const name = `Harvester${Date.now()}`;
        const bodyParts = [WORK, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 2 harvester creep
     * Requires 400 Energy (1 Spawn + 2 Extensions)
     */
    private static generateLevel2Harvester(): INewCreep {
        const memory: IMyCreepMemory = { role: "harvester", level: 2 };
        const name = `HarvesterV2${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 3 harvester creep
     * Requires 500 Energy (1 Spawn + 4 Extensions)
     */
    private static generateLevel3Harvester(): INewCreep {
        const memory: IMyCreepMemory = { role: "harvester", level: 3 };
        const name = `HarvesterV3${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 1 upgrader creep.
     * Requires 250 Energy
     */
    private static generateLevel1Upgrader(): INewCreep {
        const memory: IMyCreepMemory = { role: "upgrader", level: 1 };
        const name = `Upgrader${Date.now()}`;
        const bodyParts = [WORK, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 2 upgrader creep.
     * Requires 400 Energy (1 Spawn + 2 Extensions)
     */
    private static generateLevel2Upgrader(): INewCreep {
        const memory: IMyCreepMemory = { role: "upgrader", level: 2 };
        const name = `UpgraderV2${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 3 upgrader creep.
     * Requires 500 Energy (1 Spawn + 4 Extensions)
     */
    private static generateLevel3Upgrader(): INewCreep {
        const memory: IMyCreepMemory = { role: "upgrader", level: 3 };
        const name = `UpgraderV3${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 1 builder creep.
     * Requires 250 Energy
     */
    private static generateLevel1Builder(): INewCreep {
        const memory: IMyCreepMemory = { role: "builder", level: 1 };
        const name = `Builder${Date.now()}`;
        const bodyParts = [WORK, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 2 builder creep.
     * Requires 400 Energy (1 Spawn + 2 Extensions)
     */
    private static generateLevel2Builder(): INewCreep {
        const memory: IMyCreepMemory = { role: "builder", level: 2 };
        const name = `BuilderV2${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 3 builder creep.
     * Requires 500 Energy (1 Spawn + 4 Extensions)
     */
    private static generateLevel3Builder(): INewCreep {
        const memory: IMyCreepMemory = { role: "builder", level: 3 };
        const name = `BuilderV3${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, CARRY, CARRY, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 2 miner creep. Miners are only available from level 2
     * Requires 400 Energy (1 Spawn + 2 Extensions)
     */
    private static generateLevel2Miner(): INewCreep {
        const memory: IMyCreepMemory = { role: "miner", level: 2 };
        const name = `MinerV2${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }

    /**
     * Generates a level 2 miner creep. Miners are only available from level 2
     * Requires 500 Energy (1 Spawn + 4 Extensions)
     */
    private static generateLevel3Miner(): INewCreep {
        const memory: IMyCreepMemory = { role: "miner", level: 3 };
        const name = `MinerV3${Date.now()}`;
        const bodyParts = [WORK, WORK, WORK, MOVE, CARRY, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }
}
