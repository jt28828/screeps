import { MemoryManager } from "./memory/memory-manager";
import { RoomController } from "./controllers/room-controller";

initialiseScript();

/** Performs any actions that need to occur only once on script reload */
function initialiseScript() {
    // Initialise Memory
    MemoryManager.initialise();
    runOccasionalTasks();
    console.log(`Script updated: Now running 2.0`);
}

/** The loop function called by the game once every tick. Assigns commands to everything */
export function loop(): void {
    if (Game.time % 15) {
        // Run the occasional scripts
        runOccasionalTasks();
    }

    // Assign commands via all rooms.
    const isFiveTick = Game.time % 15;
    for (let i = 0; i < Memory.myMemory.roomIds.length; i++) {
        const myRoomName = Memory.myMemory.roomIds[i];
        const thisController = new RoomController(Game.rooms[myRoomName]);
        thisController.controlRoom();
        if (isFiveTick) {
            thisController.runNonCriticalTasks();
        }
    }
}

/** Performs any actions that are only run every few gameloops */
function runOccasionalTasks() {
    // Cleanup memory
    MemoryManager.clean();
    // Check for new rooms and replace the current array with the new one
    Memory.myMemory.roomIds = Object.keys(Game.rooms);
}
