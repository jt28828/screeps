import { IMyCreep } from "./my-creep";

/** Contains information about the current room */
export interface ICurrentRoomState {
    slaves: IMyCreep[];
    structures: Structure[];
    damagedAllies: Creep[];
    damagedStructures: Structure[];
    enemies: Creep[];
}
