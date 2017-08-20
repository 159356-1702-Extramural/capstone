//set turn actions here so they are available in client.js
var turn_actions = [];

function setupDragDrop() {
    //  Allow the house to be put back
    $(".housebox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("house")) { return true; }
        },
        drop: function (event, ui) {
            return_object("house", event, ui);
        }
    });

    //  Allow the city to be put back
    $(".citybox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("city")) { return true; }
        },
        drop: function (event, ui) {
            return_object("city", event, ui);
        }
    });

    //  Allow the road to be put back
    $(".roadbox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("road")) { return true; }
        },
        drop: function (event, ui) {
            return_object("road", event, ui);
        }
    });

    //  Setup house drag/drop
    $(".house:not(.locked)").draggable({
        revert: 'invalid',
        start: function (event, ui) {
            show_open_spots("house", event.target.id);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            hide_open_spots("house");
        }
    });
    $(".buildspot:not(.disabled)").droppable({
        greedy: true,
        accept: function (d) {
            if (d.hasClass("house") || d.hasClass("city")) {
                return true;
            }
        },
        drop: function (event, ui) {
            set_object_on_canvas(event, ui);
        }
    });

    //  Setup city drag/drop
    $(".city").draggable({
        revert: 'invalid',
        start: function (event, ui) {
            show_open_spots("city", event.target.id);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            hide_open_spots("city");
        }
    });

    //  Setup road drag/drop
    $(".road:not(.roadspot)").draggable({
        revert: 'invalid',
        start: function (event, ui) {
            show_open_spots("road", event.target.id);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            hide_open_spots("road");
        }
    });
    $(".roadspot:not(.disabled)").droppable({
        greedy: true,
        accept: function (d) {
            if (d.hasClass("road")) {
                return true;
            }
        },
        drop: function (event, ui) {
            set_object_on_canvas(event, ui);
        }
    });

}

//  Method to show the ghost images for any valid nodes that this object
//  can be built on
function show_open_spots(object_type, ignore_id) {
    //  Local reference to nodes object
    var nodes = game_data.board.nodes;
    if (object_type == "road") {
        nodes = game_data.board.roads;
    }

    //  If object is on the canvas, ignore the associated node
    var node_to_ignore = null;
    if (ignore_id.indexOf("_pending_") > -1) {
        ignore_id = parseInt(ignore_id.replace(object_type + "_" + current_player.colour + "_pending_", ""));
        node_to_ignore = nodes[ignore_id];
    }

    //  Now manage specific object types
    if (object_type == "house") {
        if (game_data.round_num < 3) {
            //  Setup mode: Show all valid build spots on the board
            $(".buildspot:not(.locked)").hide();
            $(".buildspot:not(.locked)").each(function () {
                //  Find the node in the nodes object based on the id of this object
                var node_id = parseInt($(this).attr('id').replace("node_", ""));

                //  Now check to see if we can build here
                if (can_build(nodes[node_id], node_to_ignore)) {
                    $(this).show();
                }
            });
        } else {
            //  Normal mode: Show build spots this user can reach
            if (can_build(nodes[node_id], node_to_ignore)) {
                $(this).show();
            }
        }
    }
    if (object_type == "road") {
        //  All modes: show road spots user is connected to
        $(".roadspot:not(locked)").each(function () {
            //  Find the road in the roads object based on the id of this object
            var road_id = parseInt($(this).attr('id').replace("road_", ""));

            if (can_build_road(nodes[road_id], node_to_ignore)) {
                $(this).show();
            }
        });
    }

    if (object_type == "city") {
        doLog(object_type);
        //  Not allowed in setup mode, all other modes
        //if (game_data.round_num > 2) {
            $(".node.house.locked." + current_player.colour).each(function () {
                $(this).addClass("expand");
            });
        //}
    }
}
function hide_open_spots(type) {
    $(".buildspot:not(locked)").hide();
    $(".roadspot:not(locked)").hide();
    $(".node.house.locked." + current_player.colour).each(function () {
        $(this).removeClass("expand");
    });
}

//  When a building it dropped on the board
function set_object_on_canvas(event, ui) {
    //  From the canvas, get the node and object being dragged
    var object_dragged_id = ui.draggable[0].id;
    var object_dragged = $("#" + object_dragged_id);
    var node_on_canvas = $("#" + event.target.id);
    
    //  Get the type of structure
    var object_type = (object_dragged_id.indexOf("house") > -1 ? "house" : (object_dragged_id.indexOf("road") > -1 ? "road" : "city"));
    
    //  Nodes vs Roads reference
    var nodes = game_data.board.nodes;
    if (object_type == "road") {
        nodes = game_data.board.roads;
    }

    //  Grab the node/road based on the drop target
    var node_id = parseInt(node_on_canvas.attr("id").replace("road_", "").replace("node_", ""));
    var node = nodes[node_id];
    
    //  Update game data node/road
    if (node.building) { node.building = object_type; }
    node.status = "pending";
    node.owner = current_player.id;

    //  If the object came from another node, clear that node
    if (object_dragged_id.indexOf("_pending_") > -1) {
        var last_node_id = parseInt(object_dragged_id.replace(object_type + "_" + current_player.colour + "_pending_", ""));
        var last_node = nodes[last_node_id];
        if (node.building) { last_node.building = ""; }
        last_node.owner = -1;
    }
    
    //  Adjust top/left to match node and put it in the body
    object_dragged.css("top", node_on_canvas.css("top"));
    object_dragged.css("left", node_on_canvas.css("left"));
    object_dragged.appendTo($("body"));
    
    //  Finally, adjust the class of this object to point to this node
    $("#" + object_dragged_id).attr("id", object_type + "_" + current_player.colour + "_pending_" + node_id);
    
    //  If this is a road, we might need to adjust the angle
    if (object_type == "road") {
        var classes = node_on_canvas.attr('class').split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].indexOf("angle") > -1) {
                var object_class = object_dragged.attr('class').replace("angle30", "").replace("angle90", "").replace("angle330", "");
                object_dragged.attr("class", object_class);
                object_dragged.addClass(classes[i]);
                break;
            }
        }
    }

    // TODO if in the setup phase, no boost cards required
    if(true){
        create_player_action(object_type, node, null);
    }else{
        // get boost cards from the boost dialogue and add them to boost_cards array
        // create_player_action(object_type, node, boost_cards);
    }
    
    update_object_counts();
}

function create_player_action(object_type, node, boost_cards){
    var action = new Action();
    action.action_type = object_type;
    action.action_data = node;
    action.boost_cards = boost_cards;
    turn_actions.push(action);
    console.log("action added to actions array");
}
//  If returning an object to the pile, reset position and class
function return_object(type, event, ui) {
    var object_dragged_id = ui.draggable[0].id;
    var object_dragged = $("#" + object_dragged_id);
    console.log(ui.draggable[0].id);
    console.log(event);
    console.log(ui);
    console.log('-----------------------------');
    console.log(turn_actions);
    //  First check to see if this is coming from something already on the canvas
    if (object_dragged_id.indexOf("_pending_") > -1) {
        //  From the canvas, get the node and object being dragged
        var node_on_canvas = $("#" + event.target.id);

        //  Get the type of structure
        var object_type = (object_dragged_id.indexOf("house") > -1 ? "house" : (object_dragged_id.indexOf("road") > -1 ? "road" : "city"));

        //  Nodes vs Roads reference
        var nodes = game_data.board.nodes;
        if (object_type == "road") {
            nodes = game_data.board.roads;
        }

        //  Find corresponding Action in actions array to modify or remove
        for ( var i = 0; i < turn_actions.length; i++ ) {

            // TODO Need node id to remove or modify turn_action
            // if ( turn_actions[i].action_data.id === ??? ){

            // }
        } 
        //  Clear the node it was dropped on
        var last_node_id = parseInt(object_dragged_id.replace(object_type + "_" + current_player.colour + "_pending_", ""));
        var last_node = nodes[last_node_id];
        if (last_node.building) { last_node.building = ""; }
        last_node.owner = -1;

        //  Reset class
        object_dragged.attr('class', object_type + ' ' + current_player.colour + ' ' + 'ui-draggable ui-draggable-handle');
        object_dragged.attr('style', '');

        //  Append to appropriate pile and clear positioning
        object_dragged.appendTo($("." + object_type + "box"));
        
        //  Reset node on canvas
        node_on_canvas.attr("class", (object_type == "road" ? "road roadspot" : "node buildspot") + " ui-droppable");

        //  Reset ID
        var original_class = object_type + '_' + current_player.colour + '_open_';
        object_dragged.attr('id', original_class + find_next_object_id(original_class));

        //  Update counts
        update_object_counts();
    } else {
        object_dragged.attr('style', '');
    }
}

function update_object_counts() {
    //  Count the number of remaining settlements
    var count = 0;
    $(".housebox > div").each(function () {
        count ++;
    });
    $(".housecount").html(count);

    //  Count the number of remaining cities
    count = 0;
    $(".citybox > div").each(function () {
        count ++;
    });
    $(".citycount").html(count);

    //  Count the number of remaining roads
    count = 0;
    $(".roadbox > div").each(function () {
        count ++;
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

function find_next_object_id(class_name) {
    var next_id = 0;
    for (next_id = 0; next_id < 20; next_id++) {
        var next = $("#" + class_name + next_id);
        if (next.length == 0) { break; }
    }
    return next_id;
}