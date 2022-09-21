/** Contains functions used for generating creeps of different types and levels */
import { CreepRole } from "../enums/creep-role";
import { ICreepGenerationData } from "../models/interfaces/creep-generation-data";

export class CreepFactory {
    /** Returns the data required to get the game to generate a creep */
    public static generateCreep(type: CreepRole, room: Room, variant?: boolean): ICreepGenerationData {
        switch (type) {
            case CreepRole.transporter:
                return this.generateTransporter(room);
            case CreepRole.upgrader:
                if (variant) {
                    return this.generateDelayedUpgrader(room);
                } else {
                    return this.generateUpgrader(room);
                }
            case CreepRole.builder:
                return this.generateBuilder(room);
            case CreepRole.traveller:
                return this.generateTraveller(room);
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

        // Only needs alternating move and carry parts to transport energy
        const bodyParts = this.addLayers(room, [MOVE, CARRY], BODYPART_COST[WORK], 1);

        return {
            bodyParts: [...bodyParts, WORK],
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
        const bodyParts = this.generateWorker(room);

        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a maintenance upgrader creep
     * These keep level 8 controllers from degrading but don't attempt to level it up in any way
     */
    private static generateDelayedUpgrader(room: Room): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.upgrader);
        const name = `MAINTAINERBOT-${Game.time.toString()}`;

        // Add alternating move and carry parts until full
        const leftoverParts = this.addLayers(room, [MOVE, CARRY], BODYPART_COST[WORK], 1);

        // Needs a single WORK part, otherwise fill with move and carry parts
        const bodyParts = [WORK, ...leftoverParts];
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
        const bodyParts = this.generateWorker(room);

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
        const bodyParts: (BodyPartConstant)[] = [WORK, WORK, MOVE, MOVE];

        let minerCost = bodyParts
            .map(part => BODYPART_COST[part])
            .reduce((prev, current) => prev + current);

        // Just add work parts to the miner until it's full.
        // Only need to add 3 more at most because that will empty a regen
        const usedParts = 50 - 3;

        const workParts = this.addLayers(room, [WORK], minerCost, usedParts);

        bodyParts.push(...workParts);

        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a traveller creep.
     */
    private static generateTraveller(room: Room): ICreepGenerationData {
        const memory = this.generateMemory(CreepRole.traveller);
        const name = `AROUND-THE-WORLD-IN-${Game.time.toString()}-DAYS`;
        const bodyParts = this.generateWorker(room);

        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /** Generates a worker creep body, used by upgraders and builders */
    private static generateWorker(room: Room) {
        // Workers need at least 1 work part and 2 other parts to support it
        const initialParts: BodyPartConstant[] = [WORK, CARRY, MOVE];
        const initialPartCost = BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
        const layerCosts = BODYPART_COST[WORK] + BODYPART_COST[MOVE];

        let leftoverEnergy = room.energyAvailable - layerCosts - initialPartCost;

        // Set to 20 parts to get maximum 15 layers
        const workParts = this.addLayers(room, [WORK, MOVE], leftoverEnergy, 20);

        // Add alternating move and carry parts until full
        const leftoverParts = this.addLayers(room, [MOVE, CARRY], leftoverEnergy, workParts.length + initialParts.length);

        return [...initialParts, ...workParts, ...leftoverParts];
    }

    /** Generates a creep's memory */
    private static generateMemory(currentRole: CreepRole): CreepMemory {
        return {currentRole, stuckCounter: 0};
    }

    /** Repeatedly adds layers to the creep until full or until energy runs out */
    private static addLayers(room: Room, layer: BodyPartConstant[], usedEnergy = 0, currentParts = 0) {
        const layerCost = layer.reduce((total, bodyPart) => total + BODYPART_COST[bodyPart], 0);
        const maxPartsToAdd = 50 - currentParts;

        const parts: BodyPartConstant[] = [];

        let energyLeft = room.energyAvailable - usedEnergy - layerCost;
        currentParts += layer.length;

        while (energyLeft >= layerCost && currentParts <= maxPartsToAdd) {
            parts.push(...layer);
            energyLeft -= layerCost;
            currentParts += layer.length;
        }

        return parts;
    }
}
