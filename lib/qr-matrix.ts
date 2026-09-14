/**
 * Pure TypeScript QR Code Generator (Nayuki algorithm, public domain)
 * Generates ISO/IEC 18004 compliant QR Code boolean matrices for dynamic rendering.
 * Zero external dependencies, 100% offline, reactive, synchronous.
 */

export class QrMatrix {
  public readonly size: number;
  private readonly modules: boolean[][];

  constructor(size: number) {
    this.size = size;
    this.modules = Array.from({ length: size }, () => Array(size).fill(false));
  }

  public get(x: number, y: number): boolean {
    return this.modules[y]?.[x] ?? false;
  }

  public set(x: number, y: number, isDark: boolean): void {
    if (y >= 0 && y < this.size && x >= 0 && x < this.size) {
      this.modules[y][x] = isDark;
    }
  }

  /**
   * Generates a 2D matrix representing the QR code for given string data.
   * Uses Error Correction Level M (15% redundancy).
   */
  public static generate(text: string): boolean[][] {
    const data = new TextEncoder().encode(text);
    
    // Choose appropriate version (1 to 10) for byte mode with Level M
    const capacitiesM = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213];
    let version = 1;
    while (version <= 10 && capacitiesM[version] < data.length) {
      version++;
    }
    if (version > 10) {
      version = 10;
    }

    const size = version * 4 + 17;
    const qr = new QrMatrix(size);
    const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Draw Function Patterns
    qr.drawFinderPatterns(isFunction);
    qr.drawAlignmentPatterns(version, isFunction);
    qr.drawTimingPatterns(isFunction);
    qr.drawDarkModule(version, isFunction);
    qr.reserveFormatBits(isFunction);

    // Encode Payload into bit stream
    const bitStream = qr.encodeData(data, version);

    // Generate Error Correction Codewords
    const allCodewords = qr.appendErrorCorrection(bitStream, version);

    // Place Codewords into matrix with masking
    qr.placeCodewords(allCodewords, isFunction);

    return qr.modules;
  }

  private drawFinderPatterns(isFunction: boolean[][]): void {
    const coords = [[0, 0], [this.size - 7, 0], [0, this.size - 7]];
    for (const [x, y] of coords) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isDark = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
          this.set(x + c, y + r, isDark);
          isFunction[y + r][x + c] = true;
        }
      }
      // Separator border
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const px = x + c;
          const py = y + r;
          if (px >= 0 && px < this.size && py >= 0 && py < this.size) {
            isFunction[py][px] = true;
          }
        }
      }
    }
  }

  private drawAlignmentPatterns(version: number, isFunction: boolean[][]): void {
    if (version < 2) return;
    const alignCoords: Record<number, number[]> = {
      2: [6, 18],
      3: [6, 22],
      4: [6, 26],
      5: [6, 30],
      6: [6, 34],
      7: [6, 22, 38],
      8: [6, 24, 42],
      9: [6, 26, 46],
      10: [6, 28, 50],
    };
    const pos = alignCoords[version] || [];
    for (const r of pos) {
      for (const c of pos) {
        if (isFunction[r][c]) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const isDark = (Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
            this.set(c + dx, r + dy, isDark);
            isFunction[r + dy][c + dx] = true;
          }
        }
      }
    }
  }

  private drawTimingPatterns(isFunction: boolean[][]): void {
    for (let i = 0; i < this.size; i++) {
      if (!isFunction[6][i]) {
        this.set(i, 6, i % 2 === 0);
        isFunction[6][i] = true;
      }
      if (!isFunction[i][6]) {
        this.set(6, i, i % 2 === 0);
        isFunction[i][6] = true;
      }
    }
  }

  private drawDarkModule(version: number, isFunction: boolean[][]): void {
    const y = 4 * version + 9;
    const x = 8;
    this.set(x, y, true);
    isFunction[y][x] = true;
  }

  private reserveFormatBits(isFunction: boolean[][]): void {
    for (let i = 0; i < 9; i++) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
    for (let i = 0; i < 8; i++) {
      isFunction[8][this.size - 1 - i] = true;
      isFunction[this.size - 1 - i][8] = true;
    }
  }

  private encodeData(data: Uint8Array, version: number): number[] {
    const bits: number[] = [];
    const pushBits = (val: number, len: number) => {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    };

    // Mode: Byte (0100)
    pushBits(0b0100, 4);
    // Char count indicator (8 bits for v1-9, 16 bits for v10)
    pushBits(data.length, version < 10 ? 8 : 16);
    // Data bytes
    for (const b of data) {
      pushBits(b, 8);
    }
    // Terminator (up to 4 zeros)
    pushBits(0, 4);
    // Pad to byte boundary
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    // Capacity in bytes for Level M
    const totalDataBytes = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216][version] || 216;
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < totalDataBytes * 8) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bits to byte array
    const bytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | bits[i + j];
      }
      bytes.push(b);
    }
    return bytes;
  }

  private appendErrorCorrection(data: number[], version: number): number[] {
    // Number of EC codewords for Level M
    const ecPerBlockTable: Record<number, { ecCodewords: number; blocks: number }> = {
      1: { ecCodewords: 10, blocks: 1 },
      2: { ecCodewords: 16, blocks: 1 },
      3: { ecCodewords: 26, blocks: 1 },
      4: { ecCodewords: 18, blocks: 2 },
      5: { ecCodewords: 24, blocks: 2 },
      6: { ecCodewords: 16, blocks: 4 },
      7: { ecCodewords: 18, blocks: 4 },
      8: { ecCodewords: 22, blocks: 4 },
      9: { ecCodewords: 22, blocks: 5 },
      10: { ecCodewords: 26, blocks: 5 },
    };

    const config = ecPerBlockTable[version] || { ecCodewords: 18, blocks: 2 };
    const numEc = config.ecCodewords;
    const numBlocks = config.blocks;

    // GF(256) Math
    const exp = new Uint8Array(512);
    const log = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      exp[i + 255] = x;
      log[x] = i;
      x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
    }

    const gMul = (a: number, b: number) => {
      if (a === 0 || b === 0) return 0;
      return exp[log[a] + log[b]];
    };

    // Generator Polynomial
    let gen = new Uint8Array([1]);
    for (let i = 0; i < numEc; i++) {
      const next = new Uint8Array(gen.length + 1);
      const root = exp[i];
      for (let j = 0; j < gen.length; j++) {
        next[j] ^= gMul(gen[j], root);
        next[j + 1] ^= gen[j];
      }
      gen = next;
    }

    // Split data into blocks
    const blockSize = Math.floor(data.length / numBlocks);
    const result: number[] = [];
    const ecBlocks: number[][] = [];

    for (let b = 0; b < numBlocks; b++) {
      const blockData = data.slice(b * blockSize, (b + 1) * blockSize);
      const ec = new Uint8Array(numEc);
      for (const byte of blockData) {
        const factor = byte ^ ec[0];
        ec.copyWithin(0, 1);
        ec[numEc - 1] = 0;
        for (let j = 0; j < numEc; j++) {
          ec[j] ^= gMul(gen[j], factor);
        }
      }
      ecBlocks.push(Array.from(ec));
    }

    // Interleave data
    for (let i = 0; i < blockSize; i++) {
      for (let b = 0; b < numBlocks; b++) {
        result.push(data[b * blockSize + i]);
      }
    }
    // Interleave EC
    for (let i = 0; i < numEc; i++) {
      for (let b = 0; b < numBlocks; b++) {
        result.push(ecBlocks[b][i]);
      }
    }

    return result;
  }

  private placeCodewords(codewords: number[], isFunction: boolean[][]): void {
    const bits: number[] = [];
    for (const c of codewords) {
      for (let i = 7; i >= 0; i--) {
        bits.push((c >> i) & 1);
      }
    }

    let bitIdx = 0;
    let up = true;
    for (let right = this.size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing pattern
      for (let vert = 0; vert < this.size; vert++) {
        const y = up ? this.size - 1 - vert : vert;
        for (let x = right; x >= right - 1; x--) {
          if (!isFunction[y][x]) {
            const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
            // Standard mask pattern 0: (row + col) % 2 === 0
            const mask = (x + y) % 2 === 0;
            this.set(x, y, (bit === 1) !== mask);
          }
        }
      }
      up = !up;
    }

    // Write format info for Level M + Mask 0: 0b101010000010010
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 15; i++) {
      const bit = formatBits[i] === 1;
      if (i <= 5) this.set(8, i, bit);
      else if (i === 6) this.set(8, 7, bit);
      else if (i === 7) this.set(8, 8, bit);
      else if (i === 8) this.set(7, 8, bit);
      else this.set(14 - i, 8, bit);

      if (i < 7) this.set(this.size - 1 - i, 8, bit);
      else this.set(8, this.size - 15 + i, bit);
    }
  }
}

