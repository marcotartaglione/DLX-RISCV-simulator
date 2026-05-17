import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'format',
  standalone: true,
})
export class FormatPipe implements PipeTransform {

  transform(n: number | string, type: 'dec' | 'bin' | 'hex' | 'oct' | string, length: number = 32): any {
    let value: number | string = n;
    if (typeof n === 'string') {
      const s = n.trim();
      const sign = s.startsWith('-') ? -1 : 1;
      const unsignedStr = s.startsWith('+') || s.startsWith('-') ? s.substring(1) : s;

      if (/^0[xX]/.test(unsignedStr)) {
        value = sign * parseInt(unsignedStr.substring(2), 16);
      } else if (/^0[bB]/.test(unsignedStr)) {
        value = sign * parseInt(unsignedStr.substring(2), 2);
      } else if (/^0[oO]/.test(unsignedStr)) {
        value = sign * parseInt(unsignedStr.substring(2), 8);
      } else {
        value = Number(s);
      }
    }

    const numeric = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(numeric)) {
      return n;
    }

    const unsigned = numeric >>> 0;

    switch (type) {
      case 'dec':
        return (numeric > 268435455 || numeric < 0) ? unsigned : numeric;
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
