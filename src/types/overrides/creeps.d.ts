import { CreepRole } from "../../enums/creep-role";
import { CreepTasks } from "../../enums/creep-tasks";


declare global {
    interface CreepMemory {
        currentRole: CreepRole,
        stuckCounter: number;
        currentTask?: CreepTasks;
        currentTaskTargetId?: Id<any>;
    }

    /**
     * ==================================
     *      Specialized creep memory
     * ==================================
     */

    interface MinerCreep extends Creep {
        memory: MinerCreepMemory;
    }

    interface MinerCreepMemory extends CreepMemory {
        containerTargetId?: Id<StructureContainer>;
    }
}