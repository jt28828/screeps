/** Contains information about the sources, and later on materials that are in the room */
export interface IRoomResources {
    /** A list of all the sources that are present in the room */
    sources: Source[];
    /** Energy that has been dropped on the ground. Usually by a dead creep */
    droppedEnergy: Resource[];
}
