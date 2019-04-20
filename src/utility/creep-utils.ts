import { IBuilderCreep } from "../interfaces/builder-creep";
import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { IMinerCreep } from "../interfaces/miner-creep";
import { IMyCreep } from "../interfaces/my-creep";
import { IUpgraderCreep } from "../interfaces/upgrader-creep";

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

export function isMiner(creep: IMyCreep): creep is IMinerCreep {
    return (creep as IMinerCreep).memory.role === "miner";
}
