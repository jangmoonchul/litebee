'use strict';


//var serial = null;
var speed = [0xe8,3,0xe8,3,0xe8,3,0xe8,3];
var dirData = 0;
var led = 0;
var mspCmd = 0;
var trimRoll = 0;
var trimPitch = 0;
var fourLed = 0;
var colorLed = 0;
var beep = 0;
var CMD = {
	ARM:1,
	DISARM:2,
	FREEHEAD:3,
	HEAD:4,
	MANUAL:5,
	ANGLE:6,
	ALTHOLD:7,
	POSHOLD:8,
	CALIBRATION:9,
	FORWARD:10,
	BACKWARD:11,
	LEFT:12,
	RIGHT:13,
	UP:14,
	DOWN:15,
	CR:16,
	CCR:17,
	MOTOR:18,
	NOTALTHOLD:19,
	LED:20,
	TRIM:21,
	BEEP:22,
};
var rcData = {
	YAW:'A',
	THROTTLE:'B',
	PITCH:'C',
	ROLL:'D',
};
var LED = {
	LED_A:1<<4,
	LED_B:1<<5,
	LED_C:1<<6,
	LED_D:1<<7,
};
var COLOR = {
	"BLACK":0,
	"WHITE":1,
	"RED":2,
	"ORANGE":3,
	"YELLOW":4,
	"GREEN":5,
	"BLUE":6,
	"PINK":7,
	"VIOLET":8,
};
var connectId = -1;
var timerId = -1;
var serialData = new Object;

function scratchxReduce(msg) {
	console.log(msg.proto);
	if(msg.proto=="calibrate"){
		calibrate();
	}else if(msg.proto=="arm"){
		arm();
	}else if(msg.proto=="disarm"){
		disarm();
		speed = [0xe8,3,0xe8,3,0xe8,3,0xe8,3];
		dirData = 0;
	}else if(msg.proto=="runMotor"){
		console.log("run motor "+msg.motor+" "+msg.speed);
		mspCmd = CMD.MOTOR;
		var motorSpeed = 1000 + Number(msg.speed);
		if(msg.motor=="LF"){
			motorSpeedSet(0,motorSpeed)
		}else if(msg.motor=="LB"){
			motorSpeedSet(3,motorSpeed)
		}else if(msg.motor=="RF"){
			motorSpeedSet(1,motorSpeed)
		}else if(msg.motor=="RB"){
			motorSpeedSet(2,motorSpeed)
		}else if(msg.motor=="ALL"){
			motorSpeedSet(0,motorSpeed);
			motorSpeedSet(1,motorSpeed);
			motorSpeedSet(2,motorSpeed);
			motorSpeedSet(3,motorSpeed);				
		}
	}else if(msg.proto=="runLed"){
		console.log("LED "+msg.led+" "+msg.onoff);
		mspCmd = CMD.LED;
		if(msg.led=="ALL"){
			if(msg.onoff=="ON"){
				fourLed = 240;
			}else{
				fourLed &= 0;
			}
		}else if(msg.led=='A'){
			if(msg.onoff=="ON"){
				fourLed |= LED.LED_A;
			}else{
				fourLed &= ~(LED.LED_A);
			}
		}else if(msg.led=='B'){
			if(msg.onoff=="ON"){
				fourLed |= LED.LED_B;
			}else{
				fourLed &= ~(LED.LED_B);
			}
		}else if(msg.led=='C'){
			if(msg.onoff=="ON"){
				fourLed |= LED.LED_C;
			}else{
				fourLed &= ~(LED.LED_C);
			}
		}else if(msg.led=='D'){
			if(msg.onoff=="ON"){
				fourLed |= LED.LED_D;
			}else{
				fourLed &= ~(LED.LED_D);
			}
		}
		led = colorLed + fourLed;
	}else if(msg.proto == "beeper"){
		console.log("beeper: "+msg.time);
		mspCmd = CMD.BEEP;
		if(msg.time == "ON"){
			beep = 5;
		}else if(msg.time == "OFF"){
			beep = 1;
		}else if(msg.time == "LESS"){
			beep = 2;
		}else if(msg.time == "MEDIUM"){
			beep = 3;
		}else if(msg.time == "MORE"){
			beep = 4;
		}
	}else if(msg.proto=="colorLed"){
		console.log("color Led :" + msg.color + "led" + led);
		mspCmd = CMD.LED;
		colorLed = COLOR[msg.color];
		led = colorLed + fourLed;
		console.log("LED:" + led);
	}else if(msg.proto=="runDirection"){
		console.log("direction "+msg.flightDir+" "+msg.speed);
		if(msg.flightDir=='Forward'){
			mspCmd = CMD.FORWARD;
		}else if(msg.flightDir=='Backward'){
			mspCmd = CMD.BACKWARD;
		}else if(msg.flightDir=='Left'){
			mspCmd = CMD.LEFT;
		}else if(msg.flightDir=='Right'){
			mspCmd = CMD.RIGHT;
		}			
		dirData = msg.speed;
	}else if(msg.proto=="runRotate"){
		console.log("rotate "+msg.flightRotate+" "+msg.speed);
		if(msg.flightRotate=='CR'){
			mspCmd = CMD.CR;
		}else if(msg.flightRotate=='CCR'){
			mspCmd = CMD.CCR;
		}
		dirData = msg.speed;
	}else if(msg.proto=="runAltitude"){
		console.log("controlAlt "+msg.flight+" "+msg.speed);
		if(msg.flight=='UP'){
			mspCmd = CMD.UP;
		}else if(msg.flight=='DOWN'){
			mspCmd = CMD.DOWN;
		}
		dirData = msg.speed;
	}else if(msg.proto=='trimPitchAndRoll'){
		trimPitch = Number(msg.trimPitch);
		trimRoll = Number(msg.trimRoll);
		if(trimPitch<0){
			trimPitch += 256;
		}
		if(trimRoll<0){
			trimRoll += 256;
		}
		mspCmd = CMD.TRIM;
		console.log("trimP:"+trimPitch+" trimR:"+trimRoll);
	}else if(msg.proto=="runSet"){
		sendCmd();
	}else if(msg.proto=='altMode'){
		console.log("altitude mode: "+msg.mode);
		if(msg.mode == 'OPEN'){
			mspCmd = CMD.ALTHOLD;
		}else{
			mspCmd = CMD.NOTALTHOLD;
		}
		sendCmd();
	}
}

function calibrate() {
    mspCmd = CMD.CALIBRATION;
	sendCmd();
	mspCmd = 0;
}

function arm(){
    mspCmd = CMD.ARM;
	sendCmd();
}

function disarm(){
    mspCmd = CMD.DISARM;
	sendCmd();
}

function controlLED(t_led){
	led = t_led;
}

function motorSpeedSet(motor, value) {
	value = Number(value);
	motor = Number(motor);
	console.log("value:"+value);
	switch (motor)
	{
		case 0:
		speed[0] = value % 256;
		speed[1] = Math.floor(value / 256);
		break;
		case 1:
		speed[2] = value % 256;
		speed[3] = Math.floor(value / 256);
		break;
		case 2:
		speed[4] = value % 256;
		speed[5] = Math.floor(value / 256);
		break;
		case 3:
		speed[6] = value % 256;
		speed[7] = Math.floor(value / 256);
		break;
	}
}

function sendCmd()
{
	var checkSum = 0;
	checkSum ^= mspCmd;
	checkSum ^= speed[0];
	checkSum ^= speed[1];
	checkSum ^= speed[2];
	checkSum ^= speed[3];
	checkSum ^= speed[4];
	checkSum ^= speed[5];
	checkSum ^= speed[6];
	checkSum ^= speed[7];
	checkSum ^= dirData;
	checkSum ^= led;
	checkSum ^= trimPitch;
	checkSum ^= trimRoll;
	checkSum ^= beep;
	//console.log("mspCmd:"+mspCmd+"speed0:"+speed[0]+"speed1:"+speed[1]+"checksum:"+checkSum);
	var msg = new Uint8Array([0x24,0x4d,0x3c,mspCmd,speed[0],speed[1],speed[2],speed[3],
					speed[4],speed[5],speed[6],speed[7],dirData,led,trimPitch,trimRoll,beep,checkSum]);
	serial.send(msg.buffer,function(){});
	
	
}

function onOpen(openInfo){
	console.log(serial.bitrate);
	
	if(serial.connectionId != false)
	{
		$("#btnConnect").text("disconn");
		//serial.onReceive.addListener(printData);
		timerId = window.setInterval(sendCmd,50); 
	}
}

function onClose(){

	serial.disconnect(function(){});
	$("#btnConnect").text("connect");	
	
	window.clearInterval(timerId); 
}

var lineData = '';

function printData(info){
	var data = new Uint8Array(info.data);
	var encodedString = String.fromCharCode.apply(null, data);
    var line = decodeURIComponent(escape(encodedString));
	console.log(line);
	lineData += line;

	if(lineData.indexOf('}') >= 0){
		
		console.log(lineData);
		var data = lineData;
		lineData = '';
		serialData = JSON.parse(data);		
		serialData.pitch /= 10.0;
		serialData.yaw /= 10.0;
		serialData.roll /= 10.0;
		
		if(connectScartchFlag){
			portData.postMessage(serialData);
		}
	}
	
}