// matrix representation of the data and a d3 command to transform the data for the visualization
var matrix = [
  [11975,  5871, 8916, 2868],
  [ 1951, 10048, 2060, 6171],
  [ 8010, 16145, 8090, 8045],
  [ 1013,   990,  940, 6907]
];
// Constructs a new chord layout, used to generate data objects which describe the chords, serving as input to the chord shape. 
var chord = d3.layout.chord()
    // sets the angular padding between groups to the specified value in radians.
    .padding(.05)
    // sets the sort order of groups (rows) for the layout using the specified comparator function. The comparator function is invoked for pairs of rows, being passed the sum of row i and row j.
    .sortSubgroups(d3.descending)
    // sets the input data matrix used by this layout.
    .matrix(matrix);

// set the width height of the svg, and set the radius of the diagram's inner and outter radius
var width = 960,
    height = 500,
    innerRadius = Math.min(width, height) * .41,
    outerRadius = innerRadius * 1.1;

// sets the input domain of the ordinal scale to the specified array of values.
var fill = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

// Construct a new svg element and set the diagram to the proper position with attr "transform"
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
// Add a new element to the SVG for each artist that corresponds to an area on that annulet.
svg.append("g").selectAll("path")
    // Returns the computed group objects, given the layout's current configuration and associated matrix.
    .data(chord.groups)
    .enter().append("path")
    // fill the arcs with the specific color
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { return fill(d.index); })
      // sets the Radius-accessor to the specified function or constant.
      .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      // add mousefunction to the arcs which will call the fade function
      .on("mouseover", fade(.1))
      .on("mouseout", fade(1));
// Construct a new svg element which contains the ticks of the diagram
var ticks = svg.append("g").selectAll("g")
    .data(chord.groups)
    .enter().append("g").selectAll("g")
    .data(groupTicks)
    .enter().append("g")
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + outerRadius + ",0)";
    });

// append the ticks
ticks.append("line")
    // distance between the line and the circle
    .attr("x1", 1)
    .attr("y1", 0)
    // length of the line
    .attr("x2", 5)
    .attr("y2", 0)
    .style("stroke", "#000");
// append the text
ticks.append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .text(function(d) { return d.label; });
// connecting artist sources and targets
svg.append("g")
    .attr("class", "chord")
    .selectAll("path")
    .data(chord.chords)
    .enter().append("path")
    .attr("d", d3.svg.chord().radius(innerRadius))
    .style("fill", function(d) { return fill(d.target.index); })
    .style("opacity", 1);

// Returns an array of tick angles and labels, given a group.
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1000).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v / 1000 + "k"
    };
  });
}

// To hide some of the diagram showing only relevant parts when hovering one of the artists, add a mouseover and mouseout event to the diagram, changing the opacity of the relevant elements.
function fade(opacity) {
  return function(g, i) {
    svg.selectAll(".chord path")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
        .transition()
        .style("opacity", opacity);
  };
}