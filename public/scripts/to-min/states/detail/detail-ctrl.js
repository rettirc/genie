angular.module('genie.detail-ctrl', [])
.controller('DetailCtrl', function($scope, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}

    k = {id: "Person", text: "Sue", children: [], childViz: false};
    l = {id: "Person", text: "Bill", children: [], childViz: false};

    f = {id: "Person", text: "John", children: [], childViz: false};
    g = {id: "Person", text: "Bob", children: [k,l], childViz: false};
    h = {id: "Person", text: "Suzy", children: [], childViz: false};
    i = {id: "Person", text: "Sally", children: [k], childViz: false};
    j = {id: "Person", text: "Jane", children: [], childViz: false};

    b = {id: "Hobby", text: "Trumpeting", children: [h, i, j]};
    c = {id: "Profession", text: "Code Monkey", children: [f, g]};
    d = {id: "Education", text: "Finished College", children: [g, i]};
    e = {id: "Religion", text: "Mormon", children: [j, h]};

    treeData = {id: "Name", text: "Ritter1", children: [b, c, d, e]};

    // Set the dimensions and margins of the diagram
    var margin = {top: 20, right: 110, bottom: 30, left: 110},
        width = 1160 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#detailView").append("svg") // The page currently has no svg element. Fix this
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate("
              + margin.left + "," + margin.top + ")");

    var i = 0,
        duration = 750,
        root;

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
        if(d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }

    function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 180});

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return (d.data.id == "Person" ? "" : d.data.id + ": ") + d.data.text; });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

            // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y}
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`
            return path
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
    }
    //
    // var svg = d3.select("#detailView").append("svg") // The page currently has no svg element. Fix this
	// 	.attr("width", '100%')
	// 	.attr("height", 600) // Arbitrary size
    //     .on("mouseup", mouseup);
    //     color = d3.scaleOrdinal(d3.schemeCategory10);
    //
    // var width = $("#detailView svg").width();
    // var height = $("#detailView svg").height();
    //
    // var mouseup_node, mousedown_node;
    //
    // var simulation = d3.forceSimulation()
    //     .force("charge", d3.forceManyBody().strength(-1500))
    //     .force("link", d3.forceLink().distance(350))
    //     .force("collide", d3.forceCollide().radius(90).iterations(2))
    //     .force("x", d3.forceX())
    //     .force("y", d3.forceY())
    //     .alphaTarget(1)
    //
    // nodes = []
    // links = []
    // f = {id: "Person", text: "John", children: [], childViz: false};
    // g = {id: "Person", text: "Bob", children: [], childViz: false};
    // h = {id: "Person", text: "Suzy", children: [], childViz: false};
    // i = {id: "Person", text: "Sally", children: [], childViz: false};
    // j = {id: "Person", text: "Jane", children: [], childViz: false};
    //
    // b = {id: "Hobby", text: "Trumpeting", children: [f, g, h, i, j], childViz: false};
    // c = {id: "Profession", text: "Code Monkey", children: [], childViz: false};
    // d = {id: "Education", text: "Finished College", children: [], childViz: false};
    // e = {id: "Religion", text: "Mormon", children: [], childViz: false};
    //
    // a = {id: "Name", text: "Ritter1", fx: 0, fy:0, children: [b, c, d, e], childViz: true};
    //
    //
    // function resetLayout() {
    //     nextList = [a]
    //     while (nextList.length != 0) {
    //         parent = nextList.shift()
    //         nodes.push(parent)
    //         console.log(parent.childViz);
    //         if (parent.childViz) {
    //             for (var i = 0; i < parent.children.length; i++) {
    //                 links.push({source: parent, target: parent.children[i]})
    //                 nextList.push(parent.children[i])
    //             }
    //         }
    //     }
    //     restart(nodes, links)
    // }
    //
    // function restart(nodes, links) {
    //     d3.selectAll("svg > *").remove();
    //     var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    //
    //     var link = g.append("g")
    //         .classed("links", true)
    //         .selectAll("g.link")
    //         .data(links)
    //         .enter()
    //         .append("line")
	// 		.attr("marker-end", null);
    //
    //     var node = g.append("g")
    // 		.classed("nodes", true)
    // 		.selectAll("g.node")
    // 		.data(nodes)
    // 		.enter()
    // 		.append("svg")
    //
    //     // node.exit().remove();
    //     node.append("rect")
    //         .attr("fill", "red")
    //         .attr("width", 100)
    //         .attr("height", 100)
    //         .on("mousedown",
    //             function(d) {
    //                 mousedown_node = d;
    //             }
    //         )
    //         .on("mouseup",
    //             function(d) {
    //                 mouseup_node = d;
    //              }
    //         )
    //
    //     // Update and restart the simulation.
    //     simulation.nodes(nodes);
    //     simulation.on("tick", ticked);
    //     simulation.force("link").links(links);
    //
    //     node.each(
    //         function(d) {
    //             var descriptionLines = [];
    //             descriptionLines.push(d.id + ":")
    //             var textLine = d.text;
    //             descriptionLines.push(d.text);
    //             var group = d3.select(this);
    //             for (var i = 0; i < descriptionLines.length; i++) {
    //                 group.append("text")
    //                 .classed("info",true)
    //                 .attr("x", 5)
    //                 .attr("y", (i + 1) * 20)
    //                 .text(descriptionLines[i]);
    //             }
    //         }
    //     );
    //     // setTimeout(function () {
    //     //     simulation.stop()
    //     // }, 350);
    //
    //     var targetDist = 50;
    //
    //     function ticked() {
    //
    //         // connections.attr("d", function(d) {
    //         // 	var n1 = json.nodes[d.source];
    //         // 	var n2 = json.nodes[d.target];
    //         // 	return "M" + n1.x + " " + n1.y + " Q " + n2.x + " " + n1.y + " " + n2.x + " " + n2.y; // Quadratic Bessier Curve
    //         // });
    //
    //         link.attr("x1", function(d) {
    //                     var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
    //                     return d.source.x + 50 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1 / Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
    //             })
    //             .attr("y1",  function(d) {
    //                     var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
    //                     return d.source.y - 50 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
    //             })
    //             .attr("x2",  function(d) {
    //                     var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
    //                     return d.target.x - targetDist * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1/Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
    //                 })
    //             .attr("y2",  function(d) {
    //                     var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
    //                     return d.target.y + targetDist * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
    //                 });
    //
    //         node.attr("x", function(d) {return d.x - 50;})
    //             .attr("y", function(d) {return d.y - 50;});
    //     }
    //
    //     simulation.alpha(1).restart();
    //
    // }
    //
    // function mouseup() {
    //     if (mouseup_node && mousedown_node && mousedown_node == mousedown_node) {
    //         if (!mouseup_node.childViz) {
    //             console.log(nodes[1]);
    //             nodes[1].childViz = true
    //         } else {
    //             nodes[1].childViz = false
    //         }
    //         console.log(nodes[1].childViz);
    //     }
    //     resetLayout()
    //     // clear mouse event vars
    //     mouseup_node = null;
    //     mousedown_node = null;
    // }
    //
    // resetLayout()
});
