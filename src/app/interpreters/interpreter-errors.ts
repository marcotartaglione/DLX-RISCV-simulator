import {Documentation} from '../documentation/documentation.component';

export class RegisterNotFoundError extends Error {
  constructor(register: string) {
    super('Register ' + register + ' does not exist');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotExistingInstructionError extends Error {
  constructor(instruction: string) {
    super('The instruction ' + instruction + ' doesn\'t exist');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class WrongArgumentsError extends Error {
  constructor(instruction: string, documentation: Documentation[]) {
    super('Wrong arguments: ' + documentation.find(doc => doc.name == instruction).syntax);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
