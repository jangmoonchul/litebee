//var serial_info = {type: 'serial'};
/*	*/


(function(ext){
    var connected = false;
    var notifyConnection = false;
	var poller = null;
    var device = null;
	var dirFlag = "";
	var flightFlag = "";
	var dirSpeed;
	var flightSpeed;
	var trimPitch = 0;
	var trimRoll = 0;
	var lang = 'zh';
	var blocks = {
		en:[
			[' ', 'Calibrate', 'calibrate'],
            [' ', 'LED %d.led %d.onoff','runLed','ALL','ON'],
			[' ', 'colorLight %d.color','colorLed','BLACK'],
			[' ', 'buzzer buzz %d.beep','beeper',"OFF"],
            [' ', 'Arm Flight','armFlight'],
			[' ', 'Disarm Flight','disarmFlight'],
            [' ', 'Set run Motor %d.motorQuad at speed %d.motorPWM','runMotor', "LF", 0],
            [' ', 'Set go %d.flightDir at speed %d','runDirection', "Forward", 100],
            [' ', 'Set rotate %d.flightRotate at speed %d','runRotate', "CR", 100],
            [' ', 'Set altitude %d.flightAltitude at speed %d','runAltitude','UP',100],
			[' ', 'Set trim: pitch add %d.trimValue and roll add %d.trimValue', 'trimPitchAndRoll', 0, 0],
			[' ', 'Run set motor','runSet'],
			[' ', 'open altitude hold mode %d.openAndClose','altMode','OPEN'],
			['r', 'Throttle', 'thr'],
			['r', 'Pitch', 'pitch'],
			['r', 'Roll', 'roll'],
			['r', 'Yaw', 'yaw'],
			['r', 'YawAngle', 'yAngle'],
			['r', 'RollAngle', 'rAngle'],
			['r', 'PitchAngle', 'pAngle']
		],
		zh:[
			[' ', '校准', 'calibrate'],
            [' ', '让LED %d.led 灯 %d.onoff','runLed','所有','亮'],
			[' ', '让彩色灯亮 %d.color','colorLed','黑色'],
			[' ', '让蜂鸣器 %d.beep','beeper','关闭'],
            [' ', '电机解锁','armFlight'],
			[' ', '电机上锁','disarmFlight'],
            [' ', '设置 %d.motorQuad 的电机的转速为 %d.motorPWM','runMotor', "左前方", 0],
            [' ', '设置让飞机往 %d.flightDir 以速度 %d 飞行','runDirection', "前边", 100],
            [' ', '设置让飞机往 %d.flightRotate 以速度 %d 旋转','runRotate', "顺时针", 100],
            [' ', '设置让飞机往 %d.flightAltitude 以速度 %d 飞','runAltitude','上',100],
			[' ', '设置飞机 俯仰方向微调增加 %d.trimValue ，横滚方向微调增加 %d.trimValue', 'trimPitchAndRoll', 0, 0],
			[' ', '运行之前的设置','runSet'],
			[' ', '%d.openAndClose 定高模式','altMode','打开'],
			['r', '油门', 'thr'],
			['r', '俯仰', 'pitch'],
			['r', '横滚', 'roll'],
			['r', '航向', 'yaw'],
			['r', '航向角', 'yAngle'],
			['r', '横滚角', 'rAngle'],
			['r', '俯仰角', 'pAngle']
		]
	}
	var menus = {
		en:{
			onoff: ['ON', 'OFF'],
            led:['ALL','A','B','C','D'],
            motorQuad:["LF","RF","LB","RB","ALL"],
            motorPWM:[0,100,300,600],
            flightDir:['Forward',"Backward","Left","Right"],
            flightRotate:['CR','CCR'],
            flightAltitude:['UP','DOWN'],
			trimValue:[-60,-40,-20,-10,0,10,20,40,60],
			openAndClose:['OPEN','CLOSE'],
			color:["BLACK","WHITE","RED","ORANGE","YELLOW","GREEN","BLUE","PINK","VIOLET"],
			beep:["ON","OFF","LESS","MEDIUM","MORE"],
		},
		zh:{
			onoff: ['亮', '灭'],
            led:['所有','A','B','C','D'],
            motorQuad:["左前方","右前方","左后方","右后方","所有"],
            motorPWM:[0,100,300,600],
            flightDir:['前边',"后边","左边","右边"],
            flightRotate:['顺时针','逆时针'],
            flightAltitude:['上','下'],
			trimValue:[-60,-40,-20,-10,0,10,20,40,60],
			openAndClose:['打开','关闭'],
			color:['黑色','白色','红色','橙色','黄色','绿色','蓝色','粉色','紫色'],
			beep:["常开","关闭","短鸣","中鸣","长鸣"],
		}
	}
	
    ext._getStatus = function() {
		
        if (!connected){
            sendMsg({'proto':'probe'}); // check if host app online
            return { status:1, msg:'Disconnected' };
        }else{
            return { status:2, msg:'Connected' };
        }
		
		if(!device) return {status: 1, msg: 'disconnected'};
        return {status: 2, msg: 'connected'};
    };

    ext._deviceRemoved = function(dev) {
        console.log('Device removed');
		if(device != dev) return;
		if(poller) poller = clearInterval(poller);
		device = null;
        // Not currently implemented with serial devices
    };
	
	
	
    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        console.log("Device Connected "+dev.id);
		
    };
	
    ext._shutdown = function() {
        // TODO: Bring all pins down
        if (device) device.close();
        if (poller) clearInterval(poller);
        device = null;
    };

    ext.armFlight = function(){
        console.log("arm flight ");
        sendMsg({'proto':'arm'}); // arm quadcopter
    };
	
	ext.disarmFlight = function(){
        console.log("disarm flight ");
        sendMsg({'proto':'disarm'}); // disarm quadcopter
		
    };

    ext.calibrate = function(){
        sendMsg({'proto':'calibrate'}); // calibrate quadcopter
    };

    ext.runMotor =  function(motor, speed){
        console.log("run motor "+motor+" "+speed);
		if(motor == menus.zh.motorQuad[0]){
			motor = menus.en.motorQuad[0];
		}else if(motor == menus.zh.motorQuad[1]){
			motor = menus.en.motorQuad[1];
		}else if(motor == menus.zh.motorQuad[2]){
			motor = menus.en.motorQuad[2];
		}else if(motor == menus.zh.motorQuad[3]){
			motor = menus.en.motorQuad[3];
		}else if(motor == menus.zh.motorQuad[4]){
			motor = menus.en.motorQuad[4];
		}
		sendMsg({'proto':'runMotor','motor':motor,'speed':speed}); // runMotor quadcopter
    };

    ext.runLed = function(led,onoff){
        console.log("run led "+led+" "+onoff);
		if(led == menus.zh.led[0]){
			led = "ALL";
		}
		if(onoff == "亮"){
			onoff = "ON";
		}else if(onoff == "灭"){
			onoff = "OFF";
		}
        sendMsg({'proto':'runLed','led':led,'onoff':onoff});
    };
	
	ext.colorLed = function(color){
		console.log("color:" + color);
		if(color == menus.zh.color[0]){
			color = menus.en.color[0];
		}else if(color == menus.zh.color[1]){
			color = menus.en.color[1];
		}else if(color == menus.zh.color[2]){
			color = menus.en.color[2];
		}else if(color == menus.zh.color[3]){
			color = menus.en.color[3];
		}else if(color == menus.zh.color[4]){
			color = menus.en.color[4];
		}else if(color == menus.zh.color[5]){
			color = menus.en.color[5];
		}else if(color == menus.zh.color[6]){
			color = menus.en.color[6];
		}else if(color == menus.zh.color[7]){
			color = menus.en.color[7];
		}else if(color == menus.zh.color[8]){
			color = menus.en.color[8];
		}
		sendMsg({'proto':'colorLed','color':color});
	}
	
	ext.beeper = function(time){
		console.log("beep:"+time);
		if(time == menus.zh.beep[0]){
			time = menus.en.beep[0];
		}else if(time == menus.zh.beep[1]){
			time = menus.en.beep[1];
		}else if(time == menus.zh.beep[2]){
			time = menus.en.beep[2];
		}else if(time == menus.zh.beep[3]){
			time = menus.en.beep[3];
		}else if(time == menus.zh.beep[4]){
			time = menus.en.beep[4];
		}
		sendMsg({'proto':'beeper','time':time});
	}
	
	ext.runDirection = function(dir,speed) {
		console.log("run flight direction "+dir+" "+speed);
		if(dir == menus.zh.flightDir[0]){
			dir = menus.en.flightDir[0]
		}else if(dir == menus.zh.flightDir[1]){
			dir = menus.en.flightDir[1]
		}else if(dir == menus.zh.flightDir[2]){
			dir = menus.en.flightDir[2]
		}else if(dir == menus.zh.flightDir[3]){
			dir = menus.en.flightDir[3]
		}
        sendMsg({'proto':'runDirection','flightDir':dir,'speed':speed});
		dirSpeed = speed;
		dirFlag = dir;
	};
	
	ext.runRotate = function(rotate,speed) {
		console.log("run flight rotate "+rotate+" "+speed);
		if(rotate == "顺时针"){
			rotate = "CR";
		}else if(rotate == "逆时针"){
			rotate = "CCR";
		}
        sendMsg({'proto':'runRotate','flightRotate':rotate,'speed':speed});
	};
	
	ext.runAltitude = function(altitude,speed) {
		console.log("run altitude "+altitude+" "+speed);
		if(altitude == "上"){
			altitude = 'UP';
		}else if(altitude == "下"){
			altitude = 'DOWN';
		}
        sendMsg({'proto':'runAltitude','flight':altitude,'speed':speed});
		flightSpeed = speed;
		flightFlag = altitude;
	};
	
	ext.trimPitchAndRoll = function(pitch, roll) {
		trimPitch = pitch;
		trimRoll = roll;
		console.log('pitch: '+trimPitch + "  roll:"+trimRoll);
		sendMsg({'proto':'trimPitchAndRoll','trimPitch':trimPitch,'trimRoll':trimRoll});
	};
	ext.runSet = function() {
		console.log("run Set"+trimPitch+" "+trimRoll);
        sendMsg({'proto':'runSet','dirFlag':dirFlag,"flightFlag":flightFlag,'dirSpeed':dirSpeed,"flightSpeed":flightSpeed,"trimPitch":trimPitch,"trimRoll":trimRoll});
		dirFlag = "";
		flightFlag = "";
	};
	
	var flightData = new Object();
	var port = chrome.runtime.connect('hemahponoooggniochchkkbldlgkdaga',{name: "LiteBee"});
	//var port = chrome.runtime.connect('ojkmijfhdabdfcifimpafffjhjoknaki',{name: "LiteBee"});
	//port.postMessage({joke: "Knock knock"});
	port.onMessage.addListener(function(msg) {
		if (msg.greeting == "hello")
			console.log("hello~");
		else if (msg)
		{
			console.log(msg);
			flightData = msg;
		}
	});

	ext.thr = function() {
		return Number(flightData.thrStick);
	};
	ext.yaw = function() {
		return Number(flightData.yawStick);
	};
	ext.roll = function() {
		return Number(flightData.rollStick);
	};
	ext.pitch = function() {
		return Number(flightData.pitchStick);
	};
	ext.pAngle = function() {
		return Number(flightData.pitch);
	};
	ext.yAngle = function() {
		return Number(flightData.yaw);
	};
	ext.rAngle = function() {
		return Number(flightData.roll);
	};
	ext.altMode = function(altFlag) {
		if(altFlag == '打开'){
			sendMsg({'proto':'altMode','mode':'OPEN'});
		}else if(altFlag == '关闭'){
			sendMsg({'proto':'altMode','mode':'CLOSE'});
		}else{
			sendMsg({'proto':'altMode','mode':altFlag});
		}
	}

    function processInput(msg) {
        console.log("Input "+msg.proto);
        if(msg.proto=='online'){
            connected = true;
        }
    }

    function sendMsg(msg){
        //console.log("send msg: "+msg);
        //chrome.runtime.sendMessage('ojkmijfhdabdfcifimpafffjhjoknaki', msg, processInput)
		chrome.runtime.sendMessage('hemahponoooggniochchkkbldlgkdaga', msg, processInput)
    }
	
	var paramString = window.location.search.replace(/^\?|\/$/g, '');
	var vars = paramString.split("&");
	for (var i=0; i<vars.length; i++) {
		var pair = vars[i].split('=');
			if (pair.length > 1 && pair[0]=='lang')
				console.log(lang);
			  //lang = pair[1];
	}
    // Block and block menu descriptions
	
    var descriptor = {
        blocks: blocks[lang],
        menus: menus[lang],

        url: 'http://www.litebee.com/'
    };

    // Register the extension
    ScratchExtensions.register('litebee', descriptor, ext);

})({});





