import { ICreepCounts } from "../models/interfaces/creep-counts";

export const maxCreepCounts: ICreepCounts[] = [
    // Level 0
    {
        allRounder: 2,
        miner: 0,
        transporter: 0,
        upgrader: 0,
        builder: 0,
        claimer: 0,
        attacker: 0
    },
    // Level 1
    {
        allRounder: 0,
        miner: 1,
        transporter: 1,
        upgrader: 1,
        builder: 1,
        claimer: 0,
        attacker: 0
    }
];