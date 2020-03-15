/** Contains functions used for generating creeps of different types and levels */
import { CreepRole } from "../enums/creep-role";
import { ICreepGenerationData } from "../models/interfaces/creep-generation-data";

export class CreepFactory {
    /** Returns the data required to get the game to generate a creep */
    public static generateCreep(type: CreepRole, room: Room): ICreepGenerationData {
        switch (type) {
            case CreepRole.transporter:
                return this.generateTransporter(room);
            case CreepRole.upgrader:
                return this.generateUpgrader(room);
            case CreepRole.builder:
                return this.generateBuilder(room);
            case CreepRole.miner:
                return this.generateMiner(room);
            default:
                // Default is all-rounder
                return this.generateAllRounder();
        }
    }

    /**
     * Generates an all-rounder creep, the starting out creep.
     * Costs 250 energy for each
     */
    private static generateAllRounder(): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.allRounder);
        const name = `MASTER-OF-NONE-${Game.time.toString()}`;
        const bodyParts: BodyPartConstant[] = [WORK, CARRY, CARRY, MOVE];

        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /***
     * Creates a new transporter creep
     */
    private static generateTransporter(room: Room): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.transporter);
        const name = `STATHAM-${Game.time.toString()}`;

        // Don't need WORK parts at all
        const bodyParts = this.generateMaxLeftoverParts(room.energyAvailable);
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates an upgrader creep.
     */
    private static generateUpgrader(room: Room): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.upgrader);
        const name = `HARDER-BETTER-FASTER-${Game.time.toString()}`;
        const defaultParts: BodyPartConstant[] = [WORK];

        // Needs a single WORK part
        const bodyParts = [...defaultParts, ...this.generateMaxLeftoverParts(room.energyAvailable - BODYPART_COST[WORK])];
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a builder creep.
     */
    private static generateBuilder(room: Room): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.builder);
        const name = `IM-ON-SMOKO-${Game.time.toString()}`;

        // Builders need at least 1 work part and 2 other parts to support it
        const workParts: BodyPartConstant[] = [WORK, CARRY, MOVE];

        const layerCosts = BODYPART_COST[CARRY] + BODYPART_COST[MOVE];

        let currentBudget = layerCosts;
        let leftoverEnergy = room.energyAvailable - (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]);
        while (leftoverEnergy >= currentBudget) {
            // Add as many work parts as possible to the builder so it can build faster
            workParts.push(WORK);
            currentBudget += layerCosts;
            leftoverEnergy -= BODYPART_COST[WORK];
        }

        const bodyParts = [...workParts, ...this.generateMaxLeftoverParts(leftoverEnergy)];
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a miner creep.
     * Miners have high work potential but low movement.
     * Requires minimum 300 energy to spawn
     */
    private static generateMiner(room: Room): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.miner);
        const name = `ITS-OFF-TO-WORK-I-GO-${Game.time.toString()}`;
        const bodyParts: (WORK | MOVE)[] = [WORK, WORK, MOVE, MOVE];

        let minerCost = bodyParts
            .map(part => BODYPART_COST[part])
            .reduce((prev, current) => prev + current);


        while (room.energyAvailable >= minerCost && bodyParts.length < 7) {
            // A creep with 5 WORK parts should be able to empty out a source each regen
            bodyParts.push(WORK);
            minerCost += BODYPART_COST[WORK];
        }

        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates the maximum amount of alternating move and carry parts possible.
     * Parts can be added before this to customise a creep
     * */
    private static generateMaxLeftoverParts(energyBudget: number): BodyPartConstant[] {
        const layerCost = BODYPART_COST[MOVE] + BODYPART_COST[CARRY];
        let energyLeft = energyBudget;
        let bodyParts: BodyPartConstant[] = [];
        while (energyLeft >= 100) {
            // Add "Layers" of parts to the creep until there's no energy left for another layer. Min amount is 100 energy
            bodyParts = bodyParts.concat([MOVE, CARRY]);
            energyLeft -= layerCost;
        }
        return bodyParts;
    }

    /** Generates a creep's memory */
    private static generateMemory(currentRole: CreepRole): CreepMemory {
        return {currentRole, stuckCounter: 0};
    }
}
