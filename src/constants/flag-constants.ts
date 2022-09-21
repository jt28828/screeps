export type GroupBuildingFlags = "extension-group" | "road-group" | "tower-group";

export const buildingFlags: ReadonlyArray<BuildableStructureConstant> = [
    STRUCTURE_EXTENSION,
    STRUCTURE_RAMPART,
    STRUCTURE_ROAD,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
    STRUCTURE_WALL,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER,
];

export const groupBuildingFlags: ReadonlyArray<GroupBuildingFlags> = [
    "extension-group",
    "road-group",
    "tower-group",
];

export const priorityBuildFlag = "priorityBuild";
export const remoteRoomDestination = "destination";
export const createTraveller = "travel";