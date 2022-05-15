import { ApplicationRef } from "@angular/core";
import { Diagram } from "./diagram";

export class DLXDiagrams{

    //in futuro possibile estendere con altri gruppi di segnali oppure singoli segnali
    clock: Diagram;
    address: Diagram;
    memrd: Diagram;
    memwr: Diagram;
    data: Diagram;

    constructor(){
        //creo i 5 diagram per i cicli di bus
        this.clock = new Diagram('clock', 'clock');
        this.address = new Diagram('address', 'general');
        this.memrd = new Diagram('memrd', 'general');
        this.memwr = new Diagram('memwr', 'general');
        this.data = new Diagram('data_in', 'general');
    }

}