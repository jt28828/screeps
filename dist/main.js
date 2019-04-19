module.exports=function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={i:moduleId,l:!1,exports:{}};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.l=!0,module.exports}return __webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.d=function(exports,name,getter){__webpack_require__.o(exports,name)||Object.defineProperty(exports,name,{enumerable:!0,get:getter})},__webpack_require__.r=function(exports){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(exports,"__esModule",{value:!0})},__webpack_require__.t=function(value,mode){if(1&mode&&(value=__webpack_require__(value)),8&mode)return value;if(4&mode&&"object"==typeof value&&value&&value.__esModule)return value;var ns=Object.create(null);if(__webpack_require__.r(ns),Object.defineProperty(ns,"default",{enumerable:!0,value:value}),2&mode&&"string"!=typeof value)for(var key in value)__webpack_require__.d(ns,key,function(key){return value[key]}.bind(null,key));return ns},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,"a",getter),getter},__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=2)}([
/*!********************************!*\
  !*** ./ts-dist/roles/creep.js ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const structure_utils_1=__webpack_require__(/*! ../utility/structure-utils */1);exports.CreepController=class{static harvestOrTravel(creep,allowLongrange=!1){let miningZone;if(null==creep.memory.miningTarget)miningZone=allowLongrange?this.getRandomSource(creep):this.getClosestSource(creep),creep.memory.miningTarget=miningZone.id;else{const currentMiningTarget=Game.getObjectById(creep.memory.miningTarget);miningZone=null!=currentMiningTarget?currentMiningTarget:this.getClosestSource(creep)}creep.harvest(miningZone)===ERR_NOT_IN_RANGE&&creep.moveTo(miningZone,{visualizePathStyle:{stroke:"#ffaa00"}})}static stopHarvesting(creep){creep.memory.miningTarget=void 0}static retrieveEnergyFromStorage(creep,myStructures){const storageStructures=structure_utils_1.StructureUtils.findNonEmptyStorageStructures(myStructures);if(null==storageStructures)return ERR_NOT_FOUND;const response=creep.withdraw(storageStructures[0],RESOURCE_ENERGY);return response===ERR_NOT_IN_RANGE?creep.moveTo(storageStructures[0],{visualizePathStyle:{stroke:"#ffffff"}}):response!==OK?ERR_NOT_ENOUGH_ENERGY:OK}static getRandomSource(creep){const zones=creep.room.find(FIND_SOURCES);return zones[Math.floor(Math.random()*zones.length)]}static getClosestSource(creep){return creep.room.find(FIND_SOURCES)[0]}}},
/*!********************************************!*\
  !*** ./ts-dist/utility/structure-utils.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});exports.StructureUtils=class{static findNonEmptyStorageStructures(structures){const found=structures.filter(structure=>structure.structureType===STRUCTURE_CONTAINER&&structure.store.energy>0);return null==found||0===found.length?null:found}static findNonFullStorageStructures(structures){const found=structures.filter(structure=>structure.structureType===STRUCTURE_CONTAINER&&structure.store.energy<structure.storeCapacity);return null==found||0===found.length?null:found}}},
/*!*************************!*\
  !*** ./ts-dist/main.js ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const memory_controller_1=__webpack_require__(/*! ./memory/memory-controller */3),room_controller_1=__webpack_require__(/*! ./rooms/room-controller */4);let myRoomName;null==Memory.myMemory&&(Memory.myMemory={allyIds:[],roomNames:[]}),console.log("Script updated: Now running 1.3.0");let loopCount=0;exports.loop=function(){if(20==++loopCount&&(loopCount=0,memory_controller_1.MemoryController.clean()),null==myRoomName){const allRoomNames=Object.keys(Game.rooms);myRoomName=allRoomNames[0]}room_controller_1.RoomController.control(Game.rooms[myRoomName])}},
/*!*********************************************!*\
  !*** ./ts-dist/memory/memory-controller.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});exports.MemoryController=class{static clean(){this.forgetWorthlessWeaklings()}static forgetWorthlessWeaklings(){if(null==Memory.creeps)return;const allCreepNames=Object.keys(Memory.creeps),allCreepsCount=allCreepNames.length;for(let i=0;i<allCreepsCount;i++)null==Game.creeps[allCreepNames[i]]&&delete Memory.creeps[allCreepNames[i]]}}},
/*!******************************************!*\
  !*** ./ts-dist/rooms/room-controller.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const builder_1=__webpack_require__(/*! ../roles/builder */5),harvester_1=__webpack_require__(/*! ../roles/harvester */6),upgrader_1=__webpack_require__(/*! ../roles/upgrader */7),spawn_1=__webpack_require__(/*! ../structures/spawn */8),tower_1=__webpack_require__(/*! ../structures/tower */11),creep_utils_1=__webpack_require__(/*! ../utility/creep-utils */12);exports.RoomController=class{static control(room){const roomState=this.getCurrentRoomState(room);this.commandCreeps(roomState),this.commandStructures(roomState)}static getCurrentRoomState(room){const slaves=room.find(FIND_MY_CREEPS),structures=room.find(FIND_STRUCTURES),myStructures=room.find(FIND_MY_STRUCTURES),enemies=room.find(FIND_HOSTILE_CREEPS);return{damagedAllies:slaves.filter(x=>x.hits<x.hitsMax),damagedStructures:structures.filter(x=>x.hits<x.hitsMax),enemies:enemies,myStructures:myStructures,roomLevel:this.calculateRoomLevel(room,myStructures),slaves:slaves,structures:structures}}static calculateRoomLevel(room,structures){const controllerLvl=room.controller.level,extensionCount=structures.filter(struct=>struct.structureType===STRUCTURE_EXTENSION).length;return 2===controllerLvl&&extensionCount>1?2:1}static commandCreeps(state){const allyCreeps=state.slaves,creepCount=allyCreeps.length;for(let i=0;i<creepCount;i++){const thisCreep=allyCreeps[i];creep_utils_1.isHarvester(thisCreep)&&harvester_1.HarvesterController.work(thisCreep),creep_utils_1.isUpgrader(thisCreep)&&upgrader_1.UpgraderController.work(thisCreep,state.structures),creep_utils_1.isBuilder(thisCreep)&&builder_1.BuilderController.work(thisCreep,state)}}static commandStructures(roomState){const justTowers=roomState.structures.filter(s=>s.structureType===STRUCTURE_TOWER),justSpawners=roomState.structures.filter(s=>s.structureType===STRUCTURE_SPAWN);this.commandTowers(roomState,justTowers),this.commandSpawners(roomState,justSpawners)}static commandTowers(state,towers){if(null==towers||0===towers.length)return;const towerCount=towers.length;for(let i=0;i<towerCount;i++)tower_1.TowerController.command(towers[i],state)}static commandSpawners(state,spawns){if(null==spawns||0===spawns.length)return;const spawnCount=spawns.length;for(let i=0;i<spawnCount;i++)spawn_1.SpawnController.spawn(spawns[i],state)}}},
/*!**********************************!*\
  !*** ./ts-dist/roles/builder.js ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const creep_1=__webpack_require__(/*! ./creep */0);exports.BuilderController=class extends creep_1.CreepController{static work(creep,roomState){if(creep.memory.isBuilding&&0===creep.carry.energy&&this.startHarvesting(creep),creep.memory.isBuilding||creep.carry.energy!==creep.carryCapacity||this.startBuilding(creep),creep.memory.isBuilding)this.buildOrTravel(creep)||this.repairOrTravel(creep,roomState.myStructures);else{if(!creep.memory.isMining){const attempt=this.retrieveEnergyFromStorage(creep,roomState.structures);if(attempt!==ERR_NOT_FOUND&&attempt!==ERR_NOT_ENOUGH_ENERGY)return void(creep.memory.isCollecting=!0)}creep.memory.isCollecting=!1,creep.memory.isMining=!0,this.harvestOrTravel(creep,!0)}}static retreat(){throw new Error("Not Implemented")}static startHarvesting(creep){creep.memory.isBuilding=!1,creep.memory.isMining=!1,creep.memory.isCollecting=!1,creep.say("⛏️ harvest")}static startBuilding(creep){this.stopHarvesting(creep),creep.memory.isBuilding=!0,creep.memory.isMining=!1,creep.memory.isCollecting=!1,creep.say("👷 build")}static buildOrTravel(creep){const constructionSites=creep.room.find(FIND_CONSTRUCTION_SITES);if(!constructionSites.length)return!1;{const closestSite=constructionSites[0];creep.build(closestSite)===ERR_NOT_IN_RANGE&&creep.moveTo(closestSite,{visualizePathStyle:{stroke:"#FFCC00"}})}return!0}static repairOrTravel(creep,myStructures){const repairSites=myStructures.filter(strct=>strct.hits<strct.hitsMax);if(!repairSites.length)return!1;{const closestSite=repairSites[0];creep.repair(closestSite)===ERR_NOT_IN_RANGE&&creep.moveTo(closestSite,{visualizePathStyle:{stroke:"#FFCC00"}})}return!0}}},
/*!************************************!*\
  !*** ./ts-dist/roles/harvester.js ***!
  \************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const structure_utils_1=__webpack_require__(/*! ../utility/structure-utils */1),creep_1=__webpack_require__(/*! ./creep */0);exports.HarvesterController=class extends creep_1.CreepController{static work(creep){creep.carry.energy<creep.carryCapacity?(creep.memory.isMining||this.startHarvesting(creep),this.harvestOrTravel(creep)):(creep.memory.isMining&&this.startDepositing(creep),this.depositEnergyOrTravel(creep))}static startHarvesting(creep){creep.memory.isMining=!0,creep.say("⛏️ harvest")}static startDepositing(creep){creep.memory.isMining=!1,this.stopHarvesting(creep),creep.say("🚚 deposit")}static depositEnergyOrTravel(creep){const myStructures=creep.room.find(FIND_STRUCTURES),energyStructures=myStructures.filter(structure=>(structure.structureType===STRUCTURE_EXTENSION||structure.structureType===STRUCTURE_SPAWN||structure.structureType===STRUCTURE_TOWER)&&structure.energy<structure.energyCapacity);energyStructures.length>0?creep.transfer(energyStructures[0],RESOURCE_ENERGY)===ERR_NOT_IN_RANGE&&creep.moveTo(energyStructures[0],{visualizePathStyle:{stroke:"#ffffff"}})===ERR_NO_PATH&&this.transferEnergy(creep):this.depositEnergyInStorage(creep,myStructures)!==OK&&this.gatherAtFlag(creep)}static depositEnergyInStorage(creep,myStructures){const storageStructures=structure_utils_1.StructureUtils.findNonFullStorageStructures(myStructures);return null==storageStructures?ERR_NOT_FOUND:creep.transfer(storageStructures[0],RESOURCE_ENERGY)===ERR_NOT_IN_RANGE?creep.moveTo(storageStructures[0],{visualizePathStyle:{stroke:"#ffffff"}}):OK}static gatherAtFlag(creep){const gatherFlag=Game.flags.harvesterIdle;creep.moveTo(gatherFlag)}static transferEnergy(creep){const nearbyCreeps=creep.pos.findInRange(FIND_MY_CREEPS,1);if(null!=nearbyCreeps&&nearbyCreeps.length>0){const nearbyCreepCount=nearbyCreeps.length;for(let i=0;i<nearbyCreepCount;i++){const creepi=nearbyCreeps[i];"harvester"===creepi.memory.role&&creepi.carry.energy<creepi.carryCapacity&&creep.transfer(creepi,RESOURCE_ENERGY)}}}}},
/*!***********************************!*\
  !*** ./ts-dist/roles/upgrader.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const creep_1=__webpack_require__(/*! ./creep */0);exports.UpgraderController=class extends creep_1.CreepController{static work(creep,roomStructures){if(creep.memory.isUpgrading&&0===creep.carry.energy&&this.startHarvesting(creep),creep.memory.isUpgrading||creep.carry.energy!==creep.carryCapacity||this.startUpgrading(creep),creep.memory.isUpgrading)this.upgradeOrTravel(creep);else{if(!creep.memory.isMining){const attempt=this.retrieveEnergyFromStorage(creep,roomStructures);if(attempt!==ERR_NOT_FOUND&&attempt!==ERR_NOT_ENOUGH_ENERGY)return void(creep.memory.isCollecting=!0)}creep.memory.isCollecting=!1,creep.memory.isMining=!0,this.harvestOrTravel(creep,!0)}}static retreat(){throw new Error("Not Implemented")}static startHarvesting(creep){creep.memory.isUpgrading=!1,creep.memory.isCollecting=!1,creep.memory.isMining=!1,creep.say("harvesting")}static startUpgrading(creep){creep.memory.isUpgrading=!0,creep.memory.isCollecting=!1,creep.memory.isMining=!1,this.stopHarvesting(creep),creep.say("upgrading")}static upgradeOrTravel(creep){const structureController=creep.room.controller;null!=structureController&&creep.upgradeController(structureController)===ERR_NOT_IN_RANGE&&creep.moveTo(structureController,{visualizePathStyle:{stroke:"#ffffff"}})}}},
/*!*************************************!*\
  !*** ./ts-dist/structures/spawn.js ***!
  \*************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const creep_counts_1=__webpack_require__(/*! ../constants/creep-counts */9),creep_factory_1=__webpack_require__(/*! ../factories/creep-factory */10);exports.SpawnController=class{static spawn(spawner,roomState){switch(roomState.roomLevel){case 1:this.spawnCreeps(spawner,roomState.slaves,creep_counts_1.level1CreepCounts,1);break;case 2:this.spawnCreeps(spawner,roomState.slaves,creep_counts_1.level2CreepCounts,2);break;default:this.spawnCreeps(spawner,roomState.slaves,creep_counts_1.level1CreepCounts,1)}}static spawnCreeps(spawner,creeps,counts,level){let newCreep=null,response=0,current=1;const upgraders=creeps.filter(x=>"upgrader"===x.memory.role),harvesters=creeps.filter(x=>"harvester"===x.memory.role),builders=creeps.filter(x=>"builder"===x.memory.role);harvesters.length<counts.harvester?(current=counts.harvester/harvesters.length,newCreep=creep_factory_1.CreepFactory.generateHarvester(level),response=spawner.spawnCreep(newCreep.bodyParts,newCreep.name,newCreep.spawnOptions)):upgraders.length<counts.upgrader?(current=counts.upgrader-upgraders.length,newCreep=creep_factory_1.CreepFactory.generateUpgrader(level),response=spawner.spawnCreep(newCreep.bodyParts,newCreep.name,newCreep.spawnOptions)):builders.length<counts.builder&&(current=counts.builder-builders.length,newCreep=creep_factory_1.CreepFactory.generateBuilder(level),response=spawner.spawnCreep(newCreep.bodyParts,newCreep.name,newCreep.spawnOptions)),null!=newCreep&&response===ERR_NOT_ENOUGH_ENERGY&&level>1&&current<=.5&&this.spawnCreeps(spawner,creeps,counts,--level)}}},
/*!*******************************************!*\
  !*** ./ts-dist/constants/creep-counts.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.level1CreepCounts={builder:3,harvester:3,upgrader:2},exports.level2CreepCounts={builder:5,harvester:3,upgrader:4}},
/*!********************************************!*\
  !*** ./ts-dist/factories/creep-factory.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});exports.CreepFactory=class{static generateHarvester(level=1){switch(level){case 1:return this.generateLevel1Harvester();case 2:return this.generateLevel2Harvester();default:return this.generateLevel1Harvester()}}static generateBuilder(level){switch(level){case 1:return this.generateLevel1Builder();case 2:return this.generateLevel2Builder();default:return this.generateLevel1Builder()}}static generateUpgrader(level){switch(level){case 1:return this.generateLevel1Upgrader();case 2:return this.generateLevel2Upgrader();default:return this.generateLevel1Upgrader()}}static generateLevel1Harvester(){const name=`Harvester${Date.now()}`;return{bodyParts:[WORK,MOVE,CARRY,CARRY],name:name,spawnOptions:{memory:{role:"harvester",level:1}}}}static generateLevel2Harvester(){const name=`HarvesterV2${Date.now()}`;return{bodyParts:[WORK,WORK,MOVE,MOVE,CARRY,CARRY],name:name,spawnOptions:{memory:{role:"harvester",level:2}}}}static generateLevel1Upgrader(){const name=`Upgrader${Date.now()}`;return{bodyParts:[WORK,MOVE,CARRY,CARRY],name:name,spawnOptions:{memory:{role:"upgrader",level:1}}}}static generateLevel2Upgrader(){const name=`UpgraderV2${Date.now()}`;return{bodyParts:[WORK,WORK,MOVE,MOVE,CARRY,CARRY],name:name,spawnOptions:{memory:{role:"upgrader",level:2}}}}static generateLevel1Builder(){const name=`Builder${Date.now()}`;return{bodyParts:[WORK,MOVE,CARRY,CARRY],name:name,spawnOptions:{memory:{role:"builder",level:1}}}}static generateLevel2Builder(){const name=`Builder${Date.now()}`;return{bodyParts:[WORK,WORK,MOVE,MOVE,CARRY,CARRY],name:name,spawnOptions:{memory:{role:"builder",level:2}}}}}},
/*!*************************************!*\
  !*** ./ts-dist/structures/tower.js ***!
  \*************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});exports.TowerController=class{static command(tower,roomState){null!=roomState.enemies&&roomState.enemies.length>0?this.attackEnemy(tower,roomState.enemies):null!=roomState.damagedStructures&&roomState.damagedStructures?this.healStructure(tower,roomState.damagedStructures):null!=roomState.damagedAllies&&roomState.damagedAllies&&this.healCreep(tower,roomState.damagedAllies)}static attackEnemy(tower,enemies){const weakestEnemy=enemies.sort((a,b)=>b.hits-a.hits)[0];tower.attack(weakestEnemy)}static healStructure(tower,structures){const mostDamaged=structures.sort((a,b)=>b.hits-a.hits)[0];tower.repair(mostDamaged)}static healCreep(tower,damagedCreeps){const mostInjured=damagedCreeps.sort((a,b)=>b.hits-a.hits)[0];tower.heal(mostInjured)}}},
/*!****************************************!*\
  !*** ./ts-dist/utility/creep-utils.js ***!
  \****************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.isHarvester=function(creep){return"harvester"===creep.memory.role},exports.isUpgrader=function(creep){return"upgrader"===creep.memory.role},exports.isBuilder=function(creep){return"builder"===creep.memory.role}}]);