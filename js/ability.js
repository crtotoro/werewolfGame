import { Ability } from './js/ability.js'

export class Ability {
  constructor(abilityData) {
    this.roleKey = abilityData.roleKey;
    this.type = abilityData.type;
    this.description = abilityData.description;
    this.when = abilityData.when;
    this.recurring = abilityData.recurring;
    this.limitations = abilityData.limitations;
    this.used = abilityData.used;
  }

}