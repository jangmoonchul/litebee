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
	var trimPitch;
	var trimRoll;

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
		sendMsg({'proto':'runMotor','motor':motor,'speed':speed}); // runMotor quadcopter
    };

    ext.runLed = function(led,onoff){
        console.log("run led "+led+" "+onoff);
        sendMsg({'proto':'runLed','led':led,'onoff':onoff});
    };
	
	ext.runDirection = function(dir,speed) {
		console.log("run flight direction "+dir+" "+speed);
        sendMsg({'proto':'runDirection','flightDir':dir,'speed':speed});
		dirSpeed = speed;
		dirFlag = dir;
	};
	
	ext.runRotate = function(rotate,speed) {
		console.log("run flight rotate "+rotate+" "+speed);
        sendMsg({'proto':'runRotate','flightRotate':rotate,'speed':speed});
	};
	
	ext.runAltitude = function(altitude,speed) {
		console.log("run altitude "+altitude+" "+speed);
        sendMsg({'proto':'runAltitude','flight':altitude,'speed':speed});
		flightSpeed = speed;
		flightFlag = altitude;
	};
	
	ext.trimPitchAndRoll = function(pitch, roll) {
		trimPitch = pitch;
		trimRoll = roll;
		console.log('pitch: '+trimPitch + "  roll:"+trimRoll);
		sendMessage({'proto':'trimPitchAndRoll','trimPitch':trimPitch,'trimRoll':trimRoll});
	};
	ext.runSet = function() {
		console.log("run Set"+trimPitch+" "+trimRoll);
        sendMsg({'proto':'runSet','dirFlag':dirFlag,"flightFlag":flightFlag,'dirSpeed':dirSpeed,"flightSpeed":flightSpeed,"trimPitch":trimPitch,"trimRoll":trimRoll});
		dirFlag = "";
		flightFlag = "";
	};
	
	var strData = new Object();
	var port = chrome.runtime.connect('lohclnpicjahbccciannbegiamdbgeln',{name: "LiteBee"});
	//port.postMessage({joke: "Knock knock"});
	port.onMessage.addListener(function(msg) {
		if (msg.greeting == "hello")
			console.log("hello~");
		else if (msg)
		{
			console.log(msg);
			strData = msg.data;
			strData = eval("("+strData+")");//string to object
		}
	});

	ext.thr = function() {
		return strData.thr;
	};
	ext.yaw = function() {
		return strData.yaw;
	};
	ext.roll = function() {
		return strData.roll;
	};
	ext.pitch = function() {
		return strData.pitch;
	};
	ext.pAngle = function() {
		return strData.pitchDeg;
	};
	ext.yAngle = function() {
		return strData.yawDeg;
	};
	ext.rAngle = function() {
		return strData.rollDeg;
	};


    function processInput(msg) {
        console.log("Input "+msg.proto);
        if(msg.proto=='online'){
            connected = true;
        }
    }

    function sendMsg(msg){
        //console.log("send msg: "+msg);
        //chrome.runtime.sendMessage('ojkmijfhdabdfcifimpafffjhjoknaki', msg, processInput)
		chrome.runtime.sendMessage('lohclnpicjahbccciannbegiamdbgeln', msg, processInput)
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'Calibrate', 'calibrate'],
            [' ', 'LED %d.led %d.onoff','runLed','ALL','ON'],
            [' ', 'Arm Flight','armFlight'],
			[' ', 'Disarm Flight','disarmFlight'],
            [' ', 'Set run Motor %d.motorQuad at speed %d.motorPWM','runMotor', "LF", 0],
            [' ', 'Set go %d.flightDir at speed %d','runDirection', "Forward", 100],
            [' ', 'Set rotate %d.flightRotate at speed %d','runRotate', "CR", 100],
            [' ', 'Set altitude %d.flightAltitude at speed %d','runAltitude','UP',100],
			[' ', 'Set trim: pitch add %d.trimValue and roll add %d.trimValue', 'trimPitchAndRoll', 0, 0],
			[' ', 'Run set motor','runSet'],
			['r', 'Throttle', 'thr'],
			['r', 'Pitch', 'pitch'],
			['r', 'Roll', 'roll'],
			['r', 'Yaw', 'yaw'],
			['r', 'YawAngle', 'yAngle'],
			['r', 'RollAngle', 'rAngle'],
			['r', 'PitchAngle', 'pAngle'],
        ],
        menus: {
            onoff: ['ON', 'OFF'],
            led:['ALL','A','B','C','D'],
            motorQuad:["LF","RF","LB","RB","ALL"],
            motorPWM:[0,100,300,600],
            flightDir:['Forward',"Backward","Left","Right"],
            flightRotate:['CR','CCR'],
            flightAltitude:['UP','DOWN'],
			trimValue:[-250,-150,-50,0,50,150,250],
        },

        url: 'http://litebee.cc/'
    };

    // Register the extension
    ScratchExtensions.register('litebee', descriptor, ext);

})({});


// picoExtension.js
// Shane M. Clements, February 2014
// PicoBoard Scratch Extension
//
// This is an extension for development and testing of the Scratch Javascript Extension API.
/*
(function(ext) {
    var device = null;
    var rawData = null;

 


    // Extension API interactions
    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        potentialDevices.push(dev);
		console.log('Received: 1dc');
        if (!device) {
            tryNextDevice();
        }
    }

    var poller = null;
    var watchdog = null;
    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
		console.log('Received: td');
        if (!device) return;
		console.log('Received: ');
        device.open({ stopBits: 0, bitRate: 115200, ctsFlowControl: 0 });
        device.set_receive_handler(function(data) {
            console.log('Received: ' + data.byteLength);
           
        });

        
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        if(poller) poller = clearInterval(poller);
        device = null;
    };

    ext._shutdown = function() {
		console.log('Received: sd');
        if(device) device.close();
        if(poller) poller = clearInterval(poller);
        device = null;
    };

    ext._getStatus = function() {
		console.log('Received: gS');
        if(device) return {status: 1, msg: 'PicoBoard disconnected'};
		console.log('Received: 2');
        return {status: 2, msg: 'PicoBoard connected'};
    }

    var descriptor = {
        blocks: [
			['h', 'when %m.sensor %m.lessMore %n', 'whenSensorPass',      'slider', '>', 50],
            ['b', 'sensor %m.booleanSensor?',      'sensorPressed',       'button pressed'],
            ['r', '%m.sensor sensor value',        'sensor',              'slider']
        ],
        menus: {
			booleanSensor: ['button pressed', 'A connected', 'B connected', 'C connected', 'D connected'],
            sensor: ['slider', 'light', 'sound', 'resistance-A', 'resistance-B', 'resistance-C', 'resistance-D'],
            lessMore: ['>', '<']
        },
		url: '#'
    };
    ScratchExtensions.register('PicoBoard', descriptor, ext, {type: 'serial'});
})({});
*/









