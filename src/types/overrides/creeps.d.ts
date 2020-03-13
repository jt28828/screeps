import { CreepRole } from "../../enums/creep-role";
import { CreepTasks } from "../../enums/creep-tasks";


declare global {
    interface CreepMemory {
        currentRole: CreepRole,
        stuckCounter: number;
        currentTask?: CreepTasks;
        currentTaskTargetId?: string;
    }

// ============================================================
// Creep Specializations (Only difference is memory properties)
// ============================================================


    /** A creep specialization that is used to rapidly mine for energy */
    interface MinerCreep extends Creep {
        memory: MinerCreepMemory;
    }

    interface MinerCreepMemory extends CreepMemory {
    }

    // Allrounder is a miner creep with basic build and upgrade capabilities
    interface AllRounderCreep extends MinerCreep {
        memory: AllRounderCreepMemory;
    }

    interface AllRounderCreepMemory extends MinerCreepMemory {
    }
}