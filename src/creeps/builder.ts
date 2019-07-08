import { IBuilderCreep } from "../interfaces/builder-creep";
import { CreepController } from "./base/creep";
import { ICreepRole } from "./creep-role";
import { priorityRepairFlag, remoteBuildSiteFlag } from "../constants/flags";
import { maxRemoteBuilderCount } from "../constants/creep-counts";
import { MyCreepRoles } from "../types/roles";
import { RoomState } from "../models/room/room-state";

export class BuilderController extends CreepController implements ICreepRole {
    protected creep: IBuilderCreep;

    constructor(creep: IBuilderCreep, roomState: RoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    public startWork(): void {
        if (this.creep.memory.isBuilding && this.creep.carry.energy === 0) {
            // Creep is now empty. Collect energy
            this.startHarvesting();
        }

        if (!this.creep.memory.isBuilding && this.creep.carry.energy === this.creep.carryCapacity) {
            // Creep is full of energy. Start building
            this.startBuilding();
        }

        if (this.creep.memory.role === MyCreepRoles.remoteBuilder) {
            // Creep has switched creeps. Do nothing for this turn
            return;
        }

        if (this.creep.memory.isBuilding) {
            const didBuild = this.buildOrTravel();

            if (!didBuild) {
                // No building sites left. Try repairing something
                this.repairOrTravel();
            }

        } else {
            if (!this.creep.memory.isMining) {
                // Creep isn't mining yet. Get it to collect energy
                this.collectEnergy(true);
            }
        }
    }

    protected wipeTaskMemory() {
        super.wipeTaskMemory();
        this.creep.memory.isBuilding = false;
    }

    /** Start using collected energy to build structures */
    protected startBuilding() {
        this.wipeTaskMemory();

        // Check if this creep needs to start building in another room instead
        const needsToBeRemote = this.checkRemoteBuildStatus();

        if (needsToBeRemote) {
            // Instead of building, become remote
            this.becomeRemoteBuilder();
            return;
        }

        this.creep.memory.isBuilding = true;
        this.creep.memory.isMining = false;
        this.creep.memory.isCollecting = false;
        this.creep.say("👷 build");
    }

    /** Attempts to build if within range or moves closer if not */
    protected buildOrTravel(): boolean {
        const constructionSites = this.roomState.constructionSites;
        if (constructionSites.length) {
            const closestSite = this.getClosestItem(this.roomState.constructionSites);

            if (closestSite == null) {
                // There are no construction sites to build at
                return false;
            }

            const didBuild = this.creep.build(closestSite);
            if (didBuild === ERR_NOT_IN_RANGE) {
                // Move and color with construction yellow
                this.moveCreepToRoomObject(closestSite);
            } else if (didBuild !== OK) {
                // Failed for a different reason. Return error
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    /** Start collecting energy to use for building */
    private startHarvesting() {
        this.wipeTaskMemory();
        this.creep.say("🎒 harvest");
    }

    /** Converts this builder into a remote builder to be able to move to another room */
    private becomeRemoteBuilder() {
        // Set this creep into memory to become a remote builder next tick
        this.creep.memory.role = MyCreepRoles.remoteBuilder;
        Memory.myMemory.remoteBuilders.push(this.creep.name);
        this.creep.say("🗺 Convert");
    }

    /** Checks to see if this builder needs to become a remote builder or not */
    private checkRemoteBuildStatus(): boolean {
        const remoteBuildFlag = Game.flags[remoteBuildSiteFlag];

        if (remoteBuildFlag != null && Memory.myMemory.remoteBuilders != null) {
            const existingRemoteCount = Memory.myMemory.remoteBuilders.length;
            // Become a remote builder if required
            if (existingRemoteCount < maxRemoteBuilderCount && this.creep.memory.role !== MyCreepRoles.remoteBuilder) {
                return true;
            }
        }
        return false;
    }

    /** Attempts to repair if within range or moves closer if not */
    private repairOrTravel(): boolean {
        const priorityFlag = Game.flags[priorityRepairFlag];
        let selectedSite: Structure;
        if (priorityFlag != null) {
            // Repair Priority building first
            selectedSite = priorityFlag.pos.findClosestByRange(this.roomState.damagedStructures) as Structure;
        } else {
            // Repair the closest building instead
            selectedSite = this.creep.pos.findClosestByRange(this.roomState.damagedStructures) as Structure;
        }

        if (selectedSite != null) {
            if (this.creep.pos.isNearTo(selectedSite)) {
                const success = this.creep.repair(selectedSite);
                return success === OK;
            } else {
                this.creep.moveTo(selectedSite, {visualizePathStyle: {stroke: "#FFCC00"}});
            }
        } else {
            return false;
        }
        return true;
    }
}
