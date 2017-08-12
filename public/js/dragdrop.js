function setupDragDrop(board, nodes) {

    //  Allow the house to be put back
    $(".housebox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("house")) {
                return true;
            }
        },
        drop: function (event, ui) {
            //  Clear top/left so house lines up
            ui.draggable.attr('style', '');

            //  Update counts
            checkCounts();

            //  Update nodes
            clearNode(nodes, event, ui);
        }
    });

    //  Allow the city to be put back
    $(".citybox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("city")) {
                return true;
            }
        },
        drop: function (event, ui) {
            //  Clear top/left so house lines up
            ui.draggable.attr('style', '');

            //  Update counts
            checkCounts();

            //  Update nodes
            clearNode(nodes, event, ui);
        }
    });


    //  Allow the road to be put back
    $(".roadbox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("road")) {
                return true;
            }
        },
        drop: function (event, ui) {
            //  Clear top/left so house lines up
            ui.draggable.attr('style', '');

            //  Reset angle
            ui.draggable.removeClass("angle0").removeClass("angle30").removeClass("angle90").removeClass("angle330").addClass("angle30");

            //  Update counts
            checkCounts();

            //  Update nodes
            clearNode(nodes, event, ui);
        }
    });

    //  Setup house drag/drop
    $(".house").draggable({
        revert: 'invalid',

        start: function (event, ui) {
            checkCounts();
            showOpen(nodes, "house", event.target.className);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            checkCounts();
            hideOpen("house");
        }
    });
    $("div[class*='node']").droppable({
        greedy: true,
        accept: function (d) {
            if (d.hasClass("house") || d.hasClass("city") || d.hasClass("road")) {
                return true;
            }
        },
        drop: function (event, ui) {
            //  Clear previous node if needed
            clearNode(nodes, event, ui);

            //  Update counts
            checkCounts();

            //  Update nodes
            setNode(nodes, event, ui);
        }
    });

    //  Setup city drag/drop
    $(".city").draggable({
        revert: 'invalid',

        start: function (event, ui) {
            checkCounts();
            showOpen(nodes, "city", event.target.className);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            checkCounts();
            hideOpen("city");
        }
    });

    //  Setup road drag/drop
    $(".road").draggable({
        revert: 'invalid',

        start: function (event, ui) {
            checkCounts();
            showOpen(nodes, "road", event.target.className);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            checkCounts();
            hideOpen("road");
        }
    });

}

function showOpen(nodes, type, ignoreClass) {
    //  The ignoreClass is the class of the object that was picked back up
    //  We need to find the node it is sitting on, and pretend it does not 
    //  exist for the ghost images to be rendered accurately
    var ignoreNode = findNodeByStructureClass(nodes, ignoreClass);

    var setupPhase = true;
    if (type == "house") {
        if (setupPhase) {
            //  If in setup mode, show all build spots at least 2 intersections away
            //  from another house
            $("div[class*='buildspot']").hide();
            $("div[class*='buildspot']").each(function () {
                var theNode = findNodeById(nodes, $(this).attr('id'));
                if (canBuild(nodes, theNode, ignoreNode)) {
                    $(this).show();
                }
            });
        } else {
            //  In turn mode, show all with an adjacent road at least 2 intersections
            //  away from another house
            $("div[class*='buildspot']").each(function () {
                var theNode = findNodeById(nodes, $(this).attr('id'));
                if (canBuild(nodes, theNode, ignoreNode) || canBuildRoad(nodes, theNode, ignoreNode)) {
                    $(this).show();
                }
            });
        }
    }
    if (type == "road") {
        //  In both setup and turn mode, the road simply needs an adjacent road
        //  or building of the same colour
        $("div[class*='roadspot']").each(function () {
            var theNode = findNodeById(nodes, $(this).attr('id'));
            if (canBuildRoad(nodes, theNode, ignoreNode)) {
                $(this).show();
            }
        });
    }
}
function hideOpen(type) {
    $(".node").hide();
}

//  When a building it dropped on the board
function setNode(nodes, event, ui) {
    //  Add to this node
    var theNode = findNodeById(nodes, event.target.id);
    if (theNode) {
        //  Update the node with the id of the object
        theNode.structure = event.toElement.id;

        //  Now we check the object to see where it came from
        clearNode(nodes, event);

        //  Now set the object class so we know where it is
        event.toElement.className += " currentnode" + theNode.tileID + "_" + theNode.id;

        //  With roads, we need to rotate to fit spot
        if (theNode.structure.indexOf("road") > -1) {
            rotateRoad(event);
        }

    }
}

//  When a building is returned to the pile
function clearNode(nodes, event) {
    var newClass = "";
    var classes = event.toElement.className.split(' ');
    classes.forEach(function (theClass) {
        if (theClass.indexOf("currentnode") > -1) {
            var oldNode = findNodeById(nodes, theClass.replace("currentnode", "").replace("_", "."));
            if (oldNode != null) {
                oldNode.structure = "";
            }
        } else {
            newClass += theClass + " ";
        }
    });
    event.toElement.className = newClass;
}

function checkCounts() {
    //  Count the number of remaining settlements
    var count = 0;
    $(".housebox > div").each(function () {
        count += (parseInt($(this).css('left')) > -50 ? 1 : 0);
    });
    $(".housecount").html(count);

    //  Count the number of remaining cities
    count = 0;
    $(".citybox > div").each(function () {
        count += (parseInt($(this).css('left')) > -50 ? 1 : 0);
    });
    $(".citycount").html(count);

    //  Count the number of remaining roads
    count = 0;
    $(".roadbox > div").each(function () {
        count += (parseInt($(this).css('left')) > -50 ? 1 : 0);
    });
    $(".roadcount").html(count);
}

function rotateRoad(event) {
    var ids = event.target.id.split('.');

    //  Buildings have no need to be rotated, so set default to 0
    //  Others are based on 0 being horizontal
    var angle = 0;
    if (ids[1] == 1 || ids[1] == 7) { angle = 30; }
    if (ids[1] == 3 || ids[1] == 9) { angle = 90; }
    if (ids[1] == 5 || ids[1] == 11) { angle = 330; }

    //  Swap out class
    event.toElement.className = event.toElement.className.replace("angle0", "angle" + angle).replace("angle30", "angle" + angle).replace("angle90", "angle" + angle).replace("angle330", "angle" + angle)

    //  Add new class
}

/*
    Helper method to find a node based on the class
*/
function findNodeByStructureClass(nodes, className) {
    if (className.length > 0) {
        var classes = className.split(' ');

        for (var i = 0; i < classes.length; i++) {
            if (classes[i].indexOf("currentnode") > -1) {
                var theNode = findNodeById(nodes, classes[i].replace("currentnode", "").replace("_", "."));
                return theNode;
            }
        }
    }
    return null;
}

//  This method helps to find a specific node based on the id in the div tag
function findNodeById(nodes, id) {
    //  First index is the tile
    //  Second index is the node
    var coords = id.split('.');
    for (var i=0; i< nodes.length; i++) {
        var theNode = nodes[i];
        if (theNode.tileID == coords[0] && theNode.id == coords[1]) {
            return theNode;
        }
    }
    return null;
}

function canBuild (nodes, theNode, ignoreNode) {
    var valid = true;
    if (theNode.structure.length == 0) {
        for (var i=0; i<theNode.neighbors.length; i++) {
            var neighbor = nodes[theNode.neighbors[i]];
            if (neighbor != null) {
                if (neighbor != ignoreNode) {
                    if (neighbor.structure.length > 0 && neighbor.type == 'buildspot') {
                        valid = false;
                    }

                }
            }
        }
    } else {
        valid = false;
    }
    return valid;
}

//  A method to determine if a colour can reach this node to build
function canBuildRoad (nodes, theNode, ignoreNode) {
    var valid = false;
    if (theNode.structure.length == 0) {
        for (var i=0; i<theNode.neighbors.length; i++) {
            var neighbor = nodes[theNode.neighbors[i]];
            if (neighbor != null) {
                if (neighbor != ignoreNode) {
                    valid = true;
                    if (neighbor.structure.length > 0 && neighbor.type == 'roadspot') {
                        valid = true;

                        /*
                        if (neighbor.structure.indexOf(theGame.currentPlayer.colour) > -1) {
                            valid = true;
                        }
                    }
                    if (neighbor.structure.length > 0 && neighbor.type == 'buildspot') {
                        if (neighbor.structure.indexOf(theGame.currentPlayer.colour) > -1) {
                            valid = true;
                        }
                        */
                    }
                }
            }
        }
    }
    return valid;
}

