export class RoomStructures {
    public extensions: StructureExtension[];
    public spawns: StructureSpawn[];
    public towers: StructureTower[];
    /** The towers in the room that aren't currently full of energy */
    public nonFullTowers: StructureTower[];
    /** All of the structures together in ascending order */
    private readonly allStructures: Structure[];

    constructor(extensions: StructureExtension[], spawns: StructureSpawn[], towers: StructureTower[]) {
        this.extensions = extensions;
        this.spawns = spawns;
        this.towers = towers;
        this.nonFullTowers = towers.filter(tower => tower.energy < tower.energyCapacity);
        this.allStructures = [...extensions, ...spawns, ...towers].sort((a, b) => a.energy - b.energy);
    }

    /** Returns the structure with the least energy currently in it */
    public getEmptiest() {
        return this.allStructures[0];
    }

    /** Returns the structure with the most energy currently in it */
    public getFullest() {
        return this.allStructures[this.allStructures.length - 1];
    }
}
