declare module 'gifenc' {
  export function quantize(
    data: Uint8ClampedArray | Uint8Array,
    maxColors: number,
    options?: Record<string, unknown>
  ): number[][];

  export function applyPalette(
    data: Uint8ClampedArray | Uint8Array,
    palette: number[][],
    format?: string
  ): Uint8Array;

  export interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][];
        transparent?: boolean;
        transparentIndex?: number;
        delay?: number;
        repeat?: number;
        colorDepth?: number;
        first?: boolean;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
  }

  export function GIFEncoder(options?: { initialCapacity?: number; auto?: boolean }): GIFEncoderInstance;
}
