import { CreepController } from "./base/creep";
import { ICreepRole } from "./creep-role";
import { IClaimerCreep } from "../interfaces/claimer-creep";
import { ICurrentRoomState } from "../interfaces/room";
import { remoteBuildSiteFlag } from "../constants/flags";

export class ClaimerController extends CreepController implements ICreepRole {
    /** A reference to the creep to control */
    protected creep: IClaimerCreep;
    /** A reference to the flag for the creep to move to */
    private readonly claimFlag: Flag;

    constructor(creep: IClaimerCreep, roomState: ICurrentRoomState, flag: Flag) {
        super(creep, roomState);
        this.creep = creep;
        this.claimFlag = flag;
    }


    /** Orders the Claimer to start work */
    public startWork(): void {
        // Travel to flag or claim controller
        if (!this.creep.memory.isTravelling && !this.creep.memory.isInCorrectRoom) {
            this.startTravelling();
        } else if (!this.creep.memory.isInCorrectRoom) {
            // Check if creep has moved to newest room since last move
            if (this.isInFlagRoom()) {
                this.stopTravelling();
            } else {
                // Otherwise travel
                this.travelAcrossRooms();
            }
        } else if (this.isInFlagRoom() && !this.creep.room.controller?.my) {
            // Creep is already in correct room. Get it to continue its task
            this.claimController();
        } else if (this.isInFlagRoom() && this.creep.room.controller?.my) {
            // Creep has claimed the controller. Destroy the flag and transition into a builder to build the new spawn
            this.replaceFlag();
            Memory.myMemory.claimerPresent = false;
            this.convertToBuilder();
        } else {
            // Catchall
            console.log("Claimer creep attempted to perform unsupported behaviour");
        }

    }

    /** Replaces the claim flag with another one to indicate building is required */
    private replaceFlag() {
        this.claimFlag.remove();
        this.creep.pos.createFlag(remoteBuildSiteFlag, COLOR_YELLOW);
    }

    /** Initialises the current creep if it's just been created */
    private startTravelling(): void {
        this.creep.say("🗺 Travel");
        this.creep.memory.isTravelling = true;
        this.creep.memory.isInCorrectRoom = false;
    }

    /** Stops the creep from travelling and sets it to claim */
    private stopTravelling(): void {
        this.creep.say("🧠 Claiming");
        this.creep.memory.isTravelling = false;
        this.creep.memory.isInCorrectRoom = true;
    }

    /** Travels to the room the flag is in  */
    private travelAcrossRooms(): void {
        this.moveCreepToPos(this.claimFlag.pos);
    }

    /** Claims the controller or travels to it */
    private claimController(): void {
        const thisController = this.creep.room.controller as StructureController;
        if (this.creep.pos.isNearTo(thisController)) {
            // Claim the controller
            this.creep.say("🧠 Claiming");
            this.creep.claimController(thisController);
        } else {
            // Move towards the controller
            this.creep.say("🗺 Travel");
            this.moveCreepToPos(thisController.pos);
        }
    }

    /** Converts the claimer into a builder to build the spawn for the new room */
    private convertToBuilder() {
        // Clear memory variables that won't be used by builder
        delete this.creep.memory.isInCorrectRoom;
        delete this.creep.memory.isTravelling;

        // Convert into a builder
        this.creep.say(" Switching");
        this.creep.memory.role = "builder";
    }

    /** Checks whether the creep is currently in the same room as the flag */
    private isInFlagRoom(): boolean {
        if (this.claimFlag == null) {
            // Can't travel to what doesn't exist
            return true;
        }

        return this.creep.pos.roomName === this.claimFlag.pos.roomName;
    }
}
