function setupDragDrop() {

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
            clearNode(event, ui);
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
            clearNode(event, ui);
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
            clearNode(event, ui);
        }
    });

    //  Setup house drag/drop
    $(".house").draggable({
        revert: 'invalid',

        start: function (event, ui) {
            checkCounts();
            showOpen("house", event.target.className);
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
            clearNode(event, ui);

            //  Update counts
            checkCounts();

            //  Update nodes
            setNode(event, ui);
        }
    });

    //  Setup city drag/drop
    $(".city").draggable({
        revert: 'invalid',

        start: function (event, ui) {
            checkCounts();
            showOpen("city", event.target.className);
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
            showOpen("road", event.target.className);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            checkCounts();
            hideOpen("road");
        }
    });

}

function showOpen(type, ignoreClass) {
    //  The ignoreClass is the class of the object that was picked back up
    //  We need to find the node it is sitting on, and pretend it does not 
    //  exist for the ghost images to be rendered accurately
    var ignoreNode = findNodeByStructureClass(ignoreClass);

    if (type == "house") {
        if (theGame.setupPhase) {
            //  If in setup mode, show all build spots at least 2 intersections away
            //  from another house
            $("div[class*='buildspot']").hide();
            $("div[class*='buildspot']").each(function () {
                var node = findNodeById($(this).attr('id'))
                if (node.canBuild(ignoreNode)) {
                    $(this).show();
                }
            });

        } else {
            //  In turn mode, show all with an adjacent road at least 2 intersections
            //  away from another house
            $("div[class*='buildspot']").each(function () {
                var node = findNodeById($(this).attr('id'))
                if (node.canBuild(ignoreNode) || node.canBuildRoad(ignoreNode)) {
                    $(this).show();
                }
            });
        }
    }
    if (type == "road") {
        //  In both setup and turn mode, the road simply needs an adjacent road
        //  or building of the same colour
        $("div[class*='roadspot']").each(function () {
            var node = findNodeById($(this).attr('id'))
            if (node.canBuildRoad(ignoreNode)) {
                $(this).show();
            }
        });
    }
}
function hideOpen(type) {
    $(".node").hide();
}

//  When a building it dropped on the board
function setNode(event, ui) {
    //  Add to this node
    var theNode = findNodeById(event.target.id);
    if (theNode) {
        //  Update the node with the id of the object
        theNode.structure = event.toElement.id;

        //  Now we check the object to see where it came from
        clearNode(event);

        //  Now set the object class so we know where it is
        event.toElement.className += " currentnode" + theNode.tileID + "_" + theNode.id;

        //  With roads, we need to rotate to fit spot
        if (theNode.structure.indexOf("road") > -1) {
            rotateRoad(event);
        }

        //  During the setup rounds, special rules apply for when a round is done
        if (theGame.round < 2) {
            checkSetupEnd(theNode);
        }
    }
}

function checkSetupEnd(theNode) {
    if (theNode.structure.length > 0) {
        if (theNode.structure.indexOf("house") > -1) {
            $(".housebox_disable").show();
            theGame.currentPlayer.freeHouse = 0;
        }
        if (theNode.structure.indexOf("road") > -1) {
            $(".roadbox_disable").show();
            theGame.currentPlayer.freeRoad = 0;
        }
    }

    if ($(".roadbox_disable").css('display') == "block" && $(".housebox_disable").css('display') == "block") {
        //  If player is done, enable the Finish Turn button
        $(".finishturnbutton").removeClass("disabled");
    }
}

//  When a building is returned to the pile
function clearNode(event) {
    var newClass = "";
    var classes = event.toElement.className.split(' ');
    classes.forEach(function (theClass) {
        if (theClass.indexOf("currentnode") > -1) {
            var oldNode = findNodeById(theClass.replace("currentnode", "").replace("_", "."));
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
