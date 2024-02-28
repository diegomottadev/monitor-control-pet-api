

class AntiparasiticNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The anteparasitic does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'AntiparasiticNotExist';
    }
  }
  
  export { AntiparasiticNotExist };


