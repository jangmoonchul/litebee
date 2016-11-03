'use strict';

$(document).ready(function () {
	$("#makerfireLink").on("click",function(){
		window.open('http://www.makerfire.com');
	});
	
    $("#scratchx-start").on("click",function(){
		//window.open('http://scratchx.org/?url=http://23.105.197.252/litebee.js#scratch');
		//window.open('http://scratchx.org/?url=http://localhost/litebee.js#scratch');
		window.open('http://scratchx.org/?url=http://game.litebee.com/litebee.js#scratch');
    });
	
    chrome.runtime.onConnectExternal.addListener(sendScratch);

    chrome.runtime.onMessageExternal.addListener(recvScratch);
	
    /* serial */
	serial.getDevices(function(initCOM){
		console.log("COM:" + initCOM[0]);
		if(initCOM != [])
		{
			$("#serial-current").text(initCOM[0]);			
		}
	});    

	$("#serial-current").on("click",function(event) {
		serial.getDevices(function(ports){
			console.log(ports);			
			var serialDrop = $("#serial-dropdown");
			serialDrop.empty();
			ports.forEach(function(port){
				serialDrop.append("<li><a href='#'>"+port+"</a></li>");
			});
		});
	});
	
    $("#serial-dropdown").on("click",'li a',function(event){
		
        $("#serial-current").html(event.target.text+"<span class='caret'>");
    });

    $("#btnConnect").on("click",function(event) {
        if (serial.connectionId == false) {
			var portStr = $("#serial-current").text().trim();
            console.log("conn to "+portStr);
            serial.connect(portStr, {bitrate: 115200}, onOpen);
			
        }else{
			speed = [0xe8,3,0xe8,3,0xe8,3,0xe8,3];
			sendCmd();
			onClose();
            
        }
    });
	
	
	
	var appSpeed = 1150;//use the google app
	var armFlag = 0;
	var motorSpeed = [1150,1150,1150,1150];
	var onOffMotor = [0,0,0,0];
    $("#armflight").on("click",function(){
        console.log("arm flight");
        
		motorSpeedSet(0,appSpeed);
		motorSpeedSet(1,appSpeed);
		motorSpeedSet(2,appSpeed);
		motorSpeedSet(3,appSpeed);
		$("#armflight").css("backgroundColor","#f66");
		armFlag = 1;
		sendCmd();
    });
	
    $("#disarm").on("click",function(){
		console.log("disarm flight");

		motorSpeedSet(0,1000);
		motorSpeedSet(1,1000);
		motorSpeedSet(2,1000);
		motorSpeedSet(3,1000);
		motorSpeed = [1150,1150,1150,1150];
		appSpeed = 1150;
		armFlag = 0;
		onOffMotor = [0,0,0,0];
		$("#motorA").css("backgroundColor","#fff");
		$("#motorB").css("backgroundColor","#fff");
		$("#motorC").css("backgroundColor","#fff");
		$("#motorD").css("backgroundColor","#fff");
		$("#armflight").css("backgroundColor","#fff");
		sendCmd();
		
    });
	
	
	$("#add").on("click",function(){
        console.log("add :" + motorSpeed + "speed: " + speed);
		
		for (var i = 0; i < 4; i++)
		{
			if(onOffMotor[i])
			{
				motorSpeed[3-i] += 50;
				if(motorSpeed[3-i] > 1400)
				{
					motorSpeed[3-i] = 1400;
				}
				var whatMotor;
				switch(i)
				{
					case 0:
					whatMotor = 3;
					break;
					case 1:
					whatMotor = 2
					break;
					case 2:
					whatMotor = 1;
					break;
					case 3:
					whatMotor = 0;
					break;
				}
				motorSpeedSet(whatMotor,motorSpeed[3-i]);
			}
		}
		if(armFlag)
		{
			appSpeed += 50;
			if(appSpeed > 1400)
			{
				appSpeed = 1400;
			}
			motorSpeedSet(0,appSpeed);
			motorSpeedSet(1,appSpeed);
			motorSpeedSet(2,appSpeed);
			motorSpeedSet(3,appSpeed);
		}
		sendCmd();
    });
	
	$("#dec").on("click",function(){
        console.log("dec : motorSpeed" + motorSpeed + "speed: " + speed);
        
		for (var i = 0; i < 4; i++)
		{
			if(onOffMotor[i])
			{
				motorSpeed[3-i] -= 50;
				if(motorSpeed[3-i] < 1000)
				{
					motorSpeed[3-i] = 1000;
				}
				var whatMotor;
				switch(i)
				{
					case 0:
					whatMotor = 3;
					break;
					case 1:
					whatMotor = 2;
					break;
					case 2:
					whatMotor = 1;
					break;
					case 3:
					whatMotor = 0;
					break;
				}
				motorSpeedSet(whatMotor,motorSpeed[3-i]);
			}
		}
		if(armFlag)
		{
			appSpeed -= 50;
			if(appSpeed < 1000)
			{
				appSpeed = 1000;
			}
			motorSpeedSet(0,appSpeed);
			motorSpeedSet(1,appSpeed);
			motorSpeedSet(2,appSpeed);
			motorSpeedSet(3,appSpeed);
		}
		sendCmd();
    });
	
	$("#motorA").on("click",function(){
        console.log("motorA idling flight :" + motorSpeed[3]);		
		mspCmd = CMD.MOTOR;
		if(onOffMotor[0] === 0)
		{
			onOffMotor[0] = 1;
			motorSpeed[3] = 1150;
			$("#motorA").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[0] = 0;
			motorSpeed[3] = 1000;
			$("#motorA").css("backgroundColor","#fff");
		}
		motorSpeedSet(3,motorSpeed[3]);
		sendCmd();
    });
	
	$("#motorB").on("click",function(){
        console.log("motorB idling flight :" + motorSpeed[2]);
		mspCmd = CMD.MOTOR;
        if(onOffMotor[1] === 0)
		{
			onOffMotor[1] = 1;
			motorSpeed[2] = 1150;
			$("#motorB").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[1] = 0;
			motorSpeed[2] = 1000;
			$("#motorB").css("backgroundColor","#fff");
		}
		motorSpeedSet(2,motorSpeed[2]);
		sendCmd();
    });
	
	$("#motorC").on("click",function(){
        console.log("motorC idling flight :" + motorSpeed[1]);		
		mspCmd = CMD.MOTOR;
        if(onOffMotor[2] === 0)
		{
			onOffMotor[2] = 1;
			motorSpeed[1] = 1150;
			$("#motorC").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[2] = 0;
			motorSpeed[1] = 1000;
			$("#motorC").css("backgroundColor","#fff");
		}
		motorSpeedSet(1,motorSpeed[1]);
		sendCmd();
    });
	
	$("#motorD").on("click",function(){
        console.log("motorD idling flight :" + motorSpeed[0]);
		mspCmd = CMD.MOTOR;
        if(onOffMotor[3] === 0)
		{
			onOffMotor[3] = 1;
			motorSpeed[0] = 1150;
			$("#motorD").css("backgroundColor","#f66");
		}
		else
		{
			onOffMotor[3] = 0;
			motorSpeed[0] = 1000;
			$("#motorD").css("backgroundColor","#fff");
		}
		motorSpeedSet(0,motorSpeed[0]);
		sendCmd();
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

