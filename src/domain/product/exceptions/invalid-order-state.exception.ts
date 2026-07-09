export class InvalidOrderStateException extends Error {
  constructor(currentState: string, expectedState?: string) {
    super(
      expectedState
        ? `Cannot transition from ${currentState} to ${expectedState}`
        : `Order is in state ${currentState} and cannot perform this operation`,
    );
    this.name = 'InvalidOrderStateException';
  }
}
