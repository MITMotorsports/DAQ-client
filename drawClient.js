var data = [{name: 'throttle', value: 50, units:   '%'},
	    {name:    'brake', value:  1, units: 'atm'}];

var padding = 5;
var textSize = 24;

var getWidth = function(){
    return document.body.clientWidth;
};

var getHeight = function(){
    return window.innerHeight;
};

var width = getWidth();
var height = getHeight() - 2 * padding;

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);
var background = svg.append('g').append('svg:image')
    .attr('xlink:href', 'background.svg')
    .attr('width', height - 2 * padding)
    .attr('height', height - 2 * padding)
    .attr('x', padding)
    .attr('y', padding);
var color = d3.scale.category20();
var rectangles = svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', function(d, i){
	return width - 3 * padding - height;
    })
    .attr('height', 2 * textSize + 3 * padding)
    .attr('x', function(d){
	return height + 2 * padding;
    })
    .attr('y', function(d, i){
	return ((2 * textSize + 3 * padding) + padding) * i;
    })
    .style('fill', 'none')
    .attr('stroke', function(d, i){
	return color(i);
    })
    .attr('stroke-width', 2);
var text = rectangles.append('text')
    .text(function(d, i){
	return d.name;
    })
    .attr('x', function(d, i){
	return height + 3 * padding;
    })
    .attr('y', function(d, i){
	return (2 * textSize + 3 * padding) * i + padding;
    })
    .attr('font-family', 'sans-serif')
    .attr('font-size', function(){
	return '' + textSize + 'px';
    })
    .attr('fill', 'black');
