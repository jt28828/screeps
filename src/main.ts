import { MemoryController } from "./memory/memory-controller";
import { RoomController } from "./rooms/room-controller";

const profiler = require('screeps-profiler');


initialiseScript();
profiler.enable();

/** Performs any actions that need to occur only once on script reload */
function initialiseScript() {
    // Initialise Memory
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            roomNames: [],
            remoteBuilders: [],
            claimerPresent: false
        };
    }
    runOccasionalTasks();
    console.log(`Script updated: Now running 1.7.2`);
}

/** The loop function called by the game once every tick. Assigns commands to everything */
export function loop(): void {
    profiler.wrap(function () {
        if (Game.time % 5) {
            // Run the occasional scripts
            runOccasionalTasks();
        }

        // Assign commands via all rooms.
        for (let i = 0; i < Memory.myMemory.roomNames.length; i++) {
            const myRoomName = Memory.myMemory.roomNames[i];
            const thisController = new RoomController(Game.rooms[myRoomName]);
            thisController.control();
        }
    });
}

/** Performs any actions that are only run every few gameloops */
function runOccasionalTasks() {
    // Cleanup memory
    MemoryController.clean();
    // Check for new rooms and replace the current array with the new one
    Memory.myMemory.roomNames = Object.keys(Game.rooms);
}
