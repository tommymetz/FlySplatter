var debug = false;
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var score = 0;

var Flies = function(count, properties){

	//SET PROPERTIES
	this.count = count || 1;
	this.flies = new Array(count);
	this.id = properties.id || 'fly';
	this.assetlocation = properties.assetlocation || '.';
	this.containerid = properties.containerid || 'body';
	this.startpause = properties.startpause || 5000;
	this.mute = properties.mute || false;
	this.score = properties.score || false;

	//CREATE FLIES
	for(i=0; i<this.flies.length; i++){
		this.flies[i] = new Fly({
			id:this.id + i,
			assetlocation:this.assetlocation,
			containerid:this.containerid,
			startpause:this.startpause,
			mute:this.mute,
			score:this.score,
		});
	}

	//CREATE SCOREBOARD
	if(this.score){
		this.scoreboard =  document.createElement('div');
		this.scoreboard.id = 'scoreboard';
		this.scoreboard.style.position = 'absolute';
		this.scoreboard.style.size = '16px';
		this.scoreboard.style.color = '#fff';
		this.scoreboard.style.padding = '10px';
		this.scoreboard.style.backgroundColor = '#000000';
		this.scoreboard.innerHTML = 'Score: 0';
		if(this.containerid != 'body'){
			document.getElementById(this.containerid).appendChild(this.scoreboard);
		}else{
			document.body.appendChild(this.scoreboard);
		}
	}

	if(iOS){
		if(this.containerid != 'body'){
			document.getElementById(this.containerid).addEventListener("touchstart", function(e){
				trackEvent('pageclick', 'click');
			}, false);
		}else{
			document.body.addEventListener("touchstart", function(e){
				trackEvent('pageclick', 'click');
			}, false);
		}
	}else{
		if(this.containerid != 'body'){
			document.getElementById(this.containerid).addEventListener("mousedown", function(e){
				trackEvent('pageclick', 'click');
			}, false);
		}else{
			document.body.addEventListener("mousedown", function(e){
				trackEvent('pageclick', 'click');
			}, false);
		}
	}

};

var Fly = function(model){

	//SET PROPERTIES
	this.id = model.id || 'fly';
	this.assetlocation = model.assetlocation || '.';
	this.containerid = model.containerid;
	this.startpause = model.startpause || 5000;
	this.mute = model.mute || false;
	this.score = model.score || false;

	this.interval = null;
	this.nextactionmaxcount = 5;
	this.currentnextaction = 0;
	this.splattered = false;

	//TARGET HELPER
	if(debug){
		this.target =  document.createElement('div');
		this.target.id = model.id+'-target';
		this.target.style.position = 'absolute';
		this.target.style.width = '5px';
		this.target.style.height = '5px';
		this.target.style.backgroundColor = '#000000';
		if(this.containerid != 'body'){
			document.getElementById(this.containerid).appendChild(this.target);
		}else{
			document.body.appendChild(this.target);
		}
	}

	//FLY CANVAS
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	this.canvas.id = model.id;
	this.canvas.style.position = 'absolute';
	this.canvas.style.zIndex = 10000;
	this.canvas.style.cursor = 'pointer';
	this.canvas.width = 100;
	this.canvas.height = 100;

	//CANVAS RESIZING
	this.devicePixelRatio = window.devicePixelRatio || 1;
	this.backingStoreRatio = this.context.webkitBackingStorePixelRatio||this.context.mozBackingStorePixelRatio||this.context.msBackingStorePixelRatio||this.context.oBackingStorePixelRatio||this.context.backingStorePixelRatio||1;
	this.ratio = this.devicePixelRatio / this.backingStoreRatio;
	if(this.devicePixelRatio !== this.backingStoreRatio){
		var oldWidth = this.canvas.width;
		var oldHeight = this.canvas.height;
        this.canvas.width = oldWidth * this.ratio;
        this.canvas.height = oldHeight * this.ratio;
        this.canvas.style.width = oldWidth + 'px';
        this.canvas.style.height = oldHeight + 'px';
        this.context.scale(this.ratio, this.ratio);
    }

	//CANVAS SHADOW
	this.context.shadowColor = "rgba(0,0,0,0.1)";
	this.context.shadowOffsetX = 10;
	this.context.shadowOffsetY = 10;
	this.context.shadowBlur = 10;

	//POSITION FLY IN A CORNER
	var corner = Math.floor(Math.random()*4);
	switch(corner){
		case 0:
			this.canvas.style.marginLeft = '1px';
			this.canvas.style.marginTop = '1px';
			break;
		case 1:
			this.canvas.style.marginLeft = window.innerWidth + 'px';
			this.canvas.style.marginTop = '0px';
			break;
		case 2:
			this.canvas.style.marginLeft = window.innerWidth + 'px';
			this.canvas.style.marginTop = window.innerHeight + 'px';
			break;
		case 3:
			this.canvas.style.marginLeft = '0px';
			this.canvas.style.marginTop = window.innerHeight + 'px';
			break;
	}
	if(this.containerid != 'body'){
		document.getElementById(this.containerid).appendChild(this.canvas);
	}else{
		document.body.appendChild(this.canvas);
	}

	//FLY AUDIO
	this.flyaudio = document.createElement('audio');
	this.flyaudio.id = model.id + '_flyaudio';
	this.flyaudio.innerHTML = '<source src="'+this.assetlocation+'/dist/audio/fly.ogg" type="audio/ogg"><source src="'+this.assetlocation+'/dist/audio/fly.mp3" type="audio/mpeg">';
	if(this.containerid != 'body'){
		document.getElementById(this.containerid).appendChild(this.flyaudio);
	}else{
		document.body.appendChild(this.flyaudio);
	}

	//FLY SPLAT AUDIO
	this.flysplataudio = document.createElement('audio');
	this.flysplataudio.id = model.id + '_flysplataudio';
	this.flysplataudio.innerHTML = '<source src="'+this.assetlocation+'/dist/audio/splat.ogg" type="audio/ogg"><source src="'+this.assetlocation+'/dist/audio/splat.mp3" type="audio/mpeg">';
	if(this.containerid != 'body'){
		document.getElementById(this.containerid).appendChild(this.flysplataudio);
	}else{
		document.body.appendChild(this.flysplataudio);
	}

	//FLY ASSETS
	this.flyimg = new Image();
	this.flysplatimg = new Image();
	this.flyaudiomp3 = new Audio();
	this.flyaudioogg = new Audio();
	this.flysplatmp3 = new Audio();
	this.flysplatogg = new Audio();

	//PRELOAD AND START
	this.preloadfilescount = 6;
	this.preloadcount = 0;
	var mythis = this;
	docReady(function(){
		mythis.flyimg.src = mythis.assetlocation + '/dist/img/fly.png';
		mythis.flyimg.onload = mythis.preloaded();
		mythis.flysplatimg.src = mythis.assetlocation + '/dist/img/flysplat.png';
		mythis.flysplatimg.onload = mythis.preloaded();
		mythis.flyaudiomp3.src = mythis.assetlocation+'/dist/audio/fly.mp3';
		mythis.flyaudiomp3.addEventListener('canplaythrough', mythis.preloaded(), false);
		mythis.flyaudioogg.src = mythis.assetlocation+'/dist/audio/fly.ogg';
		mythis.flyaudioogg.addEventListener('canplaythrough', mythis.preloaded(), false);
		mythis.flysplatmp3.src = mythis.assetlocation+'/dist/audio/splat.mp3';
		mythis.flysplatmp3.addEventListener('canplaythrough', mythis.preloaded(), false);
		mythis.flysplatogg.src = mythis.assetlocation+'/dist/audio/splat.ogg';
		mythis.flysplatogg.addEventListener('canplaythrough', mythis.preloaded(), false);
	});

};

Fly.prototype.preloaded = function(){
	this.preloadcount++;
	if(this.preloadcount >= this.preloadfilescount){
		var mythis = this;
		setTimeout(function(){
			mythis.flyIn();
			/*if(mythis.flyaudiomp3.canPlayType && mythis.flyaudiomp3.canPlayType('audio/mpeg;')){}
			if(mythis.flyaudioogg.canPlayType && mythis.flyaudioogg.canPlayType('audio/ogg;')){}*/
		}, Math.floor(Math.random()*1000) + this.startpause);
	}
};

Fly.prototype.drawFly = function(state, angle){
	var framewidth = 50;
	var frameheight = 60;

	this.context.clearRect ( 0 , 0 , this.canvas.width, this.canvas.height );
	this.context.save();
	this.context.translate(
		this.canvas.width*(0.5/this.ratio),
		this.canvas.width*(0.5/this.ratio)
	);
	this.context.rotate(angle);
	this.context.translate(
		-this.canvas.width*(0.5/this.ratio),
		-this.canvas.width*(0.5/this.ratio)
	);

	switch(state){
		case 'flying':
			this.context.drawImage(this.flyimg,
				framewidth*0, 0, framewidth, frameheight,
				this.canvas.width*(0.25/this.ratio),
				this.canvas.height*(0.25/this.ratio),
				framewidth, frameheight
			);
			break;
		case 'normal':
			this.context.drawImage(this.flyimg,
				framewidth*1, 0, framewidth, frameheight,
				this.canvas.width*(0.25/this.ratio),
				this.canvas.height*(0.25/this.ratio),
				framewidth, frameheight
			);
			break;
		case 'wing-twitch-left':
			this.context.drawImage(this.flyimg,
				framewidth*2, 0, framewidth, frameheight,
				this.canvas.width*(0.25/this.ratio),
				this.canvas.height*(0.25/this.ratio),
				framewidth, frameheight
			);
			break;
		case 'wing-twitch-right':
			this.context.drawImage(this.flyimg,
				framewidth*3, 0, framewidth, frameheight,
				this.canvas.width*(0.25/this.ratio),
				this.canvas.height*(0.25/this.ratio),
				framewidth, frameheight
			);
			break;
		case 'rubbing-arms-left':
			this.context.drawImage(this.flyimg,
				framewidth*4, 0, framewidth, frameheight,
				this.canvas.width*(0.25/this.ratio),
				this.canvas.height*(0.25/this.ratio),
				framewidth, frameheight
			);
			break;
		case 'rubbing-arms-right':
			this.context.drawImage(this.flyimg,
				framewidth*5, 0, framewidth, frameheight,
				this.canvas.width*(0.25/this.ratio),
				this.canvas.height*(0.25/this.ratio),
				framewidth, frameheight
			);
			break;
	}

	this.context.restore();
};

Fly.prototype.flyIn = function(){

	this.splattered = false;

	//FADE AUDIO IN
	this.flyaudio.volume = 0;
	if(this.mute === false){ this.flyaudio.play(); }
	var mythis = this;
	mythis.fadeinterval = setInterval(function(){
		if(mythis.flyaudio.volume < 0.25){
			mythis.flyaudio.volume += 0.02;
		}else{
			clearInterval(mythis.fadeinterval);
		}
	}, 20);

	//PICK A TARGET
	this.targetx = Math.floor(Math.random() * (window.innerWidth*0.75) + (window.innerWidth*0.125));
	this.targety = Math.floor(Math.random() * (window.innerHeight*0.75)); // + (window.innerHeight*0.125);
	if(debug){
		this.target.style.marginLeft = this.targetx+'px';
		this.target.style.marginTop = this.targety+'px';
		console.log('target: ' + this.targetx + ' x ' + this.targety);
	}

	//DRAW FLY
	this.angle = Math.atan2(
		this.targety - parseInt(this.canvas.style.marginTop, 10),
		this.targetx - parseInt(this.canvas.style.marginLeft, 10)
	) + (Math.PI/2);
	this.drawFly('flying', this.angle);

	//FLY TO TARGET
	mythis.interval = setInterval(function(){

		//CALCULATE DISTANCE
		var thefly = document.getElementById(mythis.id);
		var dx = mythis.targetx - parseInt(thefly.style.marginLeft, 10);
		var dy = mythis.targety - parseInt(thefly.style.marginTop, 10);

		//MOVE TOWARDS THAT DISTANCE - RANDOMIZE THE PATHWAY
		thefly.style.marginLeft = parseInt(thefly.style.marginLeft, 10) + (dx*0.25) + 'px';
		thefly.style.marginTop = parseInt(thefly.style.marginTop, 10) + (dy*0.25) + 'px';

		//CONVERGE
		if(Math.abs(dx) < 10){
			mythis.drawFly('normal', mythis.angle);
			clearInterval(mythis.interval);
			mythis.flyaudio.pause();
			mythis.landed();
		}

	}, 20);
};

Fly.prototype.landed = function(){

	//FLY CLICK
	var mythis = this;
	if(iOS){
		this.canvas.addEventListener("touchstart", function(e){
			mythis.splat();
		}, false);
	}else{
		this.canvas.addEventListener("mousedown", function(e){
			mythis.splat();
		}, false);
	}

	//
	//IF MOUSE CLOSE TO FLY, FLY AWAY
	/*document.onmousemove = handleMouseMove;
	function handleMouseMove(event) {
		var dot, eventDoc, doc, body, pageX, pageY;
		event = event || window.event;
		if(event.pageX === null && event.clientX !== null) {
			eventDoc = (event.target && event.target.ownerDocument) || document;
			doc = eventDoc.documentElement;
			body = eventDoc.body;
			event.pageX = event.clientX +
				(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
				(doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY +
				(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
				(doc && doc.clientTop  || body && body.clientTop  || 0 );
		}
		//console.log(event.pageX);
	}*/

	this.nextaction();

};

Fly.prototype.nextaction = function(){

	if(this.currentnextaction < this.nextactionmaxcount-1){
		var next = Math.floor(Math.random() * 3);
		var mythis = this;
		setTimeout(function(){
			switch(next){
				case 0:
					mythis.rubhands();
					//console.log('rubhands');
					break;
				case 1:
					mythis.wingstwitch();
					//console.log('wingstwitch');
					break;
				case 2:
					mythis.walkforward();
					//console.log('walkforward');
					break;
			}
		}, Math.round(Math.random() * 200) + 200);

		this.currentnextaction++;
	}else{
		this.currentnextaction = 0;
		this.flyaway();
	}

};

Fly.prototype.actiondone = function(){
	if(!this.splattered){
		var mythis = this;
		mythis.drawFly('normal', mythis.angle);
		setTimeout(mythis.nextaction(), Math.round(Math.random()*50) + 50);
	}
};

Fly.prototype.rubhands = function(){

	//RUB HANDS TOGETHER
	var rubcount = Math.round(Math.random() * 10)+10;
	var currentrub = 0;
	var currentarm = false;
	var mythis = this;
	rubtoggle(mythis);
	function rubtoggle(mythis){
		if(!this.splattered){
			if(currentarm){
				currentarm = false;
				mythis.drawFly('rubbing-arms-left', mythis.angle);
			}else{
				currentarm = true;
				mythis.drawFly('rubbing-arms-right', mythis.angle);
			}
			setTimeout(function(){
				if(currentrub < rubcount-1){
					currentrub++;
					rubtoggle(mythis);
				}else{
					mythis.actiondone();
				}
			}, Math.round(Math.random()*50) + 50);
		}
	}
};

Fly.prototype.wingstwitch = function(){

	//WINGS TWITCH
	var twitchcount = Math.round(Math.random() * 3)+3;
	var currenttwitch = 0;
	var currentwing = false;
	var mythis = this;
	twitchtoggle(mythis);
	function twitchtoggle(mythis){
		if(!this.splattered){
			if(currentwing){
				currentwing = false;
				mythis.drawFly('wing-twitch-left', mythis.angle);
			}else{
				currentwing = true;
				mythis.drawFly('wing-twitch-right', mythis.angle);
			}
			setTimeout(function(){
				if(currenttwitch < twitchcount-1){
					currenttwitch++;
					twitchtoggle(mythis);
				}else{
					mythis.actiondone();
				}
			}, Math.round(Math.random()*70) + 30);
		}
	}
};

Fly.prototype.walkforward = function(){

	//WALK FORWARD
	var stepcount = Math.round(Math.random() * 4)+2;
	var currentstep = 0;
	var mythis = this;
	var thefly = document.getElementById(mythis.id);
	steptoggle(mythis);
	function steptoggle(mythis){
		if(!this.splattered){
			mythis.newangle = mythis.angle + ((Math.round(Math.random()*90) - 45) * (Math.PI/180));
			var newdistance = Math.round(Math.random()*40) + 20;

			var cosval = Math.cos(mythis.newangle - (Math.PI/2))*newdistance;
			var sinval = Math.sin(mythis.newangle - (Math.PI/2))*newdistance;
			mythis.newposx = parseInt(thefly.style.marginLeft, 10) + cosval;
			mythis.newposy = parseInt(thefly.style.marginTop, 10) + sinval;

			mythis.angle = mythis.newangle;

			mythis.drawFly('normal', mythis.newangle);
			thefly.style.marginLeft = mythis.newposx + 'px';
			thefly.style.marginTop = mythis.newposy + 'px';

			setTimeout(function(){
				if(currentstep < stepcount-1){
					currentstep++;
					steptoggle(mythis);
				}else{
					mythis.actiondone();
				}
			}, Math.round(Math.random()*50) + 50);
		}
	}
};

Fly.prototype.flyaway = function(){
	document.onmousemove = null;

	//FADE AUDIO IN
	this.flyaudio.volume = 0;
	if(this.mute === false){ this.flyaudio.play(); }
	var mythis = this;
	mythis.fadeinterval = setInterval(function(){
		if(mythis.flyaudio.volume < 0.25){
			mythis.flyaudio.volume += 0.02;
		}else{
			clearInterval(mythis.fadeinterval);
		}
	}, 20);

	//FLY AWAY
	var thefly = document.getElementById(mythis.id);
	mythis.drawFly('flying', mythis.angle);
	mythis.interval = setInterval(function(){
		if(!this.splattered){
			var cosval = Math.cos(mythis.angle - (Math.PI/2))*50;
			var sinval = Math.sin(mythis.angle - (Math.PI/2))*50;
			mythis.newposx = parseInt(thefly.style.marginLeft, 10) + cosval;
			mythis.newposy = parseInt(thefly.style.marginTop, 10) + sinval;
			thefly.style.marginLeft = mythis.newposx + 'px';
			thefly.style.marginTop = mythis.newposy + 'px';

			if(
				(parseInt(thefly.style.marginLeft, 10) <= -200)||(parseInt(thefly.style.marginLeft, 10) >= window.innerWidth)||(parseInt(thefly.style.marginTop, 10) <= -200)||(parseInt(thefly.style.marginTop, 10) >= window.innerHeight)
			){
				clearInterval(mythis.interval);
				mythis.flyaudio.pause();
				setTimeout(function(){
					mythis.flyIn();
				}, Math.round(Math.random()*1000) + mythis.startpause);
			}
		}
	}, 10);
};

Fly.prototype.splat = function(){
	if(!this.splattered){
		this.splattered = true;
		this.canvas.style.display = 'none';

		//SPLAT CANVAS
		this.canvas_splat = document.createElement('canvas');
		this.context_splat = this.canvas_splat.getContext('2d');
		this.canvas_splat.id = this.id+'-splat-'+Math.round(Math.random()*10000);
		this.canvas_splat.style.position = 'absolute';
		this.canvas_splat.style.zIndex = 900; //10000
		this.canvas_splat.width = 200;
		this.canvas_splat.height = 200;
		//this.canvas_splat.style.background = '#000';
		this.canvas_splat.style.marginLeft = (parseInt(this.canvas.style.marginLeft, 10)-50) + 'px';
		this.canvas_splat.style.marginTop = (parseInt(this.canvas.style.marginTop, 10)-50) + 'px';
		if(this.devicePixelRatio !== this.backingStoreRatio){
			var oldWidth = this.canvas_splat.width;
			var oldHeight = this.canvas_splat.height;
			this.canvas_splat.width = oldWidth * this.ratio;
			this.canvas_splat.height = oldHeight * this.ratio;
			this.canvas_splat.style.width = oldWidth + 'px';
			this.canvas_splat.style.height = oldHeight + 'px';
			this.context_splat.scale(this.ratio, this.ratio);
		}
		if(this.containerid != 'body'){
			document.getElementById(this.containerid).appendChild(this.canvas_splat);
		}else{
			document.body.appendChild(this.canvas_splat);
		}

		//DRAW SPLAT
		this.drawSplatFly();
		if(this.mute === false){ this.flysplataudio.play(); }

		//REMOVE AND RE-INITIALIZE
		var mythis = this;
		setTimeout(function(){
			mythis.canvas.remove();
			setTimeout(function(){
				var NewFly = new Fly({
					id:mythis.id,
					assetlocation:mythis.assetlocation,
					containerid:mythis.containerid,
					startpause:mythis.startpause,
					mute:mythis.mute,
					score:mythis.score,
				});
			}, Math.round(Math.random()*1000) + mythis.startpause);

		}, 1000);

		//UPDATE SCOREBOARD
		if(this.score){
			document.getElementById('scoreboard').innerHTML = 'Score: ' + (score + 1);
			score++;
		}

		trackEvent('splat', 'splat');
	}
};

Fly.prototype.drawSplatFly = function(){
	var framewidth = 100;
	var frameheight = 100;
	var splatvariations = 5;
	var splatiteration = Math.floor( Math.random() * splatvariations);

	this.context_splat.clearRect ( 0 , 0 , this.canvas_splat.width, this.canvas_splat.height );
	this.context_splat.save();
	this.context_splat.translate(
		this.canvas_splat.width*(0.5/this.ratio),
		this.canvas_splat.width*(0.5/this.ratio)
	);
	this.context_splat.rotate(this.angle);
	this.context_splat.translate(
		-this.canvas_splat.width*(0.5/this.ratio),
		-this.canvas_splat.width*(0.5/this.ratio)
	);
	this.context_splat.drawImage(this.flysplatimg,
		framewidth*splatiteration, 0, framewidth, frameheight,
		this.canvas_splat.width*(0.25/this.ratio),
		this.canvas_splat.height*(0.25/this.ratio),
		framewidth, frameheight
	);
	this.context_splat.restore();
};

//ONREADY TAKED FROM JQUERY
(function(funcName, baseObj) {
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;
    function ready() {
        if (!readyFired) {
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            readyList = [];
        }
    }
    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }
    baseObj[funcName] = function(callback, context) {
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            readyList.push({fn: callback, ctx: context});
        }
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", ready, false);
                window.addEventListener("load", ready, false);
            } else {
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    };
})("docReady", window);


function trackEvent(action, label){
	//ga('send', 'event', 'FlySplatter', action, label);
	//console.log('ga: ' + action + ' ' + label);
}
