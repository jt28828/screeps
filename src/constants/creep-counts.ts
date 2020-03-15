import { ICreepCounts } from "../models/interfaces/creep-counts";
import { RoomLevels } from "../enums/room-levels";

type creepCountType = { [Level in RoomLevels]: ICreepCounts };

export const maxCreepCounts: creepCountType = {
    // Level 0
    [RoomLevels.starter]: {
        allRounder: 2,
        miner: 0,
        transporter: 0,
        upgrader: 0,
        builder: 0,
        claimer: 0,
        attacker: 0
    },
    // Level 1
    [RoomLevels.hasEnergy]: {
        allRounder: 0,
        miner: 1,
        transporter: 1,
        upgrader: 1,
        builder: 1,
        claimer: 0,
        attacker: 0
    },
    // Level 2
    [RoomLevels.hasEnergyAndMultipleSources]: {
        allRounder: 0,
        miner: 2,
        transporter: 2,
        upgrader: 1,
        builder: 1,
        claimer: 0,
        attacker: 0
    }
};