/**********************************************************
* JSMetronome v0.2 (March 2012)
* Copyright (C) 2012 www.colxi.info
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation, version 2 of the License.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* http://www.gnu.org/licenses/gpl-2.0.html
***********************************************************/


var JSmetronome = {
	GUI:{
		power : document.getElementById("power"),
		bellButton : document.getElementById("BellButton"),
		tap : document.getElementById("tap"),
		tapBkg : document.getElementById("tapBkg"),
		tempoUp : document.getElementById("tempoUp"),
		tempoDown : document.getElementById("tempoDown"),
		tempoDisplay : document.getElementById("tempoDisplay"),
		metronomeTick : document.getElementById("metronomeTick_1"),
		metronomeBell : document.getElementById("metronomeBell"),
		timeSignature : document.getElementById("timeSignature"),
		beatDisplay : document.getElementById("Beat")
	},
	vars:{
		power : false,
		tempo : 0,
		soundBell : true,
		BeatsPerMeasure:0,
		BeatSubdivision:0,
		CurrentBeatSubdivision:0,
		currentBeat : 0,
		lastTap : 0,
		_timeoutID : 0,
		_tempoMin : 1,
		_tempoMax : 250,
		_timeSignature:[
			// name , beats, time subdivision(2 = binary / 3 = ternary)
			[2,4,2],
			[3,4,2],
			[4,4,2],
			[6,8,3],
			[9,8,3],
			[12,8,3]
		]
	},
	setTimeSignature: function(timeSignature){
		//chekc if it's a number
		if(!isNaN(parseFloat(timeSignature)) && isFinite(timeSignature)){
			// if its positive, rotate one step positive or negative the array items. Selected item, result as first of list.
			if(timeSignature >= 0){
				// positive array rotation
				var currentTimeSignature = this.vars._timeSignature.shift();
				this.vars._timeSignature.push(currentTimeSignature);
				currentTimeSignature = this.vars._timeSignature[0];
			}else{
				// negative array rotation
				var currentTimeSignature = this.vars._timeSignature.pop();
				this.vars._timeSignature.unshift(currentTimeSignature);
				currentTimeSignature = this.vars._timeSignature[0];
			};
		}else{
			// If timesignature provided as String (ex. "4/4"), find coincidences with array items
			var currentTimeSignature= timeSignature.split("/");
			for(var i=0; i < this.vars._timeSignature.length; i++) {
				if(this.vars._timeSignature[i][0]== currentTimeSignature[0] && this.vars._timeSignature[i][1]== currentTimeSignature[1]){
					currentTimeSignature[2] = this.vars._timeSignature[i][2];
					for(var r=0; r < i; r++) this.setTimeSignature(+1);
				};
			}
			if(!currentTimeSignature[2]) return false;
		}
		//config system with new Time Signature params.
		this.vars.BeatSubdivision = currentTimeSignature[2];
		this.vars.BeatsPerMeasure = (this.vars.BeatSubdivision == 3) ? (currentTimeSignature[0]/3) : currentTimeSignature[0];
		//reinitiate counters
		this.vars.currentBeat = 0;
		this.vars.CurrentBeatSubdivision = 0;
		//draw interface
		this.GUI.timeSignature.innerHTML = currentTimeSignature[0] + "/" + currentTimeSignature[1];
		
		//document.body.style.background='url('+background')';
		//reset and restart.
		clearTimeout(this.vars._timeoutID);
		this.tick();
		return true;
	},
	setTempo: function(newTempo,operator){
		if(operator) var newTempo = (operator == "+") ? this.vars.tempo + newTempo : this.vars.tempo - newTempo;
		if(newTempo >= this.vars._tempoMax) newTempo = this.vars._tempoMax;
		if(newTempo <= this.vars._tempoMin) newTempo = this.vars._tempoMin;
		this.vars.tempo = newTempo;
		this.GUI.tempoDisplay.innerHTML = this.vars.tempo;
		this.vars.currentBeat = 0;
		this.vars.CurrentBeatSubdivision = 0;
		clearTimeout(this.vars._timeoutID);
		this.tick();
		return true;
	},
	tick: function(){
		if(!this.vars.power) return false;
		if(this.vars.currentBeat >= this.vars.BeatsPerMeasure) this.vars.currentBeat = 1;
			else this.vars.currentBeat += 1;
		this.GUI.metronomeBell.pause();
		this.GUI.metronomeBell.currentTime = 0;
		this.GUI.metronomeTick.pause();
		this.GUI.metronomeTick.currentTime = 0;
		if(this.vars.currentBeat == 1 && this.vars.soundBell == true) this.GUI.metronomeBell.play();
		this.GUI.metronomeTick.play();
		this.GUI.beatDisplay.innerHTML = this.vars.currentBeat;
		this.vars._timeoutID = setTimeout(function(){this.tick()}.bind(this), 1000/(this.vars.tempo/60));
		return true;
	},
	toggleBell: function(status){
		if(status == undefined){
			this.vars.soundBell = this.vars.soundBell ? false : true;
		}else{
			if(status) this.vars.soundBell = true;
				else this.vars.soundBell = false;
		}
		this.GUI.bellButton.className = this.vars.soundBell ? 'unselectable BellButton' : 'unselectable BellButton_off';
	},
	tap: function(){
		this.GUI.tapBkg.style.visibility  = "visible";
		var lastTapTime = this.vars.lastTap;
		var currentTapTime = new Date().getTime();
		this.vars.lastTap =  currentTapTime;
		var newTempo = Math.round(1000/(currentTapTime-lastTapTime)*60);
		this.setTempo(newTempo);
		return true;
	},
	power: function(status){
		if(this.vars.power){
			this.vars.power = false;
			clearTimeout(this.vars._timeoutID);
			this.vars.currentBeat = 0;
			this.GUI.beatDisplay.innerHTML = this.vars.currentBeat;
		}else{
			this.vars.power = true;
			this.tick();
		};
	},
	init: function(){
		this.GUI.timeSignature.onmousedown = function(){this.setTimeSignature(+1)}.bind(this);
		this.GUI.bellButton.onmousedown = function(){this.toggleBell()}.bind(this);
		this.GUI.power.onmousedown = function(){this.power()}.bind(this);
		this.GUI.tap.onmousedown = function(){this.tap()}.bind(this);
		this.GUI.tap.onmouseup = function(){this.GUI.tapBkg.style.visibility  = "hidden "}.bind(this);
		this.GUI.tap.onmouseout = function(){this.GUI.tapBkg.style.visibility  = "hidden"}.bind(this);
		this.GUI.tempoUp.onmousedown = function(){ProgInterval.add(function(){this.setTempo(1,'+')}.bind(this),1000,0.18,'tempoUp')}.bind(this);
		this.GUI.tempoUp.onmouseup = function(){ProgInterval.del('tempoUp')}.bind(this);
		this.GUI.tempoUp.onmouseout = function(){ProgInterval.del('tempoUp')}.bind(this);
		this.GUI.tempoDown.onmousedown = function(){ProgInterval.add(function(){this.setTempo(1,'-')}.bind(this),1000,0.18,'tempoDown')}.bind(this);
		this.GUI.tempoDown.onmouseup = function(){ProgInterval.del('tempoDown')}.bind(this);
		this.GUI.tempoDown.onmouseout = function(){ProgInterval.del('tempoDown')}.bind(this);
	
		this.setTimeSignature("4/4");
		this.setTempo(60);
		return true;
	}

}

var ProgInterval = {
	_active: [],
	_exec: function(callback,interval,acceleration,ID){
		if(this._active.indexOf(ID) == -1) return false;
		callback();
		interval += interval*(acceleration*(-1));
		if(interval <= 1) interval = 1;
		//console.log(interval);
		setTimeout(function(){this._exec(callback,interval,acceleration,ID)}.bind(this),interval);
	},
	add: function(callback,interval,acceleration,ID){
		var acceleration = acceleration || 0;
		this._active.push(ID);
		this._exec(callback,interval,acceleration,ID);
	},
	del: function(ID){
		var position = this._active.indexOf(ID);
		if(position != -1) this._active.splice(position,1);
	}
}
