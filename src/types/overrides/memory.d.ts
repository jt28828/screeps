import { CreepRole } from "../../enums/creep-role";
import { RoomStatus } from "../../enums/room-status";

declare global {
    interface MyMemory {
        roomIds: string[];
    }

    interface Memory {
        myMemory: MyMemory
    }

    interface RoomMemory {
        roomStatus: RoomStatus;
        roomIsSigned: boolean;
        damagedStructureIds: string[];
        enemyIds: string[];
        structureIds: string[];
        myStructureIds: string[];
        constructionSiteIds: string[];
        sourceIds: string[];
        /** The ID of miners associated with a source */
        sourceMiners: { [sourceId: string]: string[] }
    }

    interface CreepMemory {
        currentRole: CreepRole,
        energyCollectionTargetId?: string;
    }

    // ============================================================
    // Creep Specializations (Only difference is memory properties)
    // ============================================================


    /** A creep specialization that is used to rapidly mine for energy */
    interface MinerCreep extends Creep {
        memory: MinerCreepMemory;
    }

    interface MinerCreepMemory extends CreepMemory {
        miningSourceId?: string;
    }
}
