chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('daq-client.html', {
	'outerBounds': {
	    'left': 0,
	    'top': 0,
	    'width': 900,
	    'height': 600
	}
    })
});
