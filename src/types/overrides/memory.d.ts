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
        damagedStructureIds: Id<Structure>[];
        droppedEnergyIds: Id<Resource>[];
        enemyIds: Id<Creep>[];
        structureIds: Id<Structure>[];
        myStructureIds: Id<AnyOwnedStructure>[];
        constructionSiteIds: Id<ConstructionSite>[];
        sourceIds: Id<Source>[];
    }
}
