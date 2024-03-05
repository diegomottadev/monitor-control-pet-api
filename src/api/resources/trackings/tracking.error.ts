class TrackingNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The role does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'TrackingNotExist';
    }
  }
  
  export { TrackingNotExist };