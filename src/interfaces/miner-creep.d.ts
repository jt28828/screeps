import { IHarvesterCreep, IMyHarvesterMemory } from "./harvester-creep";

/** A Harvester creep is designed to collect and distribute energy */
export interface IMinerCreep extends IHarvesterCreep {
    memory: IMyMinerMemory;
}

export interface IMyMinerMemory extends IMyHarvesterMemory {
    isMining: boolean;
}
