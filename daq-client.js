var data = [
    {
	'key'   : 'tem',
	'name'  : 'Temperature',
	'units' : 'F',
	'values': [
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
    if (!isRealTime) {goRealTime();}
    if (listOfRandomMeasurements.length > 0){
	var mykey = listOfRandomMeasurements.pop();
	var start = Date.now();
	setInterval(function(){
	    record(mykey,
		   Math.random() * 1000,
		   Date.now() - start);
	}, 500);
	createPlot(mykey);
    } else {
	console.log('too many random measurements');
    }
}

var realTimeStartTime;
function goRealTime(){
    realTimeStartTime = Date.now();
    isRealTime = true;
    setInterval(function(){
	updateTable();
	updatePlots();
    }, realTimeUpdateFrequency);
}

function isScrolling(){
    return (isRealTime && (parseInt(document.getElementById('end').value) == 0));
}

var svg, table, rows, width, height;
function init(){
    var width = document.getElementById("plot-div").offsetWidth;
    xScale = d3.scale.linear()
	.range([padding.left, width - padding.right])
	.domain([xMin, xMax]);
//    createPlot('tem');
}

function record(key, value, time){
    getDataSet(key).values.push({'time': time, 'value': value});
}

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

var isRealTime = false;
var xScale, xMin = 0, xMax = Math.pow(2, 32), realTimeOffset = 500, realTimeUpdateFrequency = 500, transitionDuration = 250;
function updatePlots(){
    xMin = parseInt(document.getElementById('start').value);
    xMax = parseInt(document.getElementById('end').value);
    if (xMax == 0){
	for (var i = 0; i < plots.length; i++){
	    xMax = Math.max(d3.max(plots[i].values, function(d){ return d.time; }), xMax);
	}
	if (isRealTime){
	    if (xMax > (Date.now() - realTimeStartTime)){
		realTimeStartTime = Date.now() - xMax;
	    }
	    xMax = Date.now() - realTimeStartTime;
	}
    }
    if (xMin < 0) {
	xMin = xMax + xMin;
    }
    xScale.domain([xMin, xMax]);
    for (var i = 0; i < plots.length; i++){
	var myData = plots[i].values.filter(function(d) {return (d.time >= xMin && d.time <= xMax);});
	plots[i].yScale.domain(d3.extent(myData, function(d) { return d.value; }));
	if (isRealTime){
	    var svg = plots[i].plot.transition().ease('linear').duration(realTimeUpdateFrequency);
	    svg.select('.line')
		.attr('d', plots[i].line)
		.attr("transform", null);
	    svg.select('.xaxis').call(plots[i].xAxis);
	    svg.select('.yaxis').call(plots[i].yAxis);
	} else {
	    var svg = plots[i].plot.transition();
	    svg.select('.line') .duration(transitionDuration).attr('d', plots[i].line);
	    svg.select('.xaxis').duration(transitionDuration).call(plots[i].xAxis);
	    svg.select('.yaxis').duration(transitionDuration).call(plots[i].yAxis);
	}
    }
}

var plots = [];
var padding = {'top': 15, 'right': 30, 'bottom': 20, 'left': 60};
var createPlot = function(key){
    var myData = getDataSet(key);
    width = document.getElementById("plot-div").offsetWidth;
    height = 150;
    // Add the plot to the master list of visible plots
    plots.push(myData);
    // Create an individual SVG for the new plot
    myData.plot = d3.select('.plot-div').append('svg')
	.attr('width', width)
	.attr('height', height);
    myData.plot.append('clipPath')
	.attr('id', 'clipPath')
	.append('rect')
	.attr('x', padding.left)
    	.attr('y', padding.top)
    	.attr('width', width - padding.left - padding.right)
    	.attr('height', height - padding.top - padding.bottom);
    myData.yScale = d3.scale.linear()
	.range([height - padding.bottom, padding.top])
	.domain(d3.extent(myData.values, function(d) { return d.value; }))
	.nice();
    myData.xAxis = d3.svg.axis()
	.orient('bottom')
	.scale(xScale);
    myData.yAxis = d3.svg.axis()
	.orient('left')
	.scale(myData.yScale)
    	.ticks(3);
    myData.line = d3.svg.line()
	.x(function(d) { return xScale(d.time); })
    	.y(function(d) { return myData.yScale(d.value); });
    myData.plot.selectAll('.line')
	.data([myData.values])
	.enter()
	.append('path')
	.attr('class', 'line')
	.attr('clip-path', 'url(#clipPath)');
    myData.plot.append('g')
    	.attr('class', 'yaxis axis')
        .attr('transform', 'translate('+padding.left+',0)')
    	.call(myData.yAxis);
    myData.plot.append('g')
    	.attr('class', 'xaxis axis')
    	.attr('transform', 'translate(0,'+ (height - padding.bottom) +')')
	.call(myData.xAxis);
    var focus = myData.plot.append("g")
	.attr("class", "focus")
	.style("display", "none");
    focus.append("circle")
	.attr("r", 4.5);
    focus.append("text")
	.attr("x", 9)
	.attr("dy", ".35em");
    myData.plot.append('rect')
	.attr("class", "overlay")
	.attr("width", width)
	.attr("height", height)
	.on("mouseover", function() {
	    if (!isScrolling()) {
		focus.style("display", null);
	    }
	})
	.on("mouseout" , function() {
	    if (!isScrolling()){
		focus.style("display", "none");
	    }
	    updateTable();
	})
	.on("mousemove", function() {
	    if (isScrolling()) {return;}
	    var x0 = xScale.invert(d3.mouse(this)[0]),
		i = d3.bisector(function(d){ return d.time; }).left(myData.values, x0, 1),
		d0 = myData.values[i - 1],
		d1 = myData.values[i],
		d = x0 - d0.time > d1.time - x0 ? d1 : d0;
	    updateTable(x0);
	    focus.attr("transform", "translate(" + xScale(d.time) + "," +
		       myData.yScale(d.value) + ")");
	    focus.select("text").text(d.value);
	});
    updatePlots();

}

function getDataSet(key){
    for (var i = 0; i < data.length; i++){
	if (data[i].key == key){
	    return data[i];
	}
    }
    console.log('unknown key for plot');
    return;
}

function removePlot(key){
    getDataSet(key).plot.remove();
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
