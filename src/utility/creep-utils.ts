import { IBuilderCreep } from "../interfaces/builder-creep";
import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { IMinerCreep } from "../interfaces/miner-creep";
import { IMyCreep } from "../interfaces/my-creep";
import { IUpgraderCreep } from "../interfaces/upgrader-creep";
import { IClaimerCreep } from "../interfaces/claimer-creep";
import { MyCreepRoles } from "../types/roles";

// TODO delete the check for strings once this generation of creeps dies out

/** Determines whether a creep is a harvester */
export function isHarvester(creep: IMyCreep): creep is IHarvesterCreep {
    const thisCreep = creep as IHarvesterCreep;
    return thisCreep.memory.role === MyCreepRoles.harvester || thisCreep.memory.role === "harvester";
}

/** Determines whether a creep is an upgrader */
export function isUpgrader(creep: IMyCreep): creep is IUpgraderCreep {
    const thisCreep = creep as IUpgraderCreep;
    return thisCreep.memory.role === MyCreepRoles.upgrader || thisCreep.memory.role === "upgrader";
}

/** Determines whether a creep is a builder */
export function isBuilder(creep: IMyCreep): creep is IBuilderCreep {
    const thisCreep = creep as IBuilderCreep;
    return thisCreep.memory.role === MyCreepRoles.builder || thisCreep.memory.role === "builder";
}

export function isRemoteBuilder(creep: IMyCreep): creep is IBuilderCreep {
    const thisCreep = creep as IBuilderCreep;
    return thisCreep.memory.role === MyCreepRoles.remoteBuilder || thisCreep.memory.role === "remoteBuilder";
}

export function isMiner(creep: IMyCreep): creep is IMinerCreep {
    const thisCreep = creep as IMinerCreep;
    return thisCreep.memory.role === MyCreepRoles.miner || thisCreep.memory.role === "miner";
}

export function isClaimer(creep: IMyCreep): creep is IClaimerCreep {
    const thisCreep = creep as IClaimerCreep;
    return thisCreep.memory.role === MyCreepRoles.claimer || thisCreep.memory.role === "claimer";
}
