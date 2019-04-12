import { ICurrentRoomState } from "../interfaces/room";

/** Contains logic to control room spawns */
export class SpawnController {

    /**
     * Spawns a predefined number of creeps.
     * allows changing logic based on controller level.
     * Order of spawn priority is:
     * 1. Harvester
     * 2. Upgrader
     * 3. Builder
     */
    public static spawn(spawner: StructureSpawn, roomState: ICurrentRoomState, controllerLevel: number = 1) {

    }
}