import { IMyCreep } from "./interfaces/creeps/my-creep";
import { BuilderFunctions } from "./roles/builder";
import { HarvesterFunctions } from "./roles/harvester";
import { UpgraderFunctions } from "./roles/upgrader";
import { isBuilder, isHarvester, isUpgrader } from "./utility/creep-utils";

export function loop() {
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

    const allCreepNames = Object.keys(Game.creeps);

    const allCreepCount = allCreepNames.length;
    for (let i = 0; i < allCreepCount; i++) {
        const thisName = allCreepNames[i];
        const creep = Game.creeps[thisName] as IMyCreep;
        console.log("Assigning creep: " + thisName);

        if (isHarvester(creep)) {
            HarvesterFunctions.work(creep);
        }
        if (isUpgrader(creep)) {
            UpgraderFunctions.work(creep);
        }
        if (isBuilder(creep)) {
            BuilderFunctions.work(creep);
        }
    }
}
