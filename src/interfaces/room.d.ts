import { IMyCreep } from "./my-creep";

/** Contains information about the current room */
export interface ICurrentRoomState {
    slaves: IMyCreep[];
    structures: AnyStructure[];
    myStructures: AnyOwnedStructure[];
    /** Structures that are not yet full and can be filled with energy */
    fillableStructures: AnyOwnedStructure[];
    damagedAllies: Creep[];
    damagedStructures: Structure[];
    enemies: Creep[];
    roomLevel: number;
}
