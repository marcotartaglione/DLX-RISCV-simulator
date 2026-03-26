export class ChipSelect {
  // TODO: implementare la possibilità di associare una funzione al chip select invece che un valore

  constructor(
    public id: string,
    public address: number
  ) { }

  public static of(id: string, address: number): ChipSelect {
    if (!id) {
      throw new Error('Invalid id for ChipSelect: ' + id);
    }
    if (address < 0) {
      throw new Error('Invalid address for ChipSelect: ' + address);
    }
    return new ChipSelect(id, address);
  }
}
