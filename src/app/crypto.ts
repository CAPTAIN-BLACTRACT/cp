import { Injectable,signal } from '@angular/core';

export interface cryptoData{
  symbol:string;
  price:number;
  time:number;
}
@Injectable({
  providedIn: 'root',
})
export class Crypto {
  private socket: WebSocket | null = null;

  currentPrice= signal<number>(0);
  connectionStatus= signal<'Disconnected' | 'Connecting' | 'Connected'>('Disconnected');

  connectToCoin(symbol:string){
    if(this.socket){
      this.socket.close();
    }

    this.connectionStatus.set('Connecting');
    const formattedSymbol= symbol.toLowerCase();


    this.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${formattedSymbol}usdt@trade`);

    this.socket.onopen = ()=>{
      console.log(`connected to ${symbol}`);
      this.connectionStatus.set('Connected');

    };

    this.socket.onmessage =(event)=>{
      const data = JSON.parse(event.data);

      const price = parseFloat(data.p);

      this.currentPrice.set(price);
    };

    this.socket.onerror=(error)=>{
      console.error('websocket error ', error);
      this.connectionStatus.set('Disconnected');

    };
  }

  disconnect(){
    if(this.socket){
      this.socket.close();
      this.connectionStatus.set('Disconnected');
    }
  }

}
