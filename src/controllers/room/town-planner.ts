import { buildingFlags, GroupBuildingFlags, groupBuildingFlags } from "../../constants/flag-constants";

/** Handles automatic building in the provided room, where required */
export class TownPlanner {
    /** The room this controller is associated with */
    private room: Room;
    /** The flags present in the current room to be used for planning buildings */
    private readonly singleBuildFlags: ReadonlyArray<Flag>;
    private readonly groupBuildFlags: ReadonlyArray<Flag>;

    constructor(room: Room, flags: ReadonlyArray<Flag>) {
        this.room = room;
        this.singleBuildFlags = flags.filter(flag => buildingFlags.includes(flag.name as BuildableStructureConstant));

        this.groupBuildFlags = flags
            .filter(flag =>
                groupBuildingFlags.some(groupFlagOptions => (flag.name as GroupBuildingFlags).includes(groupFlagOptions))
            );
    }

    /** Place any buildsites in the room that are associated with an existing flag */
    public control() {
        this.placeSingleBuildsites();
        this.placeGroupBuildsites();
    }

    /** Place new construction sites directly on the designated flag */
    private placeSingleBuildsites() {
        for (const flag of this.singleBuildFlags) {
            if (flag.pos.lookFor(LOOK_CONSTRUCTION_SITES).length === 0) {
                // Site doesn't have a construction site on it.
                flag.pos.createConstructionSite(flag.name as BuildableStructureConstant);
                flag.remove();
            }
        }
    }

    private placeGroupBuildsites() {
        for (const flag of this.groupBuildFlags) {
            // Split the values out of the flag name
            const splitFlagName = flag.name.split("-group-");
            // Get the structureConst of the build-flag
            const buildStructure: BuildableStructureConstant = splitFlagName[0] as BuildableStructureConstant;

            // Default size is 3 if none is passed through
            let buildSize = 3;
            if (splitFlagName[1] != '' && splitFlagName[1] != null) {
                try {
                    buildSize = parseInt(splitFlagName[1]);
                } catch (e) {
                    console.error("Non-number value passed through as parameter for group build flag. Using the default value of 3");
                }
            }

            const buildSites = this.getGroupBuildsites(flag, buildSize);
            for (const futureSite of buildSites) {
                futureSite.createConstructionSite(buildStructure);
            }
            flag.remove();
        }
    }

    /** Gets the group buildsites for the provided flag */
    private getGroupBuildsites(flag: Flag, buildSize: number) {
        let positions: ReadonlyArray<RoomPosition> = [];
        // Flag exists. Create a buildsite of the appropriate type at its position
        if (flag.name.includes("-group")) {
            // Is a grouped building point
            positions = this.getEmptyBlocksAround(flag.pos, buildSize);
        } else {
            // Is a single building point
            positions = [flag.pos];
        }
        return positions;
    }

    /** Gets a reference to all of the positions adjacent to, and including the provided one */
    private getEmptyBlocksAround(position: RoomPosition, squareSize: number): ReadonlyArray<RoomPosition> {
        // Start top left of square around position and work up
        const topLeftDifference = Math.floor(squareSize / 2);
        const originalX = position.x - topLeftDifference;
        const originalY = position.y - topLeftDifference;

        const currentPos = {x: originalX, y: originalY};

        const positions: RoomPosition[] = [];
        // Cycle between boolean for checkerboard pattern
        let placeEven = true;
        for (let i = 0; i < squareSize; i++) {
            // Vertical
            for (let j = 0; j < squareSize; j++) {
                // Horizontal (Only place position in checkerboard)
                if ((placeEven && j % 2 === 0) || (!placeEven && j % 2 !== 0)) {
                    // Should add this position if available
                    const thisPos = this.room.getPositionAt(currentPos.x, currentPos.y);

                    if (thisPos != null) {
                        const positionInWall = thisPos.lookFor<LOOK_TERRAIN>(LOOK_TERRAIN).includes("wall");
                        if (!positionInWall) {
                            // Position is a valid placement point for a building site.
                            positions.push(thisPos);
                        }
                    }
                }
                ++currentPos.x;
            }
            ++currentPos.y;
            // Reset x position
            currentPos.x = originalX;
            placeEven = !placeEven;
        }
        return positions;
    }
}
