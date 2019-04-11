import { IMyCreep, IMyCreepMemory } from "./my-creep";

/** A Harvester creep is designed to collect and distribute energy */
export interface IHarvesterCreep extends IMyCreep {
    memory: IMyHarvesterMemory;
}

export interface IMyHarvesterMemory extends IMyCreepMemory {
    isMining: boolean;
}
