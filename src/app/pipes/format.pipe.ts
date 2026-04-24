import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'format',
  standalone: true,
})
export class FormatPipe implements PipeTransform {

  transform(n: number | string, type: 'dec' | 'bin' | 'hex' | 'oct' | string, length: number = 32): any {
    const value = typeof n === 'string' ? Number(n.trim()) : n;

    if (!Number.isFinite(value)) {
      return n;
    }

    const unsigned = value >>> 0;

    switch (type) {
      case 'dec':
        return (value > 268435455 || value < 0) ? unsigned : value;
      case 'bin':
        return unsigned.toString(2).padStart(length, '0');
      case 'hex':
        return '0x' + unsigned.toString(16).padStart(Math.ceil(length / 4), '0').toUpperCase();
      case 'oct':
        return unsigned.toString(8).padStart(Math.ceil(length / 2), '0').toUpperCase();
      default:
        return n;
    }
  }
}
