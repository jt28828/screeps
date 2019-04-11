import { MyCreepRoles } from "../../types/roles";


/** Memory for my creeps, Extending the interface of the regular memory with extra values  */

export interface IMyCreep extends Creep {
    memory: IMyCreepMemory;
} 

export interface IMyCreepMemory extends CreepMemory {
    /** The Role this creep has */
    role: MyCreepRoles;
}
