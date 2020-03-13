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
        damagedStructureIds: string[];
        enemyIds: string[];
        structureIds: string[];
        myStructureIds: string[];
        constructionSiteIds: string[];
        sourceIds: string[];
        /** The ID of miners associated with a source */
        sourceMiners: { [sourceId: string]: string[] }
    }
}
