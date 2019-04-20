import { ICreepCounts } from "../interfaces/creep-counts";

// The levels for a room at level 1
export const level1CreepCounts: ICreepCounts = {
    builder: 2,
    harvester: 3,
    miner: 0,
    upgrader: 2,
};

// The levels for a room at level 2
export const level2CreepCounts: ICreepCounts = {
    builder: 2,
    harvester: 3,
    miner: 2,
    upgrader: 4,
};

// The levels for a room at level 3
export const level3CreepCounts: ICreepCounts = {
    builder: 4,
    harvester: 3,
    miner: 4,
    upgrader: 3,
};
