angular.module('genie.detail-ctrl', [])
.controller('DetailCtrl', function($scope, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}

    var svg = d3.select("#detailView").append("svg") // The page currently has no svg element. Fix this
		.attr("width", '100%')
		.attr("height", 600) // Arbitrary size
        .on("mouseup", mouseup);
        color = d3.scaleOrdinal(d3.schemeCategory10);

    var width = $("#detailView svg").width();
    var height = $("#detailView svg").height();

    var mouseup_node, mousedown_node;

    var simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-1500))
        .force("link", d3.forceLink().distance(350))
        .force("collide", d3.forceCollide().radius(90).iterations(2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaTarget(1)

    nodes = []
    links = []
    f = {id: "Person", text: "John", children: [], childViz: false};
    g = {id: "Person", text: "Bob", children: [], childViz: false};
    h = {id: "Person", text: "Suzy", children: [], childViz: false};
    i = {id: "Person", text: "Sally", children: [], childViz: false};
    j = {id: "Person", text: "Jane", children: [], childViz: false};

    b = {id: "Hobby", text: "Trumpeting", children: [f, g, h, i, j], childViz: false};
    c = {id: "Profession", text: "Code Monkey", children: [], childViz: false};
    d = {id: "Education", text: "Finished College", children: [], childViz: false};
    e = {id: "Religion", text: "Mormon", children: [], childViz: false};

    a = {id: "Name", text: "Ritter1", fx: 0, fy:0, children: [b, c, d, e], childViz: true};


    function resetLayout() {
        nextList = [a]
        while (nextList.length != 0) {
            parent = nextList.shift()
            nodes.push(parent)
            console.log(parent.childViz);
            if (parent.childViz) {
                for (var i = 0; i < parent.children.length; i++) {
                    links.push({source: parent, target: parent.children[i]})
                    nextList.push(parent.children[i])
                }
            }
        }
        restart(nodes, links)
    }

    function restart(nodes, links) {
        d3.selectAll("svg > *").remove();
        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var link = g.append("g")
            .classed("links", true)
            .selectAll("g.link")
            .data(links)
            .enter()
            .append("line")
			.attr("marker-end", null);

        var node = g.append("g")
    		.classed("nodes", true)
    		.selectAll("g.node")
    		.data(nodes)
    		.enter()
    		.append("svg")

        // node.exit().remove();
        node.append("rect")
            .attr("fill", "red")
            .attr("width", 100)
            .attr("height", 100)
            .on("mousedown",
                function(d) {
                    mousedown_node = d;
                }
            )
            .on("mouseup",
                function(d) {
                    mouseup_node = d;
                 }
            )

        // Update and restart the simulation.
        simulation.nodes(nodes);
        simulation.on("tick", ticked);
        simulation.force("link").links(links);

        node.each(
            function(d) {
                var descriptionLines = [];
                descriptionLines.push(d.id + ":")
                var textLine = d.text;
                descriptionLines.push(d.text);
                var group = d3.select(this);
                for (var i = 0; i < descriptionLines.length; i++) {
                    group.append("text")
                    .classed("info",true)
                    .attr("x", 5)
                    .attr("y", (i + 1) * 20)
                    .text(descriptionLines[i]);
                }
            }
        );
        // setTimeout(function () {
        //     simulation.stop()
        // }, 350);

        var targetDist = 50;

        function ticked() {

            // connections.attr("d", function(d) {
            // 	var n1 = json.nodes[d.source];
            // 	var n2 = json.nodes[d.target];
            // 	return "M" + n1.x + " " + n1.y + " Q " + n2.x + " " + n1.y + " " + n2.x + " " + n2.y; // Quadratic Bessier Curve
            // });

            link.attr("x1", function(d) {
                        var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
                        return d.source.x + 50 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1 / Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
                })
                .attr("y1",  function(d) {
                        var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
                        return d.source.y - 50 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
                })
                .attr("x2",  function(d) {
                        var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
                        return d.target.x - targetDist * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1/Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
                    })
                .attr("y2",  function(d) {
                        var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
                        return d.target.y + targetDist * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
                    });

            node.attr("x", function(d) {return d.x - 50;})
                .attr("y", function(d) {return d.y - 50;});
        }

        simulation.alpha(1).restart();

    }

    function mouseup() {
        if (mouseup_node && mousedown_node && mousedown_node == mousedown_node) {
            if (!mouseup_node.childViz) {
                console.log(nodes[1]);
                nodes[1].childViz = true
            } else {
                nodes[1].childViz = false
            }
            console.log(nodes[1].childViz);
        }
        resetLayout()
        // clear mouse event vars
        mouseup_node = null;
        mousedown_node = null;
    }

    resetLayout()
});
