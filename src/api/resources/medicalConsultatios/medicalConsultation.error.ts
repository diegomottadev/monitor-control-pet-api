
class MedicalConsultationNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The medical consultation does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'MedicalConsultationNotExist';
    }
  }
  
  export { MedicalConsultationNotExist };
  