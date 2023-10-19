export class Role {
  constructor(roleData) {
    this.name = roleData.name;
    this.key = roleData.key;
    this.color = roleData.color;
    this.ability = roleData.ability;
    this.singleUseAbility = roleData.singleUseAbility;
    this.description = roleData.description;
    this.winCondition = roleData.winCondition;
    this.reminder = roleData.reminder;
    this.assigned = roleData.assigned;
    this.expansionRole = roleData.expansionRole;
    this.enabled = roleData.enabled;
    this.images = roleData.images;
    this.selectedImage = this.images[0];
  }

  static fromData(data) {
    let role = new Role(data);
    role.selectedImage = data.selectedImage; 
    return role;
  }

  assign() {
    this.assigned = this.key === ('werewolf' | 'town-resident') ? this.assigned + 1 : true;
  }

  unassign() {
    this.assigned = this.key === ('werewolf' | 'town-resident') ? this.assigned - 1 : false;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggleSelectedImage() {
    let currentIndex = this.images.indexOf(this.selectedImage);
    let nextIndex = (currentIndex + 1) % this.images.length;
    this.selectedImage = this.images[nextIndex];
  }
}