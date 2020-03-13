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
}