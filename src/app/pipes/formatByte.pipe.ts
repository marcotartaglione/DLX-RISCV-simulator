import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formatByte'
})
export class FormatBytePipe implements PipeTransform {

  transform(n: string, type: 'dec' | 'bin' | 'hex' | string): any {
    switch (type) {
      case 'dec':
        return parseInt(n,2);
      case 'bin':
        return n ;
      case 'hex':
        return '0x' + parseInt(n,2).toString(16).padStart(2,'0').toUpperCase();
      
    }
  }

}
