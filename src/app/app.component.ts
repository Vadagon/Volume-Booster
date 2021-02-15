import { Component, ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  title = 'Volume Booster';
  currentValue = 100;
  displayCurrentValue = 100;
  audioTabs = [];
  tabsLevels = {};
  port;
  currentId;

  constructor(private changeDetection: ChangeDetectorRef) {
  	chrome.tabs.query({ audible: true }, (tabArray) => {
		this.audioTabs.push(...tabArray);
		console.log(this.audioTabs)
		this.changeDetection.detectChanges();
	});




  	this.port = chrome.runtime.connect({
		name: "Sample Communication"
	});
	this.port.onMessage.addListener((msg)=>{
		console.log(msg);
		this.currentId = msg.curTab.id
		this.tabsLevels = msg.tabsLevels;
		if (this.tabsLevels[msg.curTab.id])
			// if (this.tabsLevels[msg.curTab.id]>1){
			// 	$scope.isDisabledCurrent = true;
			// }
		if (this.tabsLevels[msg.curTab.id]){
			this.currentValue = this.tabsLevels[msg.curTab.id]*100;
			this.displayCurrentValue = this.currentValue;
			this.changeDetection.detectChanges();
		}

	})
  }

  changeVolume(id, val){
		this.port.postMessage({id: parseInt(id), val: val});
	}

  switchToTab(tabId: number){
  	chrome.tabs.update(tabId, {selected: true});
  }

  disableVolumeBooster(event: any) {
  	if(!event.checked) this.port.postMessage({id: this.currentId, deInit: true}); 
  	else this.changeVolume(this.currentId, this.displayCurrentValue);
  }
  	currentValueChange(event: any) {
		this.displayCurrentValue = event.value;
		this.changeVolume(this.currentId, this.displayCurrentValue);

		chrome.tabs.query({ windowType: 'normal', audible: true }, function(tabArray) {
			// console.log(tabArray)
			// this.audioTabs = tabArray;
			// chrome.tabCapture.capture({
   //              audio: !0,
   //              video: !1
   //          }, function(stream) {
   //              // tabsLevels[id] = parseFloat(val) / 100;
   //              // tabsGaines[id] = {};


   //              // createAudio(tabsGaines[id], stream);
   //              // setDefaults(tabsGaines[id]);

             

   //              // tabsGaines[id].nodeGain.gain.value = tabsGaines[id].nodeGain.gain.value;

   //              // a.eqi(id, {})

   //              // connect(tabsGaines[id]);


   //              // a.createAudio(tabsGaines[id], tabsLevels[id], stream)
                
   //              // callback&&callback()
   //          });
		})	
	}

}
