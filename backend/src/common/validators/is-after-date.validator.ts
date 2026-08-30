import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validates that a Date property falls strictly after another Date property on
 * the same object. Used for the "end date must be after start date" rule.
 *
 * When either value is missing or not a valid Date this validator passes, so
 * that the type and presence validators on those properties own that error
 * instead of reporting it twice.
 */
export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];

          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            return true;
          }

          if (
            Number.isNaN(value.getTime()) ||
            Number.isNaN(relatedValue.getTime())
          ) {
            return true;
          }

          return value.getTime() > relatedValue.getTime();
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
