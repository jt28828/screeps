module.exports=function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={i:moduleId,l:!1,exports:{}};return modules[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.l=!0,module.exports}return __webpack_require__.m=modules,__webpack_require__.c=installedModules,__webpack_require__.d=function(exports,name,getter){__webpack_require__.o(exports,name)||Object.defineProperty(exports,name,{enumerable:!0,get:getter})},__webpack_require__.r=function(exports){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(exports,"__esModule",{value:!0})},__webpack_require__.t=function(value,mode){if(1&mode&&(value=__webpack_require__(value)),8&mode)return value;if(4&mode&&"object"==typeof value&&value&&value.__esModule)return value;var ns=Object.create(null);if(__webpack_require__.r(ns),Object.defineProperty(ns,"default",{enumerable:!0,value:value}),2&mode&&"string"!=typeof value)for(var key in value)__webpack_require__.d(ns,key,function(key){return value[key]}.bind(null,key));return ns},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,"a",getter),getter},__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)},__webpack_require__.p="",__webpack_require__(__webpack_require__.s=1)}([
/*!***********************************************************!*\
  !*** ./node_modules/screeps-profiler/screeps-profiler.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(module,exports,__webpack_require__){"use strict";let usedOnStart=0,enabled=!1,depth=0;function AlreadyWrappedError(){this.name="AlreadyWrappedError",this.message="Error attempted to double wrap a function.",this.stack=(new Error).stack}function setupProfiler(){depth=0,Game.profiler={stream(duration,filter){setupMemory("stream",duration||10,filter)},email(duration,filter){setupMemory("email",duration||100,filter)},profile(duration,filter){setupMemory("profile",duration||100,filter)},background(filter){setupMemory("background",!1,filter)},restart(){if(Profiler.isProfiling()){const filter=Memory.profiler.filter;let duration=!1;Memory.profiler.disableTick&&(duration=Memory.profiler.disableTick-Memory.profiler.enabledTick+1),setupMemory(Memory.profiler.type,duration,filter)}},reset:resetMemory,output:Profiler.output},Game.rooms.sim&&(usedOnStart=0,Game.cpu.getUsed=function(){return performance.now()-usedOnStart})}function setupMemory(profileType,duration,filter){resetMemory();const disableTick=!!Number.isInteger(duration)&&Game.time+duration;Memory.profiler||(Memory.profiler={map:{},totalTime:0,enabledTick:Game.time+1,disableTick:disableTick,type:profileType,filter:filter})}function resetMemory(){Memory.profiler=null}function getFilter(){return Memory.profiler.filter}const functionBlackList=["getUsed","constructor"];function profileObjectFunctions(object,label){const objectToWrap=object.prototype?object.prototype:object;return Object.getOwnPropertyNames(objectToWrap).forEach(functionName=>{const extendedLabel=`${label}.${functionName}`;if(-1!==functionBlackList.indexOf(functionName))return;const descriptor=Object.getOwnPropertyDescriptor(objectToWrap,functionName);if(!descriptor)return;if(descriptor.get||descriptor.set){if(!descriptor.configurable)return;const profileDescriptor={};if(descriptor.get){const extendedLabelGet=`${extendedLabel}:get`;profileDescriptor.get=profileFunction(descriptor.get,extendedLabelGet)}if(descriptor.set){const extendedLabelSet=`${extendedLabel}:set`;profileDescriptor.set=profileFunction(descriptor.set,extendedLabelSet)}return void Object.defineProperty(objectToWrap,functionName,profileDescriptor)}if(!("function"==typeof descriptor.value))return;const originalFunction=objectToWrap[functionName];objectToWrap[functionName]=profileFunction(originalFunction,extendedLabel)}),objectToWrap}function profileFunction(fn,functionName){const fnName=functionName||fn.name;return fnName?function(name,originalFunction){if(originalFunction.profilerWrapped)throw new AlreadyWrappedError;function wrappedFunction(){if(Profiler.isProfiling()){const nameMatchesFilter=name===getFilter(),start=Game.cpu.getUsed();nameMatchesFilter&&depth++;const result=originalFunction.apply(this,arguments);if(depth>0||!getFilter()){const end=Game.cpu.getUsed();Profiler.record(name,end-start)}return nameMatchesFilter&&depth--,result}return originalFunction.apply(this,arguments)}return wrappedFunction.profilerWrapped=!0,wrappedFunction.toString=(()=>`// screeps-profiler wrapped function:\n${originalFunction.toString()}`),wrappedFunction}(fnName,fn):(console.log("Couldn't find a function name for - ",fn),console.log("Will not profile this function."),fn)}const Profiler={printProfile(){console.log(Profiler.output())},emailProfile(){Game.notify(Profiler.output(1e3))},output(passedOutputLengthLimit){const outputLengthLimit=passedOutputLengthLimit||1e3;if(!Memory.profiler||!Memory.profiler.enabledTick)return"Profiler not active.";const elapsedTicks=Math.min(Memory.profiler.disableTick||Game.time,Game.time)-(Memory.profiler.enabledTick+1),header="calls\t\ttime\t\tavg\t\tfunction",footer=[`Avg: ${(Memory.profiler.totalTime/elapsedTicks).toFixed(2)}`,`Total: ${Memory.profiler.totalTime.toFixed(2)}`,`Ticks: ${elapsedTicks}`].join("\t"),lines=[header];let currentLength=header.length+1+footer.length;const allLines=Profiler.lines();let done=!1;for(;!done&&allLines.length;){const line=allLines.shift();currentLength+line.length+1<outputLengthLimit?(lines.push(line),currentLength+=line.length+1):done=!0}return lines.push(footer),lines.join("\n")},lines:()=>Object.keys(Memory.profiler.map).map(functionName=>{const functionCalls=Memory.profiler.map[functionName];return{name:functionName,calls:functionCalls.calls,totalTime:functionCalls.time,averageTime:functionCalls.time/functionCalls.calls}}).sort((val1,val2)=>val2.totalTime-val1.totalTime).map(data=>[data.calls,data.totalTime.toFixed(1),data.averageTime.toFixed(3),data.name].join("\t\t")),prototypes:[{name:"Game",val:Game},{name:"Room",val:Room},{name:"Structure",val:Structure},{name:"Spawn",val:Spawn},{name:"Creep",val:Creep},{name:"RoomPosition",val:RoomPosition},{name:"Source",val:Source},{name:"Flag",val:Flag}],record(functionName,time){Memory.profiler.map[functionName]||(Memory.profiler.map[functionName]={time:0,calls:0}),Memory.profiler.map[functionName].calls++,Memory.profiler.map[functionName].time+=time},endTick(){if(Game.time>=Memory.profiler.enabledTick){const cpuUsed=Game.cpu.getUsed();Memory.profiler.totalTime+=cpuUsed,Profiler.report()}},report(){Profiler.shouldPrint()?Profiler.printProfile():Profiler.shouldEmail()&&Profiler.emailProfile()},isProfiling:()=>!(!enabled||!Memory.profiler)&&(!Memory.profiler.disableTick||Game.time<=Memory.profiler.disableTick),type:()=>Memory.profiler.type,shouldPrint(){const streaming="stream"===Profiler.type(),profiling="profile"===Profiler.type(),onEndingTick=Memory.profiler.disableTick===Game.time;return streaming||profiling&&onEndingTick},shouldEmail:()=>"email"===Profiler.type()&&Memory.profiler.disableTick===Game.time};module.exports={wrap(callback){if(enabled&&setupProfiler(),Profiler.isProfiling()){usedOnStart=Game.cpu.getUsed();const returnVal=callback();return Profiler.endTick(),returnVal}return callback()},enable(){enabled=!0,Profiler.prototypes.forEach(proto=>{profileObjectFunctions(proto.val,proto.name)})},output:Profiler.output,registerObject:profileObjectFunctions,registerFN:profileFunction,registerClass:profileObjectFunctions}},
/*!**************************************!*\
  !*** ./ts-dist/main.js + 17 modules ***!
  \**************************************/
/*! exports provided: loop */
/*! all exports used */function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__);class MemoryController{static clean(){this.forgetDeadCreeps()}static forgetDeadCreeps(){if(null==Memory.creeps)return;const allCreepNames=Object.keys(Memory.creeps),allCreepsCount=allCreepNames.length;for(let i=0;i<allCreepsCount;i++){const thisCreepName=allCreepNames[i];null==Game.creeps[thisCreepName]&&(delete Memory.creeps[thisCreepName],this.removePossibleBuilder(thisCreepName))}}static removePossibleBuilder(name){const index=Memory.myMemory.remoteBuilders.indexOf(name);-1!==index&&Memory.myMemory.remoteBuilders.splice(index,1)}}class StructureUtils{static findNonEmptyStorageStructures(structures){const containersAndStorage=[];for(let i=0;i<structures.length;i++)(structures[i].structureType===STRUCTURE_CONTAINER||structures[i].structureType===STRUCTURE_STORAGE&&structures[i].store.energy>0)&&containersAndStorage.push(structures[i]);return 0===containersAndStorage.length?null:containersAndStorage}static findNonFullStorageStructures(structures){const containersAndStorage=[];for(let i=0;i<structures.length;i++){const thisStructure=structures[i];thisStructure.structureType!==STRUCTURE_CONTAINER&&thisStructure.structureType!==STRUCTURE_STORAGE||thisStructure.store.energy<thisStructure.storeCapacity&&containersAndStorage.push(thisStructure)}return 0===containersAndStorage.length?null:containersAndStorage}}class creep_CreepController{constructor(creep,roomState){this.creep=creep,this.roomState=roomState}creepIsFull(){return this.creep.carry.energy===this.creep.carryCapacity}harvestOrTravel(){let miningZone;if(null==this.creep.memory.miningTarget){if(null==(miningZone=this.getClosestSource()))return;this.creep.memory.miningTarget=miningZone.id}else{const currentMiningTarget=Game.getObjectById(this.creep.memory.miningTarget);miningZone=null!=currentMiningTarget?currentMiningTarget:this.getClosestSource()}null!=miningZone&&(this.creep.pos.isNearTo(miningZone.pos)?this.creep.harvest(miningZone):this.moveCreepToPos(miningZone.pos))}retrieveEnergyFromStorage(){let destinationStructure=null;if(null==this.creep.memory.storageTarget){const storageStructures=StructureUtils.findNonEmptyStorageStructures(this.roomState.structures);if(null!=storageStructures){const closestStorage=this.creep.pos.findClosestByPath(storageStructures);closestStorage?(this.creep.memory.storageTarget=closestStorage.id,destinationStructure=closestStorage):(this.creep.memory.storageTarget=storageStructures[0].id,destinationStructure=storageStructures[0])}}else destinationStructure=Game.getObjectById(this.creep.memory.storageTarget);if(null==destinationStructure)return!1;if(this.creep.pos.isNearTo(destinationStructure.pos)){if(this.creep.withdraw(destinationStructure,RESOURCE_ENERGY)!==OK)return this.wipeTaskMemory(),!1}else this.moveCreepToPos(destinationStructure.pos);return!0}depositEnergyInStorage(){let success,destinationStructure=null;if(null==this.creep.memory.storageTarget){const storageStructures=StructureUtils.findNonFullStorageStructures(this.roomState.structures);if(null!=storageStructures){const closestStorage=this.creep.pos.findClosestByPath(storageStructures);closestStorage?(this.creep.memory.storageTarget=closestStorage.id,destinationStructure=closestStorage):(this.creep.memory.storageTarget=storageStructures[0].id,destinationStructure=storageStructures[0])}}else destinationStructure=Game.getObjectById(this.creep.memory.storageTarget);return null!=destinationStructure&&(success=this.creep.pos.isNearTo(destinationStructure)?this.creep.transfer(destinationStructure,RESOURCE_ENERGY):this.moveCreepToPos(destinationStructure.pos))===OK}wipeTaskMemory(){this.creep.memory.storageTarget=null,this.creep.memory.miningTarget=null,this.creep.memory.isCollecting=!1,this.creep.memory.isMining=!1}moveCreepToPos(position){const success=this.creep.moveTo(position,{visualizePathStyle:{stroke:"#ffaa00"},reusePath:10,ignoreCreeps:!1});return success!==OK&&success!==ERR_TIRED&&++this.creep.memory.stuckCounter>=2?(this.creep.say("I'm Stuck"),this.creep.memory.stuckCounter=0,this.creep.moveTo(position,{reusePath:0,ignoreCreeps:!1})):OK}moveCreepToRoomObject(roomObject){return this.moveCreepToPos(roomObject.pos)}getClosestRoomObject(objectList){return this.creep.pos.findClosestByPath(objectList)}getClosestSource(){return this.creep.pos.findClosestByPath(this.creep.room.find(FIND_SOURCES))}}const claimFlag="claimMe",priorityRepairFlag="priorityRepair",remoteBuildSiteFlag="remoteBuildSite",maxRemoteBuilderCount=4,maxCreepCounts={builder:2,harvester:2,miner:3,upgrader:2};class builder_BuilderController extends creep_CreepController{constructor(creep,roomState){super(creep,roomState),this.creep=creep}startWork(){if(this.creep.memory.isBuilding&&0===this.creep.carry.energy&&this.startHarvesting(),this.creep.memory.isBuilding||this.creep.carry.energy!==this.creep.carryCapacity||this.startBuilding(),5!==this.creep.memory.role)if(this.creep.memory.isBuilding){this.buildOrTravel()||this.repairOrTravel()}else{if(!this.creep.memory.isMining){if(this.retrieveEnergyFromStorage())return void(this.creep.memory.isCollecting=!0)}this.creep.memory.isCollecting=!1,this.creep.memory.isMining=!0,this.harvestOrTravel()}}wipeTaskMemory(){super.wipeTaskMemory(),this.creep.memory.isBuilding=!1}startBuilding(){this.wipeTaskMemory(),this.checkRemoteBuildStatus()?this.becomeRemoteBuilder():(this.creep.memory.isBuilding=!0,this.creep.memory.isMining=!1,this.creep.memory.isCollecting=!1,this.creep.say("👷 build"))}buildOrTravel(){if(!this.roomState.constructionSites.length)return!1;{const closestSite=this.getClosestRoomObject(this.roomState.constructionSites);if(null==closestSite)return!1;const didBuild=this.creep.build(closestSite);if(didBuild===ERR_NOT_IN_RANGE)this.moveCreepToRoomObject(closestSite);else if(didBuild!==OK)return!1}return!0}startHarvesting(){this.wipeTaskMemory(),this.creep.say("🎒 harvest")}becomeRemoteBuilder(){this.creep.memory.role=5,Memory.myMemory.remoteBuilders.push(this.creep.name),this.creep.say("🗺 Convert")}checkRemoteBuildStatus(){if(null!=Game.flags[remoteBuildSiteFlag]&&null!=Memory.myMemory.remoteBuilders){if(Memory.myMemory.remoteBuilders.length<maxRemoteBuilderCount&&5!==this.creep.memory.role)return!0}return!1}repairOrTravel(){const priorityFlag=Game.flags[priorityRepairFlag];let selectedSite;if(null==(selectedSite=null!=priorityFlag?priorityFlag.pos.findClosestByRange(this.roomState.damagedStructures):this.creep.pos.findClosestByRange(this.roomState.damagedStructures)))return!1;if(this.creep.pos.isNearTo(selectedSite)){return this.creep.repair(selectedSite)===OK}return this.creep.moveTo(selectedSite,{visualizePathStyle:{stroke:"#FFCC00"}}),!0}}class harvester_HarvesterController extends creep_CreepController{constructor(creep,roomState){super(creep,roomState),this.creep=creep}startWork(){0!==this.creep.carry.energy||this.creepMiningOrCollecting()?this.creepIsFull()&&this.creepMiningOrCollecting()?this.switchToDepositing():this.creep.memory.isMining?this.harvestOrTravel():this.creep.memory.isCollecting?this.retrieveEnergyFromStorage():this.creep.memory.isDepositing&&this.depositEnergyOrTravel():this.switchToHarvesting()}switchToHarvesting(){this.wipeTaskMemory(),this.retrieveEnergyFromStorage()?this.startRetrieving():(this.startMining(),this.harvestOrTravel())}switchToDepositing(){this.wipeTaskMemory(),this.startDepositing(),this.depositEnergyOrTravel()}creepMiningOrCollecting(){return this.creep.memory.isMining||this.creep.memory.isCollecting}startMining(){this.creep.memory.isMining=!0,this.creep.memory.isDepositing=!1,this.creep.memory.isCollecting=!1,this.creep.say("⛏️ harvest")}startRetrieving(){this.creep.memory.isMining=!1,this.creep.memory.isDepositing=!1,this.creep.memory.isCollecting=!0,this.creep.say("⛏️ harvest")}startDepositing(){this.wipeTaskMemory(),this.creep.memory.isDepositing=!0,this.creep.memory.isMining=!1,this.creep.memory.isCollecting=!1,this.creep.say("🚚 deposit")}depositEnergyOrTravel(){const energyStructures=this.roomState.myStructures.filter(structure=>(structure.structureType===STRUCTURE_EXTENSION||structure.structureType===STRUCTURE_SPAWN||structure.structureType===STRUCTURE_TOWER)&&structure.energy<structure.energyCapacity),closestStructure=this.creep.pos.findClosestByPath(energyStructures);if(null!=closestStructure)if(energyStructures.length>0){if(this.creep.transfer(closestStructure,RESOURCE_ENERGY)===ERR_NOT_IN_RANGE){this.creep.moveTo(closestStructure,{visualizePathStyle:{stroke:"#ffffff"}})===ERR_NO_PATH&&this.transferEnergy(this.creep)}}else this.depositEnergyInStorage()}transferEnergy(creep){const nearbyCreeps=creep.pos.findInRange(FIND_MY_CREEPS,1);if(null!=nearbyCreeps&&nearbyCreeps.length>0){const nearbyCreepCount=nearbyCreeps.length;for(let i=0;i<nearbyCreepCount;i++){const creepi=nearbyCreeps[i];"harvester"===creepi.memory.role&&creepi.carry.energy<creepi.carryCapacity&&creep.transfer(creepi,RESOURCE_ENERGY)}}}}class miner_MinerController extends creep_CreepController{constructor(creep,roomState){super(creep,roomState),this.creep=creep}startWork(){this.creep.memory.isDepositing&&0===this.creep.carry.energy&&this.startHarvesting(),this.creep.memory.isMining&&this.creep.carry.energy===this.creep.carryCapacity&&this.startDepositing(),this.creep.memory.isDepositing?this.depositEnergyInStorage():(this.creep.memory.isMining||this.startHarvesting(),this.harvestOrTravel())}startHarvesting(){this.creep.memory.isMining=!0,this.creep.memory.isDepositing=!1,this.creep.say("⛏️ harvest")}startDepositing(){this.wipeTaskMemory(),this.creep.memory.isDepositing=!0,this.creep.memory.isMining=!1,this.creep.say("📦 Storing energy")}}class upgrader_UpgraderController extends creep_CreepController{constructor(creep,roomState){super(creep,roomState),this.creep=creep}startWork(){if(this.creep.memory.isUpgrading&&0===this.creep.carry.energy&&this.startHarvesting(),this.creep.memory.isUpgrading||this.creep.carry.energy!==this.creep.carryCapacity||this.startUpgrading(),this.creep.memory.isUpgrading)this.upgradeOrTravel();else{if(!this.creep.memory.isMining){if(this.retrieveEnergyFromStorage())return void(this.creep.memory.isCollecting=!0)}this.creep.memory.isCollecting=!1,this.creep.memory.isMining=!0,this.harvestOrTravel()}}startHarvesting(){this.creep.memory.isUpgrading=!1,this.creep.memory.isCollecting=!1,this.creep.memory.isMining=!1,this.creep.say("harvesting")}startUpgrading(){this.wipeTaskMemory(),this.creep.memory.isUpgrading=!0,this.creep.memory.isCollecting=!1,this.creep.memory.isMining=!1,this.creep.say("upgrading")}upgradeOrTravel(){const structureController=this.creep.room.controller;null!=structureController&&this.creep.upgradeController(structureController)===ERR_NOT_IN_RANGE&&this.creep.moveTo(structureController,{visualizePathStyle:{stroke:"#ffffff"}})}}class CreepFactory{static generateCreep(type,room){switch(type){case 1:return this.generateUpgrader(room);case 2:return this.generateBuilder(room);case 3:return this.generateMiner(room);case 4:return this.generateClaimer();default:return this.generateHarvester(room)}}static generateClaimer(){const memory=this.generateMemory(4),name=`CLMR-${Game.time.toString()}`;return{bodyParts:[MOVE,CLAIM],name:name,spawnOptions:{memory:memory}}}static generateHarvester(room){const memory=this.generateMemory(0),name=`HRVSTR-${Game.time.toString()}`;return{bodyParts:this.generateMaxWorkerBodyParts(room),name:name,spawnOptions:{memory:memory}}}static generateUpgrader(room){const memory=this.generateMemory(1),name=`UPGRDR-${Game.time.toString()}`;return{bodyParts:this.generateMaxWorkerBodyParts(room),name:name,spawnOptions:{memory:memory}}}static generateBuilder(room){const memory=this.generateMemory(2),name=`BLDR-${Game.time.toString()}`;return{bodyParts:this.generateMaxWorkerBodyParts(room),name:name,spawnOptions:{memory:memory}}}static generateMiner(room){const memory=this.generateMemory(3),name=`MNR-${Game.time.toString()}`;return{bodyParts:this.generateMaxWorkerBodyParts(room),name:name,spawnOptions:{memory:memory}}}static generateMaxWorkerBodyParts(currentRoom){const currentEnergy=currentRoom.energyAvailable,requiredWorkParts=Math.floor(currentEnergy/100/6),requiredCarryParts=2*requiredWorkParts,requiredMoveParts=3*requiredWorkParts;if(requiredWorkParts<=1||requiredCarryParts<=1)return[WORK,CARRY,MOVE];return[...Array(requiredWorkParts).fill(WORK),...Array(requiredCarryParts).fill(CARRY),...Array(requiredMoveParts).fill(MOVE)]}static generateMemory(role){return{role:role,stuckCounter:0}}}class spawn_SpawnController{static spawn(spawner,roomState,room){this.spawnCreeps(spawner,roomState.slaves,maxCreepCounts,room)}static spawnCreeps(spawner,creeps,counts,room){let creepType=6;const upgraders=creeps.filter(x=>1===x.memory.role),harvesters=creeps.filter(x=>0===x.memory.role),builders=creeps.filter(x=>2===x.memory.role),miners=creeps.filter(x=>3===x.memory.role);if(harvesters.length<counts.harvester?creepType=0:upgraders.length<counts.upgrader?creepType=1:builders.length<counts.builder?creepType=2:miners.length<counts.miner?creepType=3:null==Game.flags.claimMe||Memory.myMemory.claimerPresent||this.spawnClaimer(spawner,room),6!==creepType){const newCreep=CreepFactory.generateCreep(creepType,room);spawner.spawnCreep(newCreep.bodyParts,newCreep.name,newCreep.spawnOptions)}}static spawnClaimer(spawner,room){const newClaimer=CreepFactory.generateCreep(4,room);spawner.spawnCreep(newClaimer.bodyParts,newClaimer.name,newClaimer.spawnOptions)===OK&&(Memory.myMemory.claimerPresent=!0)}}class TowerController{constructor(tower,roomState){this.tower=tower,this.roomState=roomState}command(){null!=this.roomState.enemies&&this.roomState.enemies.length>0?this.attackEnemy():this.tower.energy/this.tower.energyCapacity>=.5&&(null!=this.roomState.damagedAllies&&this.roomState.damagedAllies.length>1?this.healCreep():null!=this.roomState.damagedStructures&&this.roomState.damagedStructures.length>1&&this.healStructure())}attackEnemy(){const weakestEnemy=this.roomState.enemies[0];this.tower.attack(weakestEnemy)}healStructure(){const mostDamaged=this.roomState.damagedStructures[0];this.tower.repair(mostDamaged)}healCreep(){const mostInjured=this.roomState.damagedAllies[0];this.tower.heal(mostInjured)}}function isHarvester(creep){const thisCreep=creep;return 0===thisCreep.memory.role||"harvester"===thisCreep.memory.role}function isUpgrader(creep){const thisCreep=creep;return 1===thisCreep.memory.role||"upgrader"===thisCreep.memory.role}function isBuilder(creep){const thisCreep=creep;return 2===thisCreep.memory.role||"builder"===thisCreep.memory.role}function isRemoteBuilder(creep){const thisCreep=creep;return 5===thisCreep.memory.role||"remoteBuilder"===thisCreep.memory.role}function isMiner(creep){const thisCreep=creep;return 3===thisCreep.memory.role||"miner"===thisCreep.memory.role}function isClaimer(creep){const thisCreep=creep;return 4===thisCreep.memory.role||"claimer"===thisCreep.memory.role}class claimer_ClaimerController extends creep_CreepController{constructor(creep,roomState,flag){super(creep,roomState),this.creep=creep,this.claimFlag=flag}startWork(){this.creep.memory.isTravelling||this.creep.memory.isInCorrectRoom?this.creep.memory.isInCorrectRoom?this.isInFlagRoom()&&!this.creep.room.controller.my?this.claimController():this.isInFlagRoom()&&this.creep.room.controller.my?(this.replaceFlag(),Memory.myMemory.claimerPresent=!1,this.convertToBuilder()):console.log("Claimer creep attempted to perform unsupported behaviour"):this.isInFlagRoom()?this.stopTravelling():this.travelAcrossRooms():this.startTravelling()}replaceFlag(){this.claimFlag.remove(),this.creep.pos.createFlag(remoteBuildSiteFlag,COLOR_YELLOW)}startTravelling(){this.creep.say("🗺 Travel"),this.creep.memory.isTravelling=!0,this.creep.memory.isInCorrectRoom=!1}stopTravelling(){this.creep.say("🧠 Claiming"),this.creep.memory.isTravelling=!1,this.creep.memory.isInCorrectRoom=!0}travelAcrossRooms(){this.moveCreepToPos(this.claimFlag.pos)}claimController(){const thisController=this.creep.room.controller;this.creep.pos.isNearTo(thisController)?(this.creep.say("🧠 Claiming"),this.creep.claimController(thisController)):(this.creep.say("🗺 Travel"),this.moveCreepToPos(thisController.pos))}convertToBuilder(){delete this.creep.memory.isInCorrectRoom,delete this.creep.memory.isTravelling,this.creep.say(" Switching"),this.creep.memory.role="builder"}isInFlagRoom(){return null==this.claimFlag||this.creep.pos.roomName===this.claimFlag.pos.roomName}}const allyUsernames=["Smudgemuffin","mooseyman"];class remote_builder_RemoteBuilderController extends builder_BuilderController{constructor(creep,roomState){super(creep,roomState),this.remoteBuildFlag=Game.flags[remoteBuildSiteFlag]}startWork(){null==this.remoteBuildFlag&&this.convertToHarvester();const isInRoom=this.creep.pos.roomName===this.remoteBuildFlag.pos.roomName,isNextToFlag=this.creep.pos.inRangeTo(this.remoteBuildFlag.pos,1);isInRoom&&isNextToFlag?(this.convertToRegularBuilder(),this.roomState.roomHasSpawn&&this.remoteBuildFlag.remove()):(this.creep.say("🗺 Travel"),this.moveCreepToRoomObject(this.remoteBuildFlag))}convertToHarvester(){delete this.creep.memory.isBuilding,this.creep.say(" Switching"),this.creep.memory.role=0}convertToRegularBuilder(){this.creep.memory.role=2,this.wipeTaskMemory()}}class room_controller_RoomController{constructor(room){this.room=room,room.controller.my?this.roomState=this.getCurrentRoomState():this.roomState=this.getForeignRoomState()}control(){this.room.controller.my&&this.commandStructures(),this.commandCreeps()}commandStructures(){const justTowers=this.roomState.structures.filter(s=>s.structureType===STRUCTURE_TOWER),justSpawners=this.roomState.structures.filter(s=>s.structureType===STRUCTURE_SPAWN);this.commandTowers(justTowers),this.commandSpawners(justSpawners)}commandTowers(towers){if(null==towers||0===towers.length)return;const towerCount=towers.length;for(let i=0;i<towerCount;i++){new TowerController(towers[i],this.roomState).command()}}commandSpawners(spawns){if(null==spawns||0===spawns.length)return;const spawnCount=spawns.length;for(let i=0;i<spawnCount;i++)spawn_SpawnController.spawn(spawns[i],this.roomState,this.room)}getCurrentRoomState(){const slaves=this.room.find(FIND_MY_CREEPS),structures=this.room.find(FIND_STRUCTURES),myStructures=this.room.find(FIND_MY_STRUCTURES),roomHasSpawn=structures.filter(s=>s.structureType===STRUCTURE_SPAWN).length>0,constructionSites=this.room.find(FIND_CONSTRUCTION_SITES),enemies=this.room.find(FIND_HOSTILE_CREEPS).filter(creep=>-1===allyUsernames.indexOf(creep.owner.username)).sort((a,b)=>a.hits-b.hits),fillableStructures=myStructures.filter(structure=>structure.structureType===STRUCTURE_EXTENSION||structure.structureType===STRUCTURE_SPAWN||structure.structureType===STRUCTURE_TOWER&&structure.energy<structure.energyCapacity);return{constructionSites:constructionSites,damagedAllies:slaves.filter(x=>x.hits<x.hitsMax).sort((a,b)=>a.hits-b.hits),damagedStructures:structures.filter(x=>x.hits<x.hitsMax).sort((a,b)=>a.hits-b.hits),enemies:enemies,myStructures:myStructures,fillableStructures:fillableStructures,roomHasSpawn:roomHasSpawn,slaves:slaves,structures:structures}}getForeignRoomState(){const slaves=this.room.find(FIND_MY_CREEPS),structures=this.room.find(FIND_STRUCTURES),constructionSites=this.room.find(FIND_CONSTRUCTION_SITES),roomHasSpawn=structures.filter(s=>s.structureType===STRUCTURE_SPAWN).length>0;return{constructionSites:constructionSites,enemies:this.room.find(FIND_HOSTILE_CREEPS).sort((a,b)=>a.hits-b.hits),slaves:slaves,structures:structures,damagedAllies:[],damagedStructures:[],myStructures:[],fillableStructures:[],roomHasSpawn:roomHasSpawn}}commandCreeps(){const creepCount=this.roomState.slaves.length;for(let i=0;i<creepCount;i++){const thisCreep=this.roomState.slaves[i];let controller;isHarvester(thisCreep)?controller=new harvester_HarvesterController(thisCreep,this.roomState):isUpgrader(thisCreep)?controller=new upgrader_UpgraderController(thisCreep,this.roomState):isBuilder(thisCreep)?controller=new builder_BuilderController(thisCreep,this.roomState):isMiner(thisCreep)?controller=new miner_MinerController(thisCreep,this.roomState):isClaimer(thisCreep)?controller=new claimer_ClaimerController(thisCreep,this.roomState,Game.flags[claimFlag]):isRemoteBuilder(thisCreep)?controller=new remote_builder_RemoteBuilderController(thisCreep,this.roomState):(console.log("Attempted to control an unsupported creep. Falling back to Harvester"),console.log(`Name: ${thisCreep.name} Role: ${thisCreep.memory.role}`),controller=new harvester_HarvesterController(thisCreep,this.roomState)),controller.startWork()}}}__webpack_require__.d(__webpack_exports__,"loop",function(){return loop});const profiler=__webpack_require__(/*! screeps-profiler */0);function loop(){profiler.wrap(function(){Game.time%5&&runOccasionalTasks();for(let i=0;i<Memory.myMemory.roomNames.length;i++){const myRoomName=Memory.myMemory.roomNames[i];new room_controller_RoomController(Game.rooms[myRoomName]).control()}})}function runOccasionalTasks(){MemoryController.clean(),Memory.myMemory.roomNames=Object.keys(Game.rooms)}!function(){null==Memory.myMemory&&(Memory.myMemory={roomNames:[],remoteBuilders:[],claimerPresent:!1});runOccasionalTasks(),console.log("Script updated: Now running 1.7.1")}(),profiler.enable()}]);