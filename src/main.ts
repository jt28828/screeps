import { IMemory } from "./interfaces/memory";
import { MemoryController } from "./memory/memory-controller";
import { RoomController } from "./rooms/room-controller";

initialiseScript();

console.log(`Script updated: Now running 1.4.0`);

// Values to be used between loops
/** The name of my current room. TODO update to include multiple rooms when I get to that point */
let myRoomName: string;

/** Counts the number of loops to only run some things occasionally. Like memory cleaning */
let loopCount = 0;

/** The loop function called by the game once every tick. Assigns commands to everything */
export function loop(): void {
    ++loopCount;

    if (loopCount === 20) {
        // Reset and run the occasional scripts
        loopCount = 0;
        everyTwentyLoopsTasks();
    }

    if (myRoomName == null) {
        // Assign commands via all rooms. I only have one room for now so just control that
        const allRoomNames = Object.keys(Game.rooms);
        myRoomName = allRoomNames[0];
    }
    RoomController.control(Game.rooms[myRoomName]);
}

/** Performs any actions that are only run every 20 gameloops */
function everyTwentyLoopsTasks() {
    // Clean up memory
    MemoryController.clean();
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
