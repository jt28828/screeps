
export interface IMemory extends Memory {
    myMemory: IMyMemory;
}

export interface IMyMemory {
    roomNames: string[];
    allyIds: string[];
}
