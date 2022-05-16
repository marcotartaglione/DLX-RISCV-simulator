import { ApplicationRef } from "@angular/core";
import { Diagram } from "./diagram";

export class DLXDiagrams {

    //in futuro possibile estendere con altri gruppi di segnali oppure singoli segnali
    clock: Diagram;
    address: Diagram;
    memrd: Diagram;
    memwr: Diagram;
    data: Diagram;

    constructor(private appRef: ApplicationRef) {
        //creo i 5 diagram per i cicli di bus
        this.clock = new Diagram('clock', 'clock', this.appRef);
        this.address = new Diagram('address', 'general', this.appRef);
        this.memrd = new Diagram('memrd', 'general', this.appRef);
        this.memwr = new Diagram('memwr', 'general', this.appRef);
        this.data = new Diagram('data_in', 'general', this.appRef);
    }

    /*METODI PUBBLICI INVOCATI DA DiagramService */
    public resume() {
        this.clock.resume();
        this.address.resume();
        this.memrd.resume();
        this.memwr.resume();
        this.data.resume();
    }

    public stop() {
        this.clock.stop();
        this.address.stop();
        this.memrd.stop();
        this.memwr.stop();
        this.data.stop();
    }

    public pause() {
        this.clock.pause();
        this.address.pause();
        this.memrd.pause();
        this.memwr.pause();
        this.data.pause();
    }

    /*CICLO DI BUS DI LETTURA*/
    public load() {
        //setto data come data_in
        this.data.setType("data_in");
        //resetto e faccio partire
        //clock
        this.clock.stop();
        this.clock.resume();
        //address
        this.address.stop();
        this.address.resume();
        //memwr
        this.memwr.stop();
        //memrd
        this.memrd.stop();
        this.memrd.resume();
        //data
        this.data.stop();
        this.data.resume();
    }

    /*CICLO DI BUS DI SCRITTURA */
    public store() {
        //setto data come data_out
        this.data.setType("data_out");
        //resetto e faccio partire
        //clock
        this.clock.stop();
        this.clock.resume();
        //address
        this.address.stop();
        this.address.resume();
        //memwr
        this.memwr.stop();
        this.memwr.resume();
        //memrd
        this.memrd.stop();
        //data
        this.data.stop();
        this.data.resume();
    }

    /*ANIMAZIONE DI IDLE*/
    /*Quando non vengono fatte operazione di I/O*/
    public idle() {
        this.clock.stop();
        this.clock.resume();
        //faccio un reset degli altri
        this.address.stop();
        this.memrd.stop();
        this.memwr.stop();
        this.data.stop();
    }

}