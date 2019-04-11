import { IMyCreep, IMyCreepMemory } from "./my-creep";

/** An Upgrader creep is designed to upgrade buildings */
export interface IUpgraderCreep extends IMyCreep {
    memory: IMyUpgraderMemory;
}

export interface IMyUpgraderMemory extends IMyCreepMemory {
    isUpgrading: boolean;
}
