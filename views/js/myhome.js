//--------------------------------
var homeStatus = {
	homeRegistered: true,//
	atHome:true, 
	roomLights1:false, roomLights2:false, roomLights3:false, roomLights4:false, 
	lightSensor:true, lightSensorValue:false, outdoorLights:false, 
	fireSensor:true, hasFire:false
};
var lightsAction = {"roomLights1":null, "roomLights2":null, "roomLights3":null, "roomLights4":null, "outdoorLights":null};
//--------------------------------
var gConfig = {};
window.gConfig = gConfig;
gConfig.imgPath = "assets/";
gConfig.homeID = "";
gConfig.getHomeID = false;
//
window.onload = function(){
	gameModule();
	//
	//socket = io({'reconnection':false,'force new connection': true});
	//socket = io.connect('http://localhost:8080/',{'reconnection':false,'force new connection': true});
	socket = io.connect('http://smart-home-demo-a1.0ec9.hackathon.openshiftapps.com/',{'reconnection':false,'force new connection': true});
	socket.on('connect', function(s){console.log("S-connect");
		socket.removeEventListener('connect');
		socket.emit('homeRegister', homeStatus);
	});
	//
	socket.on('join-homeID', function(data){
		gConfig.homeID = data;
		game.gameScene.mask.x = gameFun.SCREEN_WIDTH;
		game.gameScene.mssLb.opacity = 0;
		setTimeout(function(){
			gConfig.getHomeID = true;
			alert("Home ID: "+gConfig.homeID);
		}, 1000);
	});
	//
	socket.on('action-ServerToHome', function(data){
		console.log("action-ServerToHome:"+data.action+"="+data.value);
		if(!homeStatus.hasOwnProperty(data.action))return;
		homeStatus[data.action] = data.value;
		//callback-HomeToServer
		socket.emit('callback-HomeToServer', data);
		//
		if(lightsAction.hasOwnProperty(data.action)){
			lightsAction[data.action].opacity = data.value? 1: 0;
		}
		//
		if(data.action == "lightSensor"){
			lightSensorLbValue.text = data.value? "On" : "Off";
			lightSensorLbValue.color =  data.value? "#ffff00" : "#ff0000";
			//
			if(data.value){
				homeStatus.outdoorLights = homeStatus.lightSensorValue;
				socket.emit('action-HomeToServer', {"action":"outdoorLights", "value":homeStatus.outdoorLights});
				lightsAction["outdoorLights"].opacity = homeStatus.outdoorLights? 1: 0;
			}
		} else if(data.action == "fireSensor"){
			fireSensorLbValue.text = data.value? "On" : "Off";
			fireSensorLbValue.color =  data.value? "#ffff00" : "#ff0000";
			if(homeStatus.fireSensor && homeStatus.hasFire)socket.emit('action-HomeToServer', {"action":"hasFire", "value":homeStatus.hasFire});
		}
	});
	//
	socket.on('disconnect', function(){
		console.log('disconnect');
		game.gameScene.mask.x = 0;
		game.gameScene.mssLb.text = "Connection errors";
		game.gameScene.mssLb.opacity = 1;
	});
};

//---------------------------------
var gameModule = function(){
phonegame();
var gameFun = {};
window.gameFun = gameFun;
gameFun.SCREEN_WIDTH = 800;
gameFun.SCREEN_HEIGHT = 600;
window.game = null;

//
var IMG_BG 						= gConfig.imgPath + "bg.jpg";
var IMG_BG2 					= gConfig.imgPath + "bg2.jpg";
var IMG_L1 						= gConfig.imgPath + "lights1.png";
var IMG_L2 						= gConfig.imgPath + "lights2.png";
var IMG_L3 						= gConfig.imgPath + "lights3.png";
var IMG_L4 						= gConfig.imgPath + "lights4.png";
var IMG_L5 						= gConfig.imgPath + "lights5.png";
var IMG_BT1 					= gConfig.imgPath + "bt1.png";
var IMG_LBT 					= gConfig.imgPath + "light-bt.png";
var IMG_FBT 					= gConfig.imgPath + "fire-bt.png";
var IMG_FIRE 					= gConfig.imgPath + "fireB.png";

//
var lightsSensorLbValue = fireSensorLbValue = null;


//******************************************************************

//window.onload = function() {
    game = new Game(gameFun.SCREEN_WIDTH, gameFun.SCREEN_HEIGHT);//vs2
	game.fps = 24;
	game.preload(IMG_BG,IMG_BG2,IMG_L1,IMG_L2,IMG_L3,IMG_L4,IMG_L5,IMG_BT1,IMG_LBT,IMG_FBT,IMG_FIRE);
    game.onload = function() {
		gameFun.CreateGameScene();
    };
    game.start();
	//
	window.onresize = function(event) {
		game.width = gameFun.SCREEN_WIDTH;
		game.height = gameFun.SCREEN_HEIGHT;
		game.scale = Math.min(
			window.innerWidth / game.width,
			window.innerHeight / game.height
		);
		game._element.style.left = (window.innerWidth - game.width * game.scale) / 2 + "px";
		game._element.style.top = (window.innerHeight - game.height * game.scale) / 2 + "px";
		game._pageX = game._element.getBoundingClientRect().left;
		game._pageY = game._element.getBoundingClientRect().top;
		//
		game._element.style.width = Math.floor(game.width * game.scale) + 'px';
		game._element.style.height = Math.floor(game.height * game.scale) + 'px';
		var scene;
		for (var i = 0, l = game._scenes.length; i < l; i++) {
			scene = game._scenes[i];
			scene._element.style.width = Math.floor(game.width) + 'px';
			scene._element.style.height = Math.floor(game.height) + 'px';
			scene._element.style[phonegame.ENV.VENDOR_PREFIX + 'Transform'] = 'scale(' + game.scale + ')';
			if(scene.onresize)scene.onresize();
		}
	}
//};

//gameFun.CreateGameScene *****************************************************************************************************************
gameFun.CreateGameScene = function(){
	game.gameScene = new Scene();
	//
	var bg = new Sprite(gameFun.SCREEN_WIDTH, gameFun.SCREEN_HEIGHT);
	bg.touchEnabled = false;
	bg.image = game.assets[IMG_BG];
	game.gameScene.addChild(bg);
	//
	var lights1 = new Sprite(140, 130);
	lights1.x = 159;
	lights1.y = 151;
	lights1.opacity = 0;
	lights1.image = game.assets[IMG_L1];
	game.gameScene.addChild(lights1);
	//
	var lights2 = new Sprite(192, 240);
	lights2.x = 275;
	lights2.y = 142;
	lights2.opacity = 0;
	lights2.image = game.assets[IMG_L2];
	game.gameScene.addChild(lights2);
	//
	var lights3 = new Sprite(200, 240);
	lights3.x = 428;
	lights3.y = 144;
	lights3.opacity = 0;
	lights3.image = game.assets[IMG_L3];
	game.gameScene.addChild(lights3);
	//
	var lights4 = new Sprite(303, 198);
	lights4.x = 428;
	lights4.y = 186;
	lights4.opacity = 0;
	lights4.image = game.assets[IMG_L4];
	game.gameScene.addChild(lights4);
	//
	var lights5 = new Sprite(gameFun.SCREEN_WIDTH, gameFun.SCREEN_HEIGHT);
	lights5.opacity = 0;
	lights5.image = game.assets[IMG_L5];
	game.gameScene.addChild(lights5);
	//
	lightsAction.roomLights1 = lights1;
	lightsAction.roomLights2 = lights2;
	lightsAction.roomLights3 = lights3;
	lightsAction.roomLights4 = lights4;
	lightsAction.outdoorLights = lights5;
	
	//
	var lightSensorBg = new Sprite(182, 46);
	lightSensorBg.backgroundColor = "#1c1c1c";
	lightSensorBg.y = gameFun.SCREEN_HEIGHT-48;
	game.gameScene.addChild(lightSensorBg);
		//
		var lightSensorLb = new Label("light Sensor:");
		lightSensorLb.font = "22px Arial,Helvetica,sans-serif";
		//lightSensorLb.textAlign = "center";
		lightSensorLb.color = "#ffffff";
		lightSensorLb.x = 10;
		lightSensorLb.y = gameFun.SCREEN_HEIGHT-36;
		lightSensorLb.touchEnabled = false; 
		game.gameScene.addChild(lightSensorLb);
		//
		lightSensorLbValue = new Label("On");
		lightSensorLbValue.font = "22px Arial,Helvetica,sans-serif";
		lightSensorLbValue.color = "#ffff00";
		lightSensorLbValue.x = 145;
		lightSensorLbValue.y = gameFun.SCREEN_HEIGHT-36;
		game.gameScene.addChild(lightSensorLbValue);
	//
	var fireSensorBg = new Sprite(172, 46);
	fireSensorBg.backgroundColor = "#1c1c1c";
	fireSensorBg.x = 190;
	fireSensorBg.y = gameFun.SCREEN_HEIGHT-48;
	game.gameScene.addChild(fireSensorBg);
		//
		var fireSensorLb = new Label("fire Sensor:");
		fireSensorLb.font = "22px Arial,Helvetica,sans-serif";
		//fireSensorLb.textAlign = "center";
		fireSensorLb.color = "#ffffff";
		fireSensorLb.x = 10+190;
		fireSensorLb.y = gameFun.SCREEN_HEIGHT-36;
		fireSensorLb.touchEnabled = false; 
		game.gameScene.addChild(fireSensorLb);
		//
		fireSensorLbValue = new Label("On");
		fireSensorLbValue.font = "22px Arial,Helvetica,sans-serif";
		fireSensorLbValue.color = "#ffff00";
		fireSensorLbValue.x = 135+190;
		fireSensorLbValue.y = gameFun.SCREEN_HEIGHT-36;
		game.gameScene.addChild(fireSensorLbValue);
	//
	
	
	//
	var light_bt = new Sprite(48, 48);
	light_bt.x = 190+172+20;
	light_bt.y = gameFun.SCREEN_HEIGHT-50;
	light_bt.image = game.assets[IMG_LBT];
	light_bt.frame = 1;
	game.gameScene.addChild(light_bt);
		light_bt.addEventListener( "touchstart", function(){
			this.frame = this.frame==0? 1 : 0;
			if(this.frame == 0){
				bg.image = game.assets[IMG_BG2];
			} else{
				bg.image = game.assets[IMG_BG];
			}
			//
			this.checked = this.frame==0? true : false;
			if(homeStatus.lightSensorValue == this.checked)return;
			homeStatus.lightSensorValue = this.checked;
			socket.emit('action-HomeToServer', {"action":"lightSensorValue", "value":homeStatus.lightSensorValue});
			if(homeStatus.lightSensor){
				if(homeStatus.outdoorLights != homeStatus.lightSensorValue){
					homeStatus.outdoorLights = homeStatus.lightSensorValue;
					socket.emit('action-HomeToServer', {"action":"outdoorLights", "value":homeStatus.outdoorLights});
					lightsAction["outdoorLights"].opacity = homeStatus.outdoorLights? 1: 0;
				}
			}
		});
	//
	var fire_bt = new Sprite(48, 48);
	fire_bt.x = 190+172+50+30;
	fire_bt.y = gameFun.SCREEN_HEIGHT-50;
	fire_bt.image = game.assets[IMG_FBT];
	game.gameScene.addChild(fire_bt);
		fire_bt.addEventListener( "touchstart", function(){
			this.frame = this.frame==0? 1 : 0;
			fireMc.opacity = this.frame;
			//
			homeStatus.hasFire = this.frame==1? true : false;
			socket.emit('action-HomeToServer', {"action":"hasFire", "value":homeStatus.hasFire});
		});
	//
	var get_bt = new Sprite(84, 48);
	get_bt.x = 190+172+120+30;
	get_bt.y = gameFun.SCREEN_HEIGHT-50;
	get_bt.image = game.assets[IMG_BT1];
	game.gameScene.addChild(get_bt);
		get_bt.addEventListener( "touchstart", function(){
			gConfig.getHomeID = true;
			alert("Home ID: "+gConfig.homeID);
		});
	//
	var fireMc = new Sprite(240, 260);
	fireMc.x = 230;
	fireMc.y = 80;
	fireMc.opacity = 0;
	fireMc.image = game.assets[IMG_FIRE];
	game.gameScene.addChild(fireMc);
		fireMc.addEventListener( "enterframe", function(){
			if(this.opacity==1 && game.frame%2==0)this.rotation = -5+rand(10);
		});
		
	//
	game.gameScene.mask = new Sprite(gameFun.SCREEN_WIDTH, gameFun.SCREEN_HEIGHT);
	game.gameScene.mask.backgroundColor = "#000000";
	game.gameScene.mask.opacity = 0.5;
	game.gameScene.addChild(game.gameScene.mask);
		//
		game.gameScene.mssLb = new Label("Connecting...");
		game.gameScene.mssLb.font = "22px Arial,Helvetica,sans-serif";
		game.gameScene.mssLb.textAlign = "center";
		game.gameScene.mssLb.color = "#ff0000";
		game.gameScene.mssLb.x = (gameFun.SCREEN_WIDTH-320)/2;
		game.gameScene.mssLb.y = gameFun.SCREEN_HEIGHT-150;
		game.gameScene.addChild(game.gameScene.mssLb);
	
	//
	game.pushScene(game.gameScene);
};
//end gameFun.CreateGameScene *************************************************************************************************


//@ rand
var rand = function(num){return Math.floor(Math.random()*num)};
};