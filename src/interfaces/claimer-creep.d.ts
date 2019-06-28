import { IMyCreep, IMyCreepMemory } from "./my-creep";

/** A Claimer creep designed to travel to rooms and claim controllers */
export interface IClaimerCreep extends IMyCreep {
    memory: IMyClaimerMemory;
}

export interface IMyClaimerMemory extends IMyCreepMemory {
    isTravelling: boolean;
    isInCorrectRoom: boolean;
}
