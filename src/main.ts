import { MemoryController } from "./memory/memory-controller";
import { RoomController } from "./rooms/room-controller";

initialiseScript();

/** Performs any actions that need to occur only once on script reload */
function initialiseScript() {
    // Initialise Memory
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            allyUsernames: ["Smudgemuffin", "mooseyman"],
            roomNames: [],
        };
    }
    everyTwentyLoopsTasks();
    console.log(`Script updated: Now running 1.5.0`);
}

/** The loop function called by the game once every tick. Assigns commands to everything */
export function loop(): void {
    // Cleanup memory
    MemoryController.clean();

    if (Game.time % 10) {
        // Run the occasional scripts
        everyTwentyLoopsTasks();
    }

    // Assign commands via all rooms.
    for (let i = 0; i < Memory.myMemory.roomNames.length; i++) {
        const myRoomName = Memory.myMemory.roomNames[i];
        RoomController.control(Game.rooms[myRoomName]);
    }

}

/** Performs any actions that are only run every 20 gameloops */
function everyTwentyLoopsTasks() {
    // Check for new rooms and replace the current array with the new one
    Memory.myMemory.roomNames = Object.keys(Game.rooms);
}
