import { Diagram } from "./diagram";

export class DLXDiagrams extends Diagram{

    //in futuro possibile estendere con altri gruppi di segnali oppure singoli segnali
    clock: Diagram;
    address: Diagram;
    memrd: Diagram;
    memwr: Diagram;
    data: Diagram;

    constructor(animationDuration: number){
        super();
        //inizializzo i 5 diagram per i cicli di bus
        this.clock = new Diagram();
        this.address = new Diagram();
        this.memrd = new Diagram;
        this.memwr = new Diagram();
        this.data = new Diagram();
        //setto CLOCK
        this.clock.setType("clock");
        this.clock.setAnimationDuration(animationDuration);
        this.clock.setAnimationClass("clock");
        this.clock.setLoop(true);
        //setto ADDRESS
        this.address.setType("address");
        this.address.setAnimationDuration(animationDuration);
        this.address.setAnimationClass("general");
        //setto MEMRD
        this.memrd.setType("memrd");
        this.memrd.setAnimationDuration(animationDuration);
        this.memrd.setAnimationClass("general");
        //setto MEMWR
        this.memwr.setType("memwr");
        this.memwr.setAnimationDuration(animationDuration);
        this.memwr.setAnimationClass("general");
        //setto DATA
        this.data.setType("data_in");
        this.data.setAnimationDuration(animationDuration);
        this.data.setAnimationClass("general");
    }

}