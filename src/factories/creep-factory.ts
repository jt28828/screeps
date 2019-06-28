import { IMyCreepMemory } from "../interfaces/my-creep";
import { INewCreep } from "../interfaces/new-creep";
import { MyCreepRoles } from "../types/roles";

/** Contains functions used for generating creeps of different types and levels */
export class CreepFactory {
    /** Returns the data required to get the game to generate a creep */
    public static generateCreep(type: MyCreepRoles, room: Room): INewCreep {
        switch (type) {
            case MyCreepRoles.upgrader:
                return this.generateUpgrader(room);
            case MyCreepRoles.builder:
                return this.generateBuilder(room);
            case MyCreepRoles.miner:
                return this.generateMiner(room);
            case MyCreepRoles.claimer:
                return this.generateClaimer();
            default:
                // Default is harvester
                return this.generateHarvester(room);
        }
    }

    /**
     * Generates a Claimer creep. Claimers are only available from level 2
     * Requires 600 Energy (1 Spawn + 4 Extensions)
     */
    private static generateClaimer(): INewCreep {
        const memory = this.generateMemory(MyCreepRoles.claimer);
        const name = `CLMR-${Game.time.toString()}`;
        const bodyParts = [MOVE, CLAIM];
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a level 3 harvester creep
     * Requires 500 Energy (1 Spawn + 4 Extensions)
     */
    private static generateHarvester(room: Room): INewCreep {
        const memory = this.generateMemory(MyCreepRoles.harvester);
        const name = `HRVSTR-${Game.time.toString()}`;
        const bodyParts = this.generateMaxWorkerBodyParts(room);
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a upgrader creep.
     */
    private static generateUpgrader(room: Room): INewCreep {
        const memory = this.generateMemory(MyCreepRoles.upgrader);
        const name = `UPGRDR-${Game.time.toString()}`;
        const bodyParts = this.generateMaxWorkerBodyParts(room);
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a builder creep.
     */
    private static generateBuilder(room: Room): INewCreep {
        const memory = this.generateMemory(MyCreepRoles.builder);
        const name = `BLDR-${Game.time.toString()}`;
        const bodyParts = this.generateMaxWorkerBodyParts(room);
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates a miner creep
     */
    private static generateMiner(room: Room): INewCreep {
        const memory = this.generateMemory(MyCreepRoles.miner);
        const name = `MNR-${Game.time.toString()}`;
        const bodyParts = this.generateMaxWorkerBodyParts(room);
        return {
            bodyParts,
            name,
            spawnOptions: {memory},
        };
    }

    /**
     * Generates the maximum amount of body parts available for this creep with the current energy in the room.
     * Only used for worker creeps as there are no attacking parts
     * */
    private static generateMaxWorkerBodyParts(currentRoom: Room): BodyPartConstant[] {
        const workCost = 100;
        const currentEnergy = currentRoom.energyAvailable;

        /**
         * Parts are split into 6ths
         * 1/6th are work parts
         * 2/6th are carry parts
         * 3/6th are move parts
         */
        const requiredWorkParts = Math.floor(currentEnergy / workCost / 6);
        const requiredCarryParts = requiredWorkParts * 2;
        const requiredMoveParts = requiredWorkParts * 3;

        if (requiredWorkParts <= 1 || requiredCarryParts <= 1) {
            // Returns the most basic creep possible. Requires 200 energy
            return [WORK, CARRY, MOVE];
        }
        // Finally create an array of body parts and join together to return
        const workParts: BodyPartConstant[] = Array(requiredWorkParts).fill(WORK);
        const carryParts: BodyPartConstant[] = Array(requiredCarryParts).fill(CARRY);
        let moveParts: BodyPartConstant[] = Array(requiredMoveParts).fill(MOVE);

        return [...workParts, ...carryParts, ...moveParts];
    }

    /** Generates a creep's memory */
    private static generateMemory(role: MyCreepRoles): IMyCreepMemory {
        return {role, stuckCounter: 0};
    }
}
