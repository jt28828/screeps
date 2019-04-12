import { IMyCreep } from "../interfaces/my-creep";

export class RoomController {
    /**
     * Commands all of the creeps / structures in a room to do a task.
     * Runs once every loop
     */
    public control(room: Room) {

    }

    private assignCreeps() {
        const allCreepNames = Object.keys(Game.creeps);
        const allCreepCount = allCreepNames.length;
        for (let i = 0; i < allCreepCount; i++) {
            const thisName = allCreepNames[i];
            const creep = Game.creeps[thisName] as IMyCreep;

            if (isHarvester(creep)) {
                HarvesterController.work(creep);
            }
            if (isUpgrader(creep)) {
                UpgraderController.work(creep);
            }
            if (isBuilder(creep)) {
                BuilderController.work(creep);
            }
        }
    }

    private assignTowers() {
        const tower = Game.
        const tower = Game.getObjectById("627105d4913503fcff5f1fd4") as StructureTower;
        if (tower) {
            const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax,
            });
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
    }
}