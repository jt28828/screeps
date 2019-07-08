/**
 * Contains logic for controlling towers to attack enemies or heal friendlies
 */
import { RoomState } from "../models/room/room-state";

export class TowerController {
    private tower: StructureTower;
    private roomState: RoomState;

    constructor(tower: StructureTower, roomState: RoomState) {
        this.tower = tower;
        this.roomState = roomState;
    }

    /**
     * Commands the tower to perform an action depending on the current state of the room
     * Priority is:
     * 1. Attack Enemies
     * 2. Heal Creeps
     * 3. Heal Structures
     */
    public command(): void {
        if (this.roomState.enemies != null && this.roomState.enemies.length > 0) {
            // Attack enemies
            this.attackEnemy();
            return;
        }

        if (this.tower.energy / this.tower.energyCapacity >= 0.5) {
            // Only heal if the tower has more than half its energy capacity in storage
            if (this.roomState.damagedStructures != null && this.roomState.damagedStructures.length > 1) {
                // Heal Structures
                this.healStructure();
            }
        }
        // No enemies, damage or injuries. Let the tower rest
    }

    /** Attacks the weakest enemy. Should allow multiple towers to "Gang up" on a single creep */
    private attackEnemy() {
        const weakestEnemy = this.roomState.enemies[0];
        this.tower.attack(weakestEnemy);
    }

    /** Heals the most damaged structure. Should allow multiple towers to team up on repairs */
    private healStructure() {
        const mostDamaged = this.roomState.damagedStructures[0];
        this.tower.repair(mostDamaged);
    }
}
