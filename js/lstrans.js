'use strict';

var portData;
var connectScartchFlag = false;
function sendScratch(port){
	portData = port;
	console.log("chrome.runtime.onConnect "+portData.name);
	portData.postMessage({greeting:"hello"});
};

function recvScratch(msg, sender, respFun){
	console.log("msg:"+msg.proto);
	if(msg.proto=='probe'){
		respFun({'proto':'online'});
	}
	connectScartchFlag = true;
	scratchxReduce(msg);
}