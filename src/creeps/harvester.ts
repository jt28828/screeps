import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { IMyCreep } from "../interfaces/my-creep";
import { CreepController } from "./base/creep";
import { ICreepRole } from "./creep-role";
import { RoomState } from "../models/room/room-state";
import { CreepAction } from "../models/enums/creep-action";

/**
 * Controls a Harvester creep.
 * Harvester creeps initially mine energy to fill spawns. But are replaced by Miners at later levels.
 * Harvesters then transition into transporting energy around from containers as much as possible
 */
export class HarvesterController extends CreepController implements ICreepRole {
    protected creep: IHarvesterCreep;

    constructor(creep: IHarvesterCreep, roomState: RoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    /** Orders the Harvester assigned to this controller to start working */
    public startWork(): void {
        if (this.creepShouldCollect) {
            // Creep has no energy and isn't doing anything. Start collecting energy from a source or storage
            this.startHarvesting();
        } else if (this.creep.memory.isDepositing || this.creepShouldStopCollecting) {
            // Creep has collected max energy. Deposit it
            return CreepAction.fillSpawn;
            this.depositEnergyOrTravel();
        } else if (this.creep.memory.isDepositing) {
            // Continue depositing
            return CreepAction.fillSpawn;
        } else {
            // Creep isn't storing or mining. Start mining
            return CreepAction.harvest;
            this.collectEnergy(true);
        }
    }

    /** Called when the current creep needs to switch their action to harvesting */
    private startHarvesting() {
        this.wipeTaskMemory();
        this.sayNewAction(CreepAction.harvest);
        this.collectEnergy(true);
    }

    /** Called when the current creep needs to switch their action to depositing their energy */
    private switchToDepositing() {
        this.startDepositing();
        this.depositEnergyOrTravel();
    }

    /** Take collected energy to spawns, extensions or towers */
    private startDepositing() {
        this.wipeTaskMemory();
        this.creep.memory.isDepositing = true;
        this.creep.memory.isMining = false;
        this.creep.memory.isCollecting = false;
        this.creep.say("🚚 deposit");
    }

    private depositEnergyOrTravel(): void {
        const energyStructures = this.roomState.nonFullStructures;

        const closestStructure = this.creep.pos.findClosestByPath(energyStructures);

        if (closestStructure == null) {
            return;
        }

        if (energyStructures.length > 0) {
            if (this.creep.transfer(closestStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                const didMove = this.creep.moveTo(closestStructure, {visualizePathStyle: {stroke: "#ffffff"}});
                if (didMove === ERR_NO_PATH) {
                    // Creep is stuck. Hand off energy to creeps around it
                    this.transferEnergy(this.creep);
                }
            }
        } else {
            // There are no structures around with space left for energy.
            // Attempt to store the energy in long term storage
            this.depositEnergyInStorage();
        }
    }

    /** Transfers energy to a nearby harvester creep */
    private transferEnergy(creep: IHarvesterCreep): void {
        // Find creeps within 1 space of this one
        const nearbyCreeps = creep.pos.findInRange(FIND_MY_CREEPS, 1) as IMyCreep[];
        if (nearbyCreeps != null && nearbyCreeps.length > 0) {
            const nearbyCreepCount = nearbyCreeps.length;
            for (let i = 0; i < nearbyCreepCount; i++) {
                const creepi = nearbyCreeps[i];

                // Transfer to a harvester if nearby
                if (creepi.memory.role === "harvester" && creepi.carry.energy < creepi.carryCapacity) {
                    creep.transfer(creepi, RESOURCE_ENERGY);
                }
            }
        }
    }
}
