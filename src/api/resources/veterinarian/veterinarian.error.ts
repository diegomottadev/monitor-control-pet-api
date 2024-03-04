

class InfoVeterinarianInUse extends Error {
    status: number;
    name: string;

    constructor(message?: string) {
      super(message || 'There is a veterinarian with the same name.');
      this.status = 409;
      this.name = 'InfoVeterinarianInUse';
    }
  }

class VeterinarianNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The veterinarian does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'VeterinarianNotExist';
    }
  }
  
  export { VeterinarianNotExist,InfoVeterinarianInUse };
  