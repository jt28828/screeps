import { IHarvesterCreep } from "../interfaces/harvester-creep";
import { IMyCreep } from "../interfaces/my-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { CreepController } from "./creep";
import { ICreepRole } from "./creep-role";

/**
 * Controls a Harvester creep.
 * Harvester creeps initially mine energy to fill spawns. But are replaced by Miners at later levels.
 * Harvesters then transition into transporting energy around from containers as much as possible
 */
export class HarvesterController extends CreepController implements ICreepRole {
    protected creep: IHarvesterCreep;

    constructor(creep: IHarvesterCreep, roomState: ICurrentRoomState) {
        super(creep, roomState);
        this.creep = creep;
    }

    /** Orders the Harvester assigned to this controller to start working */
    public startWork(): void {
        if (this.creep.carry.energy === 0 && !this.creepMiningOrCollecting()) {
            // Creep has no energy and isn't doing anything. Start collecting energy from a source or storage
            this.switchToHarvesting();
        } else if (this.creepIsFull() && this.creepMiningOrCollecting()) {
            // Creep has collected max energy. Deposit it
            this.switchToDepositing();
        } else if (this.creep.memory.isMining) {
            // Continue Mining
            this.harvestOrTravel();
        } else if (this.creep.memory.isCollecting) {
            // Must be collecting from storage or container
            this.retrieveEnergyFromStorage();
        } else if (this.creep.memory.isDepositing) {
            // Continue depositing
            this.depositEnergyOrTravel();
        } else {
            // Temporary catch all until new function has been properly tested
            console.log(`A creep is neither harvesting or not harvesting state`);
        }
    }

    /** Called when the current creep needs to switch their action to harvesting */
    private switchToHarvesting() {
        const success = this.retrieveEnergyFromStorage();
        if (success) {
            // Started retrieving from storage. Save collection state
            this.startRetrieving();
        } else {
            // Retrieving failed. Try mining instead. Close range only
            this.startMining();
            this.harvestOrTravel();
        }
    }

    /** Called when the current creep needs to switch their action to depositing their energy */
    private switchToDepositing() {
        this.startDepositing();
        this.depositEnergyOrTravel();
    }

    /** Returns whether or not the currently controlled creep is mining or collecting */
    private creepMiningOrCollecting(): boolean {
        return this.creep.memory.isMining || this.creep.memory.isCollecting;
    }

    /** Start mining energy to use for in spawns, extensions and towers */
    private startMining() {
        this.creep.memory.isMining = true;
        this.creep.memory.isDepositing = false;
        this.creep.memory.isCollecting = false;
        this.creep.say("⛏️ harvest");
    }

    /** Start retrieving energy from storage to use in spawns, extensions and towers */
    private startRetrieving() {
        this.creep.memory.isMining = false;
        this.creep.memory.isDepositing = false;
        this.creep.memory.isCollecting = true;
        this.creep.say("⛏️ harvest");
    }

    /** Take collected energy to spawns, extensions or towers */
    private startDepositing() {
        this.creep.memory.isDepositing = true;
        this.creep.memory.isMining = false;
        this.creep.memory.isCollecting = false;
        this.stopHarvesting();
        this.creep.say("🚚 deposit");
    }

    private depositEnergyOrTravel(): void {
        const energyStructures = this.roomState.myStructures.filter((structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_TOWER) &&
                structure.energy < structure.energyCapacity;
        });

        if (energyStructures.length > 0) {
            if (this.creep.transfer(energyStructures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                const didMove = this.creep.moveTo(energyStructures[0], {visualizePathStyle: {stroke: "#ffffff"}});
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
