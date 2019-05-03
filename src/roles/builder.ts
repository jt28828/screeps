import { IBuilderCreep } from "../interfaces/builder-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { CreepController } from "./creep";
import { ICreepRole } from "./creep-role";

export class BuilderController extends CreepController implements ICreepRole {
    protected creep: IBuilderCreep;

    constructor(creep: IBuilderCreep, roomState: ICurrentRoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    public startWork(): void {

        if (this.creep.memory.isBuilding && this.creep.carry.energy === 0) {
            this.startHarvesting();
        }

        if (!this.creep.memory.isBuilding && this.creep.carry.energy === this.creep.carryCapacity) {
            this.startBuilding();
        }

        if (this.creep.memory.isBuilding) {
            const didBuild = this.buildOrTravel();

            if (!didBuild) {
                // No building sites left. Try repairing something
                this.repairOrTravel();
            }

        } else {
            if (!this.creep.memory.isMining) {
                // Creep isn't mining yet
                const success = this.retrieveEnergyFromStorage();
                if (success) {
                    // Container was found and has energy in it. Collect from it
                    this.creep.memory.isCollecting = true;
                    return;
                }
            }
            this.creep.memory.isCollecting = false;
            this.creep.memory.isMining = true;
            this.harvestOrTravel(true);
        }
    }

    /** Start collecting energy to use for building */
    private startHarvesting() {
        this.creep.memory.isBuilding = false;
        this.creep.memory.isMining = false;
        this.creep.memory.isCollecting = false;
        this.creep.say("🔋 harvest");
    }

    /** Start using collected energy to build structures */
    private startBuilding() {
        this.stopHarvesting();
        this.creep.memory.isBuilding = true;
        this.creep.memory.isMining = false;
        this.creep.memory.isCollecting = false;
        this.creep.say("👷 build");
    }

    /** Attempts to build if within range or moves closer if not */
    private buildOrTravel(): boolean {
        const constructionSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
        if (constructionSites.length) {
            const closestSite = constructionSites[0];

            const didBuild = this.creep.build(closestSite);

            if (didBuild === ERR_NOT_IN_RANGE) {
                // Move and color with construction yellow
                this.creep.moveTo(closestSite, {visualizePathStyle: {stroke: "#FFCC00"}});
            } else if (didBuild !== OK) {
                // Failed for a different reason. Return error
                return false;
            }
        } else {
            return false;
        }
        return true;
    }

    /** Attempts to repair if within range or moves closer if not */
    private repairOrTravel(): boolean {
        const repairSites = this.roomState.structures.filter((strct) => strct.hits < strct.hitsMax);

        if (repairSites.length) {
            const closestSite = this.creep.pos.findClosestByRange(repairSites) as Structure;

            if (this.creep.pos.isNearTo(closestSite)) {
                const success = this.creep.repair(closestSite);
                return success === OK;
            } else {
                this.creep.moveTo(closestSite, {visualizePathStyle: {stroke: "#FFCC00"}});
            }
        } else {
            return false;
        }
        return true;
    }
}
