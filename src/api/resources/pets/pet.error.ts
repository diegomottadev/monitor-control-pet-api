

  class PetNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The pet does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'PetNotExist';
    }
  }
  
  export { PetNotExist };


