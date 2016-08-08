var serial = null;
var speed = [0xae,8,0xae,8,0xae,8,0xae,8];
var portMsg;
var reRunSetFlag = 0;
var scratchMsg;
var scratchxConnectFlag = 0;
$(document).ready(function () {

    $("#scratchx-start").on("click",function(){
        //window.open('http://scratchx.org/?url=http://120.76.118.117:9999/static/js/litebee.js#scratch');
		window.open('http://scratchx.org/?url=http://23.105.197.252/litebee.js#scratch');
		//window.open('http://scratchx.org/?url=http://localhost/litebee.js#scratch');
		//window.open('http://localhost/?url=http://localhost/litebee.js#scratch');
    });

	
    chrome.runtime.onConnectExternal.addListener(function(port){
		portMsg = port;
        console.log("chrome.runtime.onConnect "+portMsg.name);
        port.postMessage({greeting:"hello"});
		scratchxConnectFlag = 1;
    });

    chrome.runtime.onMessageExternal.addListener(function(msg, sender, respFun){
        console.log("msg:"+msg.proto);
		reRunSetFlag = 0;
        if(msg.proto=='probe'){
            respFun({'proto':'online'});
        }else if(msg.proto=="calibrate"){
            calibrate();
        }else if(msg.proto=="arm"){
            arm();
			//sendSpeed();
        }else if(msg.proto=="disarm"){
            disarm();
			speed = [0xae,8,0xae,8,0xae,8,0xae,8];
			//sendSpeed();
        }else if(msg.proto=="runMotor"){
			 console.log("run motor "+msg.motor+" "+msg.speed);
			if(msg.motor=="LF"){
				motorSpeedSet('A',msg.speed)
			}else if(msg.motor=="LB"){
				motorSpeedSet('D',msg.speed)
			}else if(msg.motor=="RF"){
				motorSpeedSet('B',msg.speed)
			}else if(msg.motor=="RB"){
				motorSpeedSet('C',msg.speed)
			}else if(msg.motor=="ALL"){
				motorSpeedSet('A',msg.speed);
				motorSpeedSet('B',msg.speed);
				motorSpeedSet('C',msg.speed);
				motorSpeedSet('D',msg.speed);				
			}
		}else if(msg.proto=="runLed"){
            console.log("LED "+msg.led+" "+msg.onoff);
            if(msg.led=="ALL"){
                if(msg.onoff=="ON"){
                    motorSpeedSet('A',1111);
					motorSpeedSet('B',1111);
					motorSpeedSet('C',1111);
					motorSpeedSet('D',1111);
					sendSpeed();
                }else{
                    motorSpeedSet('A',1112);
					motorSpeedSet('B',1112);
					motorSpeedSet('C',1112);
					motorSpeedSet('D',1112);
					sendSpeed();
                }
            }else if(msg.led=='A'){
                if(msg.onoff=="ON"){
                    motorSpeedSet('A',1111);
					sendSpeed();
                }else{
                    motorSpeedSet('A',1112);
					sendSpeed();
                }
            }else if(msg.led=='B'){
                if(msg.onoff=="ON"){
                    motorSpeedSet('B',1111);
					sendSpeed();
                }else{
                    motorSpeedSet('B',1112);
					sendSpeed();
                }
            }else if(msg.led=='C'){
                if(msg.onoff=="ON"){
                    motorSpeedSet('C',1111);
					sendSpeed();
                }else{
                    motorSpeedSet('C',1112);
					sendSpeed();
                }
            }else if(msg.led=='D'){
                if(msg.onoff=="ON"){
                    motorSpeedSet('D',1111);
					sendSpeed();
                }else{
                    motorSpeedSet('D',1112);
					sendSpeed();
                }
            }
        }else if(msg.proto=="runDirection"){
			console.log("direction "+msg.flightDir+" "+msg.speed);
			if(msg.flightDir=='Forward'){
				motorSpeedSet('A',500);
				motorSpeedSet('B',500);
				motorSpeedSet('C',550);
				motorSpeedSet('D',550);
			}else if(msg.flightDir=='Backward'){
				motorSpeedSet('A',550);
				motorSpeedSet('B',550);
				motorSpeedSet('C',500);
				motorSpeedSet('D',500);
			}else if(msg.flightDir=='Left'){
				motorSpeedSet('A',500);
				motorSpeedSet('B',550);
				motorSpeedSet('C',550);
				motorSpeedSet('D',500);
			}else if(msg.flightDir=='Right'){
				motorSpeedSet('A',550);
				motorSpeedSet('B',500);
				motorSpeedSet('C',500);
				motorSpeedSet('D',550);
			}
			
		}else if(msg.proto=="runRotate"){
			console.log("rotate "+msg.flightRotate+" "+msg.speed);
			if(msg.flightRotate=='CR'){
				motorSpeedSet('A',600);
				motorSpeedSet('B',0);
				motorSpeedSet('C',600);
				motorSpeedSet('D',0);
			}else if(msg.flightRotate=='CCR'){
				motorSpeedSet('A',0);
				motorSpeedSet('B',600);
				motorSpeedSet('C',0);
				motorSpeedSet('D',600);
			}
		}else if(msg.proto=="runAltitude"){
			console.log("controlAlt "+msg.flight+" "+msg.speed);
			if(msg.flight=='UP'){
				motorSpeedSet('A',550);
				motorSpeedSet('B',550);
				motorSpeedSet('C',550);
				motorSpeedSet('D',550);
			}else if(msg.flight=='DOWN'){
				motorSpeedSet('A',400);
				motorSpeedSet('B',400);
				motorSpeedSet('C',400);
				motorSpeedSet('D',400);
			}
		}else if(msg.proto=="runSet"){
			runSet(msg);
			reRunSetFlag = 1;
			scratchMsg = msg;
		}
    });
	
	function runSet(msg) {
		console.log("runSet dir "+msg.dirFlag+" flight "+msg.flightFlag+" dirSpeed "+msg.dirSpeed+" flightSpeed "+msg.flightSpeed+" speed "+speed+" trimPitch "+msg.trimPitch+" trimRoll "+msg.trimRoll);
			if(msg.dirFlag != "")
			{
				var pitchOrRoll = msg.dirSpeed;
				if(pitchOrRoll > 500)
				{
					pitchOrRoll = 500;
				}
				switch(msg.dirFlag)
				{
					case "Forward":
					simulationRC(1500, 1500, 1500+pitchOrRoll, 1500);
					break;
					case "Backward":
					simulationRC(1500, 1500, 1500-pitchOrRoll, 1500);
					break;
					case "Left":
					simulationRC(1500, 1500, 1500, 1500-pitchOrRoll);
					break;
					case "Right":
					simulationRC(1500, 1500, 1500, 1500+pitchOrRoll);
					break;
				}
				
			}
			else if(msg.flightFlag != "")
			{
				var thro = msg.flightSpeed;
				if(thro > 500)
				{
					thro = 500;
				}
				if(msg.flightFlag === "UP")
				{
					simulationRC(1500+thro, 1500, 1500+msg.trimPitch, 1500+msg.trimRoll);
				}
				else if(msg.flightFlag === "DOWN")
				{
					simulationRC(1500-thro, 1500, 1500+msg.trimPitch, 1500+msg.trimRoll);
				}
				
			}
			else
			{
				
				sendSpeed();
			}
	}

	/*alarms*/
	//chrome.alarms.create("checkSerial",{when:100,periodInMinutes:0.015});
	
	
    /* serial */
	var connectStatus = 0;
	var portStr = "";
    serial = new SerialConnection();
    console.log(serial);
    serial.getDevices(function(ports){
        console.log(ports);
        var serialDrop = $("#serial-dropdown");
        serialDrop.empty();
        ports.forEach(function(port){
            // var portStr = port.path;
			portStr = port.path;
            serialDrop.append("<li><a href='#'>"+portStr+"</a></li>");
            console.log("ser dev "+portStr);
        });
    });
	
	/* chrome.alarms.onAlarm.addListener(function(alarm) {
		if(connectStatus)
		{
			if(serial.errorStatus)
			{
				portStr = $("#serial-current").text();
				serial.disconnect(onClose);
				serial.errorStatus = 0;
				speed = [0xae,8,0xae,8,0xae,8,0xae,8];
				reRunSetFlag = 0;
				return;
			}
			//sendSpeed();
			if(reRunSetFlag)
			{
				runSet(scratchMsg);
			}
		}
		else
		{
			serial.getDevices(function(ports){
				console.log(ports);
				var serialDrop = $("#serial-dropdown");
				serialDrop.empty();
				ports.forEach(function(port){
					//var portStr = port.path;
					portStr = port.path;
					serialDrop.append("<li><a href='#'>"+portStr+"</a></li>");
					console.log("ser dev "+portStr);
				});
			});
		}
		
	}); */
	
    //serial.onReadLine.addListener(onReadLine);

	$("#serial-current").on("click",function(event) {
		serial.getDevices(function(ports){
			console.log(ports);
			var serialDrop = $("#serial-dropdown");
			serialDrop.empty();
			ports.forEach(function(port){
				// var portStr = port.path;
				portStr = port.path;
				serialDrop.append("<li><a href='#'>"+portStr+"</a></li>");
				console.log("ser dev "+portStr);
			});
		});
	});
	
    $("#serial-dropdown").on("click",'li a',function(event){
		
        $("#serial-current").html(event.target.text+"<span class='caret'>");
    });

    $("#btnConnect").on("click",function(event) {
        if (serial.connectionId == -1) {
            //var portStr = $("#serial-current").text().trim();
			portStr = $("#serial-current").text().trim();
            console.log("conn to "+portStr);
            serial.connect(portStr, {bitrate: 115200}, onOpen);
			
        }else{
			speed = [0xae,8,0xae,8,0xae,8,0xae,8];
			sendSpeed();
            //var portStr = $("#serial-current").text();
			portStr = $("#serial-current").text();
            serial.disconnect(onClose);
        }
    });
	
	function onReadLine(msg){
		console.log('read line: ' + msg);
		/* if(scratchxConnectFlag)
		{
			portMsg.postMessage({data:msg});
		} */
		//portMsg.postMessage({data:msg});
		// if(reRunSetFlag)
		// {
			// runSet(scratchMsg);
		// }
	}

	function onOpen(openInfo){
		console.log("ser open "+openInfo);
		$("#btnConnect").text("disconn");
		connectStatus = 1;
	}

	function onClose(){
		$("#btnConnect").text("connect");
		connectStatus = 0;
	}


	
	var appSpeed = 200;//use the google app
	var armFlag = 0;
	var motorSpeed = [200,200,200,200];
	var onOffMotor = [0,0,0,0];
    $("#armflight").on("click",function(){
        console.log("arm flight");
        //armflight(0);
		motorSpeedSet('A',appSpeed);
		motorSpeedSet('B',appSpeed);
		motorSpeedSet('C',appSpeed);
		motorSpeedSet('D',appSpeed);
		$("#armflight").css("backgroundColor","#f66");
		armFlag = 1;
		sendSpeed();
    });
	
    $("#disarm").on("click",function(){
		console.log("disarm flight");
        /* console.log("calibrate flight"); */
        /* calibrate(); */
		
		/* borrow calibrate btn */
		/* use remote need 'mode' key */
		motorSpeedSet('A',0);
		motorSpeedSet('B',0);
		motorSpeedSet('C',0);
		motorSpeedSet('D',0);
		motorSpeed = [200,200,200,200];
		appSpeed = 200;
		armFlag = 0;
		onOffMotor = [0,0,0,0];
		$("#motorA").css("backgroundColor","#fff");
		$("#motorB").css("backgroundColor","#fff");
		$("#motorC").css("backgroundColor","#fff");
		$("#motorD").css("backgroundColor","#fff");
		$("#armflight").css("backgroundColor","#fff");
		sendSpeed();
		
    });
	
	
	$("#add").on("click",function(){
        console.log("add :" + motorSpeed + "speed: " + speed);
        //armflight(0);
		
		for (var i = 0; i < 4; i++)
		{
			if(onOffMotor[i])
			{
				motorSpeed[3-i] += 50;
				if(motorSpeed[3-i] > 400)
				{
					motorSpeed[3-i] = 400;
				}
				var whatMotor = '';
				switch(i)
				{
					case 0:
					whatMotor = 'D';
					break;
					case 1:
					whatMotor = 'C'
					break;
					case 2:
					whatMotor = 'B';
					break;
					case 3:
					whatMotor = 'A';
					break;
				}
				motorSpeedSet(whatMotor,motorSpeed[3-i]);
			}
		}
		if(armFlag)
		{
			appSpeed += 50;
			if(appSpeed > 400)
			{
				appSpeed = 400;
			}
			motorSpeedSet('A',appSpeed);
			motorSpeedSet('B',appSpeed);
			motorSpeedSet('C',appSpeed);
			motorSpeedSet('D',appSpeed);
		}
		sendSpeed();
    });
	
	$("#dec").on("click",function(){
        console.log("dec : motorSpeed" + motorSpeed + "speed: " + speed);
        //armflight(0);
		for (var i = 0; i < 4; i++)
		{
			if(onOffMotor[i])
			{
				motorSpeed[3-i] -= 50;
				if(motorSpeed[3-i] < 0)
				{
					motorSpeed[3-i] = 0;
				}
				var whatMotor = '';
				switch(i)
				{
					case 0:
					whatMotor = 'D';
					break;
					case 1:
					whatMotor = 'C'
					break;
					case 2:
					whatMotor = 'B';
					break;
					case 3:
					whatMotor = 'A';
					break;
				}
				motorSpeedSet(whatMotor,motorSpeed[3-i]);
			}
		}
		if(armFlag)
		{
			appSpeed -= 50;
			if(appSpeed < 0)
			{
				appSpeed = 0;
			}
			motorSpeedSet('A',appSpeed);
			motorSpeedSet('B',appSpeed);
			motorSpeedSet('C',appSpeed);
			motorSpeedSet('D',appSpeed);
		}
		sendSpeed();
    });
	
	$("#motorA").on("click",function(){
        console.log("motorA idling flight :" + motorSpeed[3]);		
		if(onOffMotor[0] === 0)
		{
			onOffMotor[0] = 1;
			motorSpeed[3] = 200;
			$("#motorA").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[0] = 0;
			motorSpeed[3] = 0;
			$("#motorA").css("backgroundColor","#fff");
		}
		motorSpeedSet('D',motorSpeed[3]);
		sendSpeed();
    });
	
	$("#motorB").on("click",function(){
        console.log("motorB idling flight :" + motorSpeed[2]);
        if(onOffMotor[1] === 0)
		{
			onOffMotor[1] = 1;
			motorSpeed[2] = 200;
			$("#motorB").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[1] = 0;
			motorSpeed[2] = 0;
			$("#motorB").css("backgroundColor","#fff");
		}
		motorSpeedSet('C',motorSpeed[2]);
		sendSpeed();
    });
	
	$("#motorC").on("click",function(){
        console.log("motorC idling flight :" + motorSpeed[1]);		
        if(onOffMotor[2] === 0)
		{
			onOffMotor[2] = 1;
			motorSpeed[1] = 200;
			$("#motorC").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[2] = 0;
			motorSpeed[1] = 0;
			$("#motorC").css("backgroundColor","#fff");
		}
		motorSpeedSet('B',motorSpeed[1]);
		sendSpeed();
    });
	
	$("#motorD").on("click",function(){
        console.log("motorD idling flight :" + motorSpeed[0]);
        if(onOffMotor[3] === 0)
		{
			onOffMotor[3] = 1;
			motorSpeed[0] = 200;
			$("#motorD").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[3] = 0;
			motorSpeed[0] = 0;
			$("#motorD").css("backgroundColor","#fff");
		}
		motorSpeedSet('A',motorSpeed[0]);
		sendSpeed();
    });

    $('#fileupload').fileupload({
        //url: "http://120.76.118.117:9999/upload",
        //url: "http://192.168.10.109:9999/upload",
		url: "http://23.105.197.252:9999/upload",
        autoUpload: true,
        add: function (e, data) {
            console.log("add:"+e+","+data);
            data.submit();
        },
        done: function (e, data) {
            console.log("upload done:"+data);
            $.each(data.files, function (index, file) {
                console.log("upload done:"+index+","+file.name);
                $('#saveino').attr('href', data.result);
                $("#saveino").removeAttr("disabled");
                $("#filename").text(file.name);
            });
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            console.log("upload %"+progress);
        },
        fail: function(e, data) {
            alert('Fail!');
        }
    });

});



function calibrate() {
    var msg = new Uint8Array([0x24,0x4d,0x3c,0x00,0xcd]);
    serial.sendbuf(msg.buffer);
}

function arm(){
    var msg = new Uint8Array([0x24,0x4d,0x3c,0x00,0x05]);
    serial.sendbuf(msg.buffer);
}

function disarm(){
    var msg = new Uint8Array([0x24,0x4d,0x3c,0x00,0x06]);
    serial.sendbuf(msg.buffer);
}

function simulationRC(Thro, Yaw, Pitch, Roll) {
	var rcData = [0xdc,0x05,0xdc,0x05,0xdc,0x05,0xdc,0x05];
	rcData[0] = Thro % 256;
	rcData[1] = Math.floor(Thro / 256);
	rcData[2] = Yaw % 256;
	rcData[3] = Math.floor(Yaw / 256);
	rcData[4] = Pitch % 256;
	rcData[5] = Math.floor(Pitch / 256);
	rcData[6] = Roll % 256;
	rcData[7] = Math.floor(Roll / 256);
	console.log(rcData);
	var msg = new Uint8Array([0x24,0x4d,0x3c,0x08,0x07,rcData[0],rcData[1],rcData[2],rcData[3],rcData[4],rcData[5],rcData[6],rcData[7]]);
	serial.sendbuf(msg.buffer);
}

function motorSpeedSet(motor, value) {
	value = Number(value);
	console.log("value:"+value);
	value += 2222;
	switch (motor)
	{
		case 'A':
		speed[0] = value % 256;
		speed[1] = Math.floor(value / 256);
		break;
		case 'B':
		speed[2] = value % 256;
		speed[3] = Math.floor(value / 256);
		break;
		case 'C':
		speed[4] = value % 256;
		speed[5] = Math.floor(value / 256);
		break;
		case 'D':
		speed[6] = value % 256;
		speed[7] = Math.floor(value / 256);
		break;
	}
}

function sendSpeed()
{
	console.log("haha");
	var msg = new Uint8Array([0x24,0x4d,0x3c,0x38,0x07,speed[0],speed[1],speed[2],speed[3],speed[4],speed[5],speed[6],speed[7]]);
	serial.sendbuf(msg.buffer);
}
