import { IMemory } from "../interfaces/memory";

/** Used to handle global memory */
export class MemoryController {
    /** Cleans out any unassigned variables in memory to prevent overflow of old data */
    public static clean(): void {
        this.forgetWorthlessWeaklings();
    }

    /**
     * Loop through all the creeps in memory and forget them if
     * they have died because they aren't any use to me now
     */
    private static forgetWorthlessWeaklings(): void {
        const allCreepNames = Object.keys(Memory.creeps);
        const allCreepsCount = allCreepNames.length;
        for (let i = 0; i < allCreepsCount; i++) {
            if (Game.creeps[allCreepNames[i]] == null) {
                delete Memory.creeps[allCreepNames[i]];
            }
        }
    }

    /**
     * Ensures all my rooms are currently stored in memory so I can manage them individually
     * Unashamedly stolen from Ben
     */
    private static rememberWhereILive() {
        const allRoomNames = Object.keys(Memory.rooms);
        const allRoomsCount = allRoomNames.length;
        for (let i = 0; i < allRoomsCount; i++) {
            const room = Memory.rooms[allRoomNames[i]] as Room;
            if (room.controller == null) {
                // Room is empty with no controllers
                continue;
            }

            if (!room.controller.my) {
                // Room has a controller but it's not mine
                continue;
            }

            // If I got here the room must be mine. Check if in memory, if not add it
            const currentRooms = (Memory as IMemory).myMemory.roomNames;

            if (currentRooms.findIndex((r) => r === room.name) > -1) {
                // Room already in the list. Continue on
                continue;
            }

            // Room isn't in the list and is mine. Add it
            (Memory as IMemory).myMemory.roomNames.push(room.name);
        }
    }

    /**
     * Clears out old rooms from memory
     */
    private static forgetMyOldRooms() {
        const allRoomNames = Object.keys(Memory.rooms);
        const allRoomsCount = allRoomNames.length;
        for (let i = 0; i < allRoomsCount; i++) {
            const room = Memory.rooms[allRoomNames[i]] as Room;
            if (room.controller != null) {
                // Room has a controller
                continue;
            }

            // If I got here the room must be empty. Check if it used to be mine
            const currentRooms = (Memory as IMemory).myMemory.roomNames;

            const romPos = currentRooms.findIndex((r) => r === room.name);

            if (romPos < 0) {
                // Room isn't in my list. Continue on
                continue;
            }

            // Room is in my memory list but doesn't have my controller in it. Remove it
            (Memory as IMemory).myMemory.roomNames.splice(romPos, 1);
        }
    }

    /** TODO Implement remembering before forgetting */
    private static forgetDestroyedStructures(): void {
        throw new Error("I Can't forget about structures because I can't remember them");
    }
}
