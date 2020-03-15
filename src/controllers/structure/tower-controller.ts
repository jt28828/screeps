import { RoomMemoryManager } from "../../memory/room-memory-manager";

export class TowerController {
    private _tower: StructureTower;
    private _roomState: RoomMemoryManager;

    constructor(tower: StructureTower, roomState: RoomMemoryManager) {
        this._tower = tower;
        this._roomState = roomState;
    }

    /**
     * Commands the tower to perform an action depending on the current state of the room
     * Priority is:
     * 1. Attack Enemies
     * 2. Heal Creeps
     * 3. Heal Structures
     */
    public control(): void {
        if (this._roomState.enemies != null && this._roomState.enemies.length > 0) {
            // Attack enemies
            this.attackEnemy();
            return;
        }

        const energyPercentage = (this._tower.store.energy / this._tower.store.getCapacity(RESOURCE_ENERGY));

        if (energyPercentage >= 0.5 && this._roomState.damagedStructures.length > 0) {
            // Only heal if the tower has more than half its energy capacity in storage
            this.healStructure();
        }
        // No enemies, damage or injuries. Let the tower rest
    }

    /** Attacks the weakest enemy. Should allow multiple towers to "Gang up" on a single creep */
    private attackEnemy() {
        const weakestEnemy = this._roomState.enemies[0];
        this._tower.attack(weakestEnemy);
    }

    /** Heals the most damaged structure. Should allow multiple towers to team up on repairs */
    private healStructure() {
        const mostDamaged = this._roomState.damagedStructures[0];
        this._tower.repair(mostDamaged);
    }
}