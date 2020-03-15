export const enum CustomActionResponse {
    ok,
    /** If an action relies on something being in the room and it is not, this is the response code */
    noEntitiesPresent,
    /** Indicates the creep didn't meet requirements (Out of energy, resources etc.) */
    creepNotValid
}