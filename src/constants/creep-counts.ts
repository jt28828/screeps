import { ICreepCounts } from "../interfaces/creep-counts";

export const maxRemoteBuilderCount: number = 4;

// The maximum amount of creeps of each type that should be generated
export const maxCreepCounts: ICreepCounts = {
    builder: 2,
    harvester: 2,
    miner: 3,
    upgrader: 2,
};
