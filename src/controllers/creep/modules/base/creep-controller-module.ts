import { CreepController } from "../../base/creep-controller";

/** Modules are used to add logic to creep controllers, allowing mixing and matching of abilities to create new creep types */
export class CreepControllerModule<TCreepType extends Creep = Creep> {
    protected _creep: Creep;
    protected _controller: CreepController<TCreepType>;

    constructor(creep: Creep, controller: CreepController<TCreepType>) {
        this._creep = creep;
        this._controller = controller;
    }
}