import { IMyCreep } from "../interfaces/my-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { BuilderController } from "../roles/builder";
import { HarvesterController } from "../roles/harvester";
import { UpgraderController } from "../roles/upgrader";
import { TowerController } from "../structures/tower";
import { isBuilder, isHarvester, isUpgrader } from "../utility/creep-utils";

export class RoomController {
    /**
     * Commands all of the creeps / structures in a room to do a task.
     * Runs once every loop
     */
    public static control(room: Room): void {
        const roomState = this.getCurrentRoomState(room);
        this.commandCreeps(roomState);
        this.commandStructures(roomState);
    }

    /** Returns information about the current state of the room */
    private static getCurrentRoomState(room: Room): ICurrentRoomState {
        const slaves = room.find(FIND_MY_CREEPS) as IMyCreep[];
        const structures = room.find(FIND_MY_STRUCTURES);
        const enemies = room.find(FIND_HOSTILE_CREEPS);
        const damagedAllies = slaves.filter((x) => x.hits < x.hitsMax);
        const damagedStructures = structures.filter((x) => x.hits < x.hitsMax);

        return {
            damagedAllies,
            damagedStructures,
            enemies,
            slaves,
            structures,
        };
    }

    /** Commands all the creeps in the room to perform their actions */
    private static commandCreeps(state: ICurrentRoomState): void {
        const allyCreeps = state.slaves;

        const creepCount = allyCreeps.length;
        for (let i = 0; i < creepCount; i++) {
            const thisCreep = allyCreeps[i];

            if (isHarvester(thisCreep)) {
                HarvesterController.work(thisCreep);
            }
            if (isUpgrader(thisCreep)) {
                UpgraderController.work(thisCreep);
            }
            if (isBuilder(thisCreep)) {
                BuilderController.work(thisCreep);
            }
        }
    }

    /** Commands all the structures in the room to perform their actions */
    private static commandStructures(roomState: ICurrentRoomState) {
        const justTowers = roomState.structures.filter((s) => s.structureType === STRUCTURE_TOWER) as StructureTower[];

        this.commandTowers(roomState, justTowers);
    }

    /** Commands the towers in this room to shoot or heal */
    private static commandTowers(state: ICurrentRoomState, towers?: StructureTower[]) {
        if (towers == null || towers.length === 0) {
            // No towers present
            return;
        }

        const towerCount = towers.length;
        for (let i = 0; i < towerCount; i++) {
            // Command a tower to perform an action if applicable
            TowerController.command(towers[i], state);
        }
    }
}
