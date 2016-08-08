/**
 * Created by Riven on 2015-08-01.
 */

chrome.app.runtime.onLaunched.addListener(function(){
    chrome.app.window.create("main.html",{
        'innerBounds':{
            'width':450,
            'height':600,
            'minWidth':450,
            'minHeight':600,
            'maxWidth':450,
            'maxHeight':600,
            'left':100,
            'top':100
        }
    });
});
