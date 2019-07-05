interface MyMemory {
    roomNames: string[],
    remoteBuilders: string[],
    claimerPresent: boolean,
}

interface Memory {
    myMemory: MyMemory
}

interface CreepMemory {
    /** If this creep is collecting or taking to a deposit. The deposit they should collect or store in from until full */
    storageTarget?: string | null;
    /** If this creep is mining. The source they should mine from until full */
    miningTarget?: string | null;
    /** Whether or not the creep is currently collecting energy from a container */
    isCollecting?: boolean | null;
    /** Whether or not the creep is currently collecting energy from a source */
    isMining?: boolean;
    /** How long this creep has been stuck in movement. Allows re-pathing if stuck */
    stuckCounter: number;
}

interface FlagMemory {
    [name: string]: any
}

interface SpawnMemory {
    [name: string]: any
}


interface RoomMemory {
    // Updates only once every 10 tick
    isMyRoom: boolean;
    roomIsSigned: boolean;
    damagedStructureIds: string[];
    enemyIds: string[];
    structureIds: string[];
    myStructureIds: string[];
    constructionSiteIds: string[];
    droppedEnergyIds: string[];
    sourceIds: string[];
}
