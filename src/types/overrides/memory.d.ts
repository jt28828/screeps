import { CreepRole } from "../../enums/creep-role";
import { RoomStatus } from "../../enums/room-status";
import { RoomLevels } from "../../enums/room-levels";

declare global {
    interface MyMemory {
        roomIds: string[];
    }

    interface Memory {
        myMemory: MyMemory
    }

    interface RoomMemory {
        roomStatus: RoomStatus;
        currentLevel: RoomLevels,
        sourceCount: number,
        damagedStructureIds: string[];
        enemyIds: string[];
        structureIds: string[];
        myStructureIds: string[];
        constructionSiteIds: string[];
        sourceIds: string[];
    }
}
