import { buildingFlags, GroupBuildingFlags, groupBuildingFlags } from "../constants/flag-constants";

/** Handles automatic building in the provided room, where required */
export class TownPlanner {
    /** The room this controller is associated with */
    private room: Room;
    /** The flags present in the current room to be used for planning buildings */
    private singleBuildFlags: ReadonlyArray<Flag>;
    private groupBuildFlags: ReadonlyArray<Flag>;

    constructor(room: Room, flags: ReadonlyArray<Flag>) {
        this.room = room;
        this.singleBuildFlags = flags.filter(flag => buildingFlags.includes(flag.name as BuildableStructureConstant));
        this.groupBuildFlags = flags.filter(flag => groupBuildingFlags.includes(flag.name as GroupBuildingFlags));
    }

    /** Place any buildsites in the room that are associated with an existing flag */
    public placeBuildsites() {
        this.placeSingleBuildsites();
        this.placeGroupBuildsites();
    }

    /** Place new construction sites directly on the designated flag */
    private placeSingleBuildsites() {
        for (const flag of this.singleBuildFlags) {
            flag.pos.createConstructionSite(flag.name as BuildableStructureConstant);
            flag.remove();
        }
    }

    private placeGroupBuildsites() {
        for (const flag of this.groupBuildFlags) {
            // Get the structureConst of the build-site
            const buildStructure: BuildableStructureConstant = flag.name.substring(0, flag.name.length - "-group".length) as BuildableStructureConstant;
            const buildSites = this.getGroupBuildsites(flag);
            for (const futureSite of buildSites) {
                futureSite.createConstructionSite(buildStructure);
            }
            flag.remove();
        }
    }

    /** Gets the group buildsites for the provided flag */
    private getGroupBuildsites(flag: Flag) {
        let positions: ReadonlyArray<RoomPosition> = [];
        // Flag exists. Create a buildsite of the appropriate type at its position
        if (flag.name.includes("-group")) {
            // Is a grouped building point
            positions = this.getEmptyBlocksAround(flag.pos);
        } else {
            // Is a single building point
            positions = [flag.pos];
        }
        return positions;
    }

    /** Gets a reference to all of the positions adjacent to, and including the provided one */
    private getEmptyBlocksAround(position: RoomPosition): ReadonlyArray<RoomPosition> {
        // Start top left of 3x3 square around position and work up
        const originalX = position.x - 1;
        const originalY = position.y - 1;

        const currentPos = {x: originalX, y: originalY};

        const positions: RoomPosition[] = [];
        for (let i = 0; i < 3; i++) {
            // 3 Vertical
            for (let j = 0; j < 3; j++) {
                // 3 Horizontal
                const thisPos = this.room.getPositionAt(currentPos.x, currentPos.y);

                if (thisPos != null) {
                    const positionInWall = thisPos.lookFor<LOOK_TERRAIN>(LOOK_TERRAIN).includes("wall");
                    if (!positionInWall) {
                        // Position is a valid placement point for a building site.
                        positions.push(thisPos);
                    }
                }
                ++currentPos.x;
            }
            ++currentPos.y;
            // Reset x position
            currentPos.x = originalX;
        }
        return positions;
    }
}
