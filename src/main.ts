import { IMemory } from "./interfaces/memory";
import { MemoryController } from "./memory/memory-controller";
import { RoomController } from "./rooms/room-controller";

initialiseScript();

console.log(`script updated: Now running 1.2.3`);
/** The loop function called by the game once every tick. Assigns commands to everything */
export function loop(): void {
    // Clean up memory
    MemoryController.clean();

    // Assign commands via all rooms. I only have one room for now so just control that
    const myRoomNames = Object.keys(Game.rooms);

    const myRoomCount = myRoomNames.length;
    for (let i = 0; i < myRoomCount; i++) {
        RoomController.control(Game.rooms[myRoomNames[i]]);
    }
}

/** Performs any actions that need to occur only once on script reload */
function initialiseScript() {
    // Initialise Memory
    if (Memory.myMemory == null) {
        (Memory as IMemory).myMemory = {
            allyIds: [],
            roomNames: [],
        };
    }
}
