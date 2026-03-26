export interface IAddressableStorage {
  readonly memory: Uint8Array;

  load(address: number): number;
  store(address: number, byte: number): void;

  size(unit: 'B' | 'KB' | 'MB' | 'GB'): number;
}
