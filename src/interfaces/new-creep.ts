/** Used in the creation of new creeps */
export interface INewCreep {
    bodyParts: BodyPartConstant[];
    name: string;
    spawnOptions?: SpawnOptions;
}
