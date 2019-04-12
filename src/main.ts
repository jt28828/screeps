import { IMemory } from "./interfaces/memory";
import { MemoryController } from "./memory/memory-controller";

console.table(`Script has been refreshed: ${Date.now()}`);

initialiseScript();

/** The loop function called by the game once every tick. Assigns commands to everything */
export function loop(): void {
    // Clean up memory
    MemoryController.clean();

    // Assign commands via all rooms


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
