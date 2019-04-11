import { IBuilderCreep } from "../interfaces/creeps/builder-creep";
import { IHarvesterCreep } from "../interfaces/creeps/harvester-creep";
import { IMyCreep } from "../interfaces/creeps/my-creep";
import { IUpgraderCreep } from "../interfaces/creeps/upgrader-creep";

/** Determines whether a creep is a harvester */
export function isHarvester(creep: IMyCreep): creep is IHarvesterCreep {
    return (creep as IHarvesterCreep).memory.role === "harvester";
}

/** Determines whether a creep is an upgrader */
export function isUpgrader(creep: IMyCreep): creep is IUpgraderCreep {
    return (creep as IHarvesterCreep).memory.role === "upgrader";
}

/** Determines whether a creep is a builder */
export function isBuilder(creep: IMyCreep): creep is IBuilderCreep {
    return (creep as IHarvesterCreep).memory.role === "builder";
}
