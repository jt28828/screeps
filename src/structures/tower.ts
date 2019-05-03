import { ICurrentRoomState } from "../interfaces/room";

/**
 * Contains logic for controlling towers to attack enemies or heal friendlies
 */
export class TowerController {
    /**
     * Commands the tower to perform an action depending on the current state of the room
     * Priority is:
     * 1. Attack Enemies
     * 2. Heal Creeps
     * 3. Heal Structures
     */
    public static command(tower: StructureTower, roomState: ICurrentRoomState): void {

        if (roomState.enemies != null && roomState.enemies.length > 0) {
            // Attack enemies
            this.attackEnemy(tower, roomState.enemies);
            return;
        }

        if (tower.energy / tower.energyCapacity >= 0.5) {
            // Only heal if the tower has more than half its energy capacity in storage
            if (roomState.damagedAllies != null && roomState.damagedAllies) {
                // Heal Creeps
                this.healCreep(tower, roomState.damagedAllies);
            } else if (roomState.damagedStructures != null && roomState.damagedStructures) {
                // Heal Structures
                this.healStructure(tower, roomState.damagedStructures);
            }
        }
        // No enemies, damage or injuries. Let the tower rest
    }

    /** Attacks the weakest enemy. Should allow multiple towers to "Gang up" on a single creep */
    private static attackEnemy(tower: StructureTower, enemies: Creep[]) {
        const weakestEnemy = enemies[0];
        tower.attack(weakestEnemy);
    }

    /** Heals the most damaged structure. Should allow multiple towers to team up on repairs */
    private static healStructure(tower: StructureTower, structures: Structure[]) {
        const mostDamaged = structures[0];
        tower.repair(mostDamaged);
    }

    /** Heals the most damaged creep. Should allow multiple towers to team up on healing */
    private static healCreep(tower: StructureTower, damagedCreeps: Creep[]) {
        const mostInjured = damagedCreeps[0];
        tower.heal(mostInjured);
    }
}
