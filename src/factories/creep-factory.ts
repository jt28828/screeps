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
            default:
                return this.generateLevel1Harvester();
        }
    }

    public static generateBuilder(level: number): INewCreep {
        switch (level) {
            case 1:
                return this.generateLevel1Builder();
            case 2:
                return this.generateLevel2Builder();
            default:
                return this.generateLevel1Builder();
        }
    }

    public static generateUpgrader(level: number): INewCreep {
        switch (level) {
            case 1:
                return this.generateLevel1Upgrader();
            case 2:
                return this.generateLevel2Upgrader();
            default:
                return this.generateLevel1Upgrader();
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
        const name = `Builder${Date.now()}`;
        const bodyParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
        return {
            bodyParts,
            name,
            spawnOptions: { memory },
        };
    }
}
