import { MyCreepRoles } from "../types/roles";

/** Memory for my creeps, Extending the interface of the regular memory with extra values  */

export interface IMyCreep extends Creep {
    memory: IMyCreepMemory;
}

export interface IMyCreepMemory extends CreepMemory {
    /** The Role this creep has */
    role: MyCreepRoles;
    level: number;
    /** If this creep is collecting or taking to a deposit. The deposit they should collect or store in from until full */
    storageTarget?: string | null;
    /** If this creep is mining. The source they should mine from until full */
    miningTarget?: string | null;
    /** Whether or not the creep is currently collecting energy from a container */
    isCollecting?: boolean | null;
    /** Whether or not the creep is currently collecting energy from a source */
    isMining?: boolean;
}
