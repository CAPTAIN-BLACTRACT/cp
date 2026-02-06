import { Component, inject, OnInit, effect, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import {CommonModule} from '@angular/common';
import {Crypto} from '../crypto';
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit ,OnDestroy {
cryptoService = inject(Crypto);

@ViewChild('chartCanvas',{static:true}) canvas!: ElementRef<HTMLCanvasElement>;

chart: any;
selectedCoin = 'BTC';
coins=['BTC','ETH','SOL','DOGE','BNB'];

constructor(){
  effect(()=>{
    const price = this.cryptoService.currentPrice();
    if(price>0 && this.chart){
      this.updateChart(price);
    }
  });
}

ngOnInit(){
  this.initChart();
  this.selectCoin(this.selectedCoin);
}

ngOnDestroy(){
  this.cryptoService.disconnect();
}

selectCoin(coin:string){
  this.selectedCoin = coin;
  this.chart.data.labels=[];

  this.chart.data.datasets[0].data=[];
  this.chart.update();

  this.cryptoService.connectToCoin(coin);

}
initChart(){
  this.chart = new Chart(this.canvas.nativeElement,{
    type: 'line',
    data:{
        labels:[],
        datasets: [{
          label: 'Price (USDT)',
          data: [],
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
    },
    options:{
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {display:false}
      },
      scales: {
        x: {display:false},
        y: {
          position: 'right',
          grid: {color: '#333'},
          ticks: {color:'#888'}
        }
      }
    }
  });
}

updateChart(price:number){
  const now = new Date().toLocaleTimeString();

  this.chart.data.labels.push(now);
  this.chart.data.datasets[0].data.push(price);

  if(this.chart.data.labels.length>50){
    this.chart.data.labels.shift();
    this.chart.data.datasets[0].data.shift();
  }

  this.chart.update();
}
}
