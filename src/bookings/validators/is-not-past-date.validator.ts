import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotPastDate', async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string): boolean {
    if (!dateString || isNaN(Date.parse(dateString))) return false;

    const inputDate = new Date(dateString);
    const today = new Date();
    // Compare on the day level only, so "today" is always a valid booking date.
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return inputDate.getTime() >= today.getTime();
  }

  defaultMessage(): string {
    return 'Booking date cannot be in the past.';
  }
}

export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotPastDateConstraint,
    });
  };
}
