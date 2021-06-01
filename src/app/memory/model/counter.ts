import { Injector, Input, Inject, Injectable } from '@angular/core';
import { LogicalNetwork } from './logical-network';
import { MemoryService } from 'src/app/services/memory.service';
@Injectable()
export class Counter extends LogicalNetwork {
  //ffd( name, d, a_res, a_set, clk)
  //mux( zero, one, sel)
  //tri( in, en )
  //bd0 = tri( ffd( start, mux( start.q, bd0, cs_write ), reset, null, memwr* ), cs_read )";
  sampleValue: number; // rappresenta l'ultimo valore campionato effettuando una load a CS_READ_VALUE_COUNTER
  currentValue: number ; // valore interno al contatore
  counting_basis: number ; // base di conteggio del counter 
  loadValue: number ; // valore che voglio caricare con la load
  up_down_value: number; // valore corrente di up/down . 1=up, 0=down
  a_res_value_ffd: string ; // valore a_res ffd che mantiene up/down
  a_set_value_ffd: string ; // valore a_setffd che mantiene up/down
  @Input() memoryService : MemoryService ;
  
  constructor(min_address: number, max_address: number, injector: Injector) {
    super('COUNTER', min_address, max_address);
    super.devType = "Counter";
    this.clkType = "MEMWR*"; 
    this.cs = [];
    this.a_reset_value = "RESET";
    this.a_res_value_ffd = "RESET" ; 
    this.a_set_value_ffd = "0" ;
    this.currentValue=0;
    this.sampleValue=0;
    this.counting_basis = 32 ;
    this.loadValue = 0 ;
    this.a_reset_value = "CS_A_RES_COUNTER" ;
    this.up_down_value = 1; //1 up , 0 down
    this.setCS("CS_READ_VALUE_COUNTER", this.min_address ,this.currentValue); // effettuando lettura a questo cs si ottiene currente value del counter
    this.setCS("CS_A_RES_COUNTER", this.min_address + 0x00000001, 0);
    this.setCS("CS_RES_COUNTER", this.min_address + 0x00000002, 0);
    this.setCS("CS_ENABLE_COUNTER", this.min_address + 0x00000003, 1);
    this.setCS("CS_UP_DOWN_COUNTER", this.min_address + 0x00000004, 1);
    this.setCS("CS_LOAD_VALUE_COUNTER", this.min_address + 0x00000005, 0);
  }
 
  // metodo che restituisce immagine contatore

  public getImageName() {
    
    return ("assets/img/counter/count/count_"+this.clkType+"_"+this.a_reset_value+".png").toLowerCase();
    
  }

  // metodo che restituisce immagine reti logiche collegate al contatore

  public getImageNameNetwork() {
    return ("assets/img/counter/network/fcb_ffdr_"+this.a_res_value_ffd+"_ffds_"+this.a_set_value_ffd+".png").toLowerCase();
  }

  // metodo chiamato quando si scrive/legge a cs_enable_counter.

  updateCurrentValue() {
   
    if(this.up_down_value == 1) {  // se up/down==1 incremento valore contatore
      this.increment();
    } else {                       // altrimenti decremento
      this.decrement();
    }
  }

  // Metodo che incrementa il valore del counter di "uno" ; Se si è raggiunto il valore massimo esprimibile dal counter
  // riparte a contare da 0 ;

  increment() {
    let max = Math.pow(2,this.counting_basis);
    if(this.currentValue === max )
        this.currentValue = 0;
    else {
        this.currentValue ++ ;
    }
  }

  // Metodo che decrementa il valore del counter di "uno" ; Se si è raggiunto il valore 0 del counter
  // riparte a contare dal valore massimo esprimibile dal counter ;


  decrement() {
    let max = Math.pow(2,this.counting_basis);
    if(this.currentValue === 0 )
        this.currentValue = max;
    else {
        this.currentValue -- ;
    }

  }

  getCurrentValue() {
    return this.currentValue;
  }

  getCountingBasis() {
    return this.counting_basis;
  }

  // reset asicnrono del contatore

  public a_reset() {
      this.currentValue = 0 ;

      // aggiorno cs_read_value_counter con il nuovo valore di currentValue. Se non lo facessi facendo 
      // successivamente una lettura a cs_read_value_counter non otterrei il valore aggiornato di 
      //  currentValue

      this.setCS("CS_READ_VALUE_COUNTER", this.min_address ,this.currentValue); 
  }

  // LOAD : metodo invocato quando si fa una lettura ad un certo indirizzo
  
  public load(address: number, instrType?: string): number {

    // Se l'indirizzo a cui si fa la load corrisponde ad un cs allora lavoro sul cs andando a leggere l'id e in
    // base a questo decido cosa fare (switch(cs.id)). Se l'indirizzo non corrisponde ad alcun cs allora effettuo
    // una lettura in memoria all'indirizzo specificato

    // NB : Quando restituisco 0 è perchè i cs assumeranno il valore uno durante il fronte di salita e poi torneranno
    // subito a zero. Quindi tranne per cs_up_down_counter e cs_read_value_counter , che mantengono un valore , restituisco
    // sempre zero .

    let cs = this.cs.find(el => el.address == address);
    if (cs == null || instrType == "IS") return super.load(address);
    else {
      switch (cs.id) {

        // nel caso della load suppongo di avere un fronte di salita 
        // ogni volta che ho un ciclo di bus in lettura :
        // quindi quando viene fatta lettura e il clock vale MEMRD*

        case "CS_READ_VALUE_COUNTER":
          if(this.clkType == "MEMRD*"){ 

            // se ho un fronte di salita allora aggiorno il valore campionato con il currentValue e 
            // aggiorno il cs_read_value_counter

            this.sampleValue = this.currentValue;
            this.setCS("CS_READ_VALUE_COUNTER",this.min_address,this.currentValue);
          }

          // Restitutisco sempre sampleValue. Nel caso ci sia appena stato 
          // un fronte di salita verrà restituito il valore 
          // aggiornato altrimenti verrà restituito l'ultimo valore campionato.

          return this.sampleValue;
        case "CS_ENABLE_COUNTER":
          if(this.clkType == "MEMRD*"){

            // se ho un fronte di salita aggiorno il currentValue

            this.updateCurrentValue();
          }
          return 0; 
        
        //reset sincrono : se ho un fronte di salita resetto il contatore
        // e aggiorno il cs

        case "CS_RES_COUNTER":
          if(this.clkType == "MEMRD*")
          this.currentValue = 0 ;
          return 0 ;

        // up/down : se ho un fronte di salita inverto il valore di up/down. Al successivo
        // updateCurrentValue se questo valore sarà uno allora incrementerò altrimenti
        // decrementerò . Aggiorno il valore del cs.

        case "CS_UP_DOWN_COUNTER":
          if(this.clkType == "MEMRD*") {
          this.up_down_value = this.mux(this.up_down_value,!this.up_down_value,1);
          this.setCS("CS_UP_DOWN_COUNTER", this.min_address + 0x00000004, this.up_down_value);
          }
          return this.up_down_value ;
        
        // load_value : se ho un fronte di salita carico nel contatore il valore presente sugli ingressi
        // load . Aggiorno il cs.
        
        case "CS_LOAD_VALUE_COUNTER" :
          if(this.clkType == "MEMRD*") {
            this.currentValue = this.loadValue ;
            this.setCS("CS_READ_VALUE_COUNTER", this.min_address ,this.currentValue);
          }
          return 0;

        // a_res : in caso di fronte di salita resetto il contatore in modo asincrono

        case "CS_A_RES_COUNTER" :
          if(this.a_reset_value == "CS_A_RES_COUNTER")
            this.a_reset();
          return 0;
      }
    }

  }

  // Se l'indirizzo a cui si fa la store corrisponde ad un cs allora lavoro sul cs andando a leggere l'id e in
  // base a questo decido cosa fare (switch(cs.id)). Se l'indirizzo non corrisponde ad alcun cs allora effettuo
  // una scrittura in memoria all'indirizzo specificato


  public store(address: number, word: number): void {
    let cs = this.cs.find(el => el.address == address);
    if (cs == null) return super.store(address, word);
    else {

      // nel caso della store suppongo di avere un fronte di salita 
      // ogni volta che ho un ciclo di bus in scrittura :
      // quindi quando viene fatta scrittuta e il clock vale MEMWR*

      // VALGONO GLI STESSI DISCORSI PER LA LOAD MA INVERITI : quindi tutto quello 
      // che prima accadeva andando ad effettuare una lettura al cs con clock a MEMRD* 
      // ora nella store succederà andando ad effettuare una scrittura al cs e con
      // clock a MEMWR*

      switch (cs.id) {
        case "CS_ENABLE_COUNTER":
          if(this.clkType == "MEMWR*"){
            this.updateCurrentValue();
          }
          break;
        case "CS_A_RES_COUNTER":
          if (this.a_reset_value == "CS_A_RES_COUNTER")
                this.a_reset();
            break;
        case "CS_RES_COUNTER":
          if(this.clkType == "MEMWR*") {
            this.currentValue = 0;
            this.setCS("CS_READ_VALUE_COUNTER", this.min_address ,this.currentValue);
          }
          break;
        case "CS_UP_DOWN_COUNTER":
          if(this.clkType == "MEMWR*")  {
            this.up_down_value = this.mux(this.up_down_value,!this.up_down_value,1);
            this.setCS("CS_UP_DOWN_COUNTER", this.min_address + 0x00000004, this.up_down_value);
          }
          break;
        case "CS_LOAD_VALUE_COUNTER":
          if(this.clkType == "MEMWR*") {
            this.currentValue = this.loadValue;
            this.setCS("CS_READ_VALUE_COUNTER", this.min_address ,this.currentValue);
          }
          break;
      } 
    }
  }

  

}
