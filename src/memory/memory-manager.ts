export class MemoryManager {
    /** Called on script restart, validates that the memory is in a correct state */
    public static initialise() {
        if (Memory.myMemory == null) {
            Memory.myMemory = {
                roomIds: [],
            };
        }
    }

    /** Cleans out any unassigned variables in memory to prevent overflow of old data */
    public static clean(): void {
        this.removeDeadCreeps();
    }

    /**
     * Loop through all the creeps in memory and forget them if
     * they have died
     */
    public static removeDeadCreeps(): void {
        if (Memory.creeps == null) {
            return;
        }

        const creepIds = Object.keys(Memory.creeps);

        for (const creepId of creepIds) {
            const thisCreep = Game.creeps[creepId];
            if (thisCreep == null) {
                // Creep is dead, delete it
                this.deleteCreep(creepId);
            }
        }
    }

    /** Perform any cleanup logic if required, then wipe the creeps from memory */
    private static deleteCreep(creepId: string): void {
        // Finally delete from game memory
        delete Memory.creeps[creepId];
    }
}
