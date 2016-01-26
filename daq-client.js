var data = [
	{'key'   : 'tem',
	'name'  : 'Temperature',
	'units' : 'F',
	'values': [
	    {'time':    1, 'value': 123},
	    {'time':   12, 'value': 000},
	    {'time':  100, 'value': 123},
	    {'time': 1000, 'value': 123},
	    {'time': 2000, 'value': 876},
	    {'time': 3000, 'value': 999},
	    {'time': 4000, 'value': 765},
	    {'time': 5000, 'value': 234},
	    {'time': 6000, 'value': 678},
	    {'time': 7000, 'value': 345},
	    {'time': 8000, 'value': 079},
	    {'time': 9000, 'value': 123}
	]
    },
    {
	'key'   : 'thr',
	'name'  : 'Throttle',
	'units' : '%',
	'values': [
	    {'time':    1, 'value': 123},
	    {'time':   12, 'value': 000},
	    {'time':  100, 'value': 123},
	    {'time': 1000, 'value': 123},
	    {'time': 2000, 'value': 876},
	    {'time': 3000, 'value': 999},
	    {'time': 4000, 'value': 765},
	    {'time': 5000, 'value': 234},
	    {'time': 6000, 'value': 678},
	    {'time': 7000, 'value': 345},
	    {'time': 8000, 'value': 079},
	    {'time': 9000, 'value': 123}
	]
    },
    {
	'key'   : 'brk' ,
	'name'  : 'Brake',
	'units' : '%',
	'values': [
		{'time':    1, 'value': 123},
	    {'time':   12, 'value': 000},
	    {'time':  100, 'value': 123},
	    {'time': 1000, 'value': 123},
	    {'time': 2000, 'value': 876},
	    {'time': 3000, 'value': 999},
	    {'time': 4000, 'value': 765},
	    {'time': 5000, 'value': 234},
	    {'time': 6000, 'value': 678},
	    {'time': 7000, 'value': 345},
	    {'time': 8000, 'value': 079},
	    {'time': 9000, 'value': 123}
	]
    }
];

var listOfRandomMeasurements = ['thr', 'brk', 'tem'];
var makeRandom = function(){
    if (listOfRandomMeasurements.length > 0){
	var mykey = listOfRandomMeasurements.pop();
	var start = Date.now();
	var myval = 1;
	setInterval(function(){
	    record(mykey,
		   myval++,
		   Date.now() - start);
	}, 1000);
    } else {
	console.log('too many random measurements');
    }
}

var svg, table, rows, width, height;
function init(){
    var width = document.getElementById("plot-div").offsetWidth;
    xScale = d3.scale.linear()
	.range([padding.left, width - padding.right])
	.domain([xMin, xMax])
	.nice()
    createPlot('tem');
}

function record(key, value, time){
    if (data.hasOwnProperty(key)){
	data[key].values.push({'time': time, 'value': value});
	updateTable();
	updatePlots();
    } else {
	console.log('unknown key: ', key);
	// Find a way to save these values somewhere so we don't lose
	// any information
    }
}

var isRealTime;
function updateTable(time){
	//reset table data
	var tableData = []
    for (i=0; i<data.length; i++) {
    	var vals = data[i].values;
    	//set undefined time to last time
    	if (time === undefined) {
    		time = vals[vals.length-1].time;
    	}
    	//get value at time
    	for (j=0; j<vals.length; j++) {
    		if (vals[i].time = time) {
    			var displayval = vals[i];
    		}
    	}
    	tableData.push([data[i].name, displayval.value, data[i].units]);
    }
    createTable(tableData);
}

function createTable(tableData) {
  var table = document.createElement('table')
    , tableBody = document.createElement('tbody');

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.getElementById("table-div").appendChild(table);
}

function updatePlots(){
    updateXScale();
    for (var i = 0; i < plots.length; i++){
	// Update the plot
	var svg = plots[i].plot;
	var myData = plots[i].values.filter(function(d) {return (d.time >= xMin && d.time <= xMax);});
	plots[i].yScale.domain(d3.extent(myData, function(d) { return d.value; }));
	svg.select('.line') .attr('d', plots[i].line(myData));
	svg.select('.xaxis').call(plots[i].xAxis);
	svg.select('.yaxis').call(plots[i].yAxis);
    }
}

var xScale, xMin = 0, xMax = Math.pow(2, 32)/1000;
function updateXScale(){
    xMin = parseInt(document.getElementById('start').value);
    xMax = parseInt(document.getElementById('end').value);
    if (xMax == 0){
	if (isRealTime) {
	    xMax = -1;
	} else {
	    for (var i = 0; i < plots.length; i++){
		xMax = Math.max(d3.max(plots[i].values, function(d){ return d.time; }), xMax);
	    }
	}
    }
    if (xMin < 0) {
	xMin = xMax + xMin;
    }
    xScale.domain([xMin, xMax]);
}

var plots = [];
var padding = {'top': 15, 'right': 30, 'bottom': 20, 'left': 60};
var createPlot = function(key){
    var myData, found = false;
    if (data.hasOwnProperty(key)){
	myData = data[key];
    } else {
	console.log('unknown key for plot');
	return;
    }
    width = document.getElementById("plot-div").offsetWidth;
    height = 150;
    // Add the plot to the master list of visible plots
    plots.push(data[key]);
    // Create an individual SVG for the new plot
    myData.plot = d3.select('.plot-div').append('svg')
	.attr('width', width)
	.attr('height', height);
    myData.yScale = d3.scale.linear()
	.range([height - padding.bottom, padding.top])
	.domain(d3.extent(myData.values, function(d) { return d.value; }))
	.nice();
    myData.xAxis = d3.svg.axis()
	.orient('bottom')
	.scale(xScale)
	.ticks(10);
    myData.yAxis = d3.svg.axis()
	.orient('left')
	.scale(myData.yScale)
    	.ticks(3);
    myData.line = d3.svg.line()
	.x(function(d) { return xScale(d.time); })
    	.y(function(d) { return myData.yScale(d.value); });
    myData.plot.append('path')
    	.attr('class', 'line');
    myData.plot.append('g')
    	.attr('class', 'yaxis axis')
        .attr('transform', 'translate('+padding.left+',0)');
    myData.plot.append('g')
    	.attr('class', 'xaxis axis')
    	.attr('transform', 'translate(0,'+ (height - padding.bottom) +')');
    updatePlots();

}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('randomButton')
	.addEventListener('click', function() {
            makeRandom();
	});
    document.getElementById('start')
	.addEventListener('change', function() {
	    updatePlots();
	});
    document.getElementById('end')
	.addEventListener('change', function() {
	    updatePlots();
	});
    init();
});
