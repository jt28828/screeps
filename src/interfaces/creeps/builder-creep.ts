import { IMyCreep, IMyCreepMemory } from "./my-creep";
/** A Builder creep is designed to build and repair structures */
export interface IBuilderCreep extends IMyCreep {
    memory: IMyBuilderMemory;
}

export interface IMyBuilderMemory extends IMyCreepMemory {
    /** Whether or not the creep is currently building */
    isBuilding: boolean;
}
