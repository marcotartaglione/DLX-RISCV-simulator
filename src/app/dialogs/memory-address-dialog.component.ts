import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MemoryService } from '../services/memory.service';

@Component({
  templateUrl: './memory-address-dialog.component.html',
})
export class MemoryAddressDialogComponent{
  fType : string;
  tmpVal : number[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service: MemoryService) {
    this.fType = 'hex'
  }

  onInputChange = (val,el) => {
    if("hex"==this.fType && (val.length!=8 || val.includes("0x")) && val.length != 10) return;
    let formattedVal = val;
    /*f(val.includes("0x"))
      formattedVal = parseInt(val);
    else if("hex" == this.fType && val.length==8)
      formattedVal = parseInt("0x".concat(val));*/
     formattedVal = parseInt(val);
     //console.log(formattedVal)
     //console.log(this.data.values.find(x => x.address == el.address).value)
    this.data.values.find(x => x.address == el.address).value = formattedVal;
  }

  onSubmit = () => {
    this.data.values.forEach(el => {
      this.service.memory.store(el.address,el.value);
    })
  }
}






