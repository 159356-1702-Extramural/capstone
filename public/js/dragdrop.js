//set turn actions here so they are available in client.js
var turn_actions    = [];

function setupDragDrop() {
    //  Allow the settlement to be put back
    $(".settlementbox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("settlement")) { return true; }
        },
        drop: function (event, ui) {
            return_object_on_drop(event, ui);
        }
    });

    //  Allow the city to be put back
    $(".citybox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("city")) { return true; }
        },
        drop: function (event, ui) {
            return_object_on_drop(event, ui);
        }
    });

    //  Allow the road to be put back
    $(".roadbox").droppable({
        hoverClass: "hover",
        accept: function (d) {
            if (d.hasClass("road")) { return true; }
        },
        drop: function (event, ui) {
            return_object_on_drop(event, ui);
        }
    });

    //  Setup settlement drag/drop
    $(".settlement:not(.locked)").draggable({
        revert: 'invalid',
        start: function (event, ui) {
            show_open_spots("settlement", event.target.id);
        },
        drag: function () {
        },
        stop: function (event, ui) {
            hide_open_spots("settlement");
        }
    });
    $(".buildspot:not(.disabled)").droppable({
        greedy: true,
        accept: function (d) {
            if (d.hasClass("settlement") || d.hasClass("city")) {
                return true;
            }
        },
        drop: function (event, ui) {
            set_object_on_canvas(event, ui);
        }
    });

    $(".settlement.locked").droppable({
        greedy: true,
        accept: function (d) {
            if (d.hasClass("city") && d.hasClass(current_player.colour)) {
                return true;
            }
        },
        drop: function (event, ui) {
            set_object_on_canvas(event, ui);
        }
    });

    //  Setup city drag/drop
    $(".city:not(.locked)").draggable({
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
    $(".road:not(.roadspot, .locked)").draggable({
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
    //  The very first task is to see if we have the resources
    if (has_resources(object_type, ignore_id)) {
        //  Local reference to nodes object
        var nodes = current_game.nodes;
        if (object_type == "road") {
            nodes = current_game.roads;
        }

        //  If this item is on the board, we need a little info
        var node_to_ignore = null;
        var is_pending = false;
        var ignore_index = -1;
        if (ignore_id) {
            var temp = ignore_id.split('_');
            is_pending = ignore_id.indexOf("_pending_") > -1;
            if (is_pending) { ignore_index = parseInt(temp[temp.length-1]); }
        }

        //  If this item is on the board, see if it releases any dependents
        if (is_pending && object_type != "city") {
            node_to_ignore = nodes[ignore_index];
            return_dependents(object_type, node_to_ignore);
        }

        //  During setup, we can only place 1 settlement and 1 road
        if (current_game.round_num < 3 && node_to_ignore == null && turn_actions.length == 2) {
            return false;
        }
        
        //  Now manage specific object types
        if (object_type == "settlement") {
            //  When in setup, show all available spots, otherwise just connected ones
            if (turn_actions.length == 0 || node_to_ignore == turn_actions[0].action_data || current_game.round_num > 2) {
                //  Setup mode: Show all valid build spots on the board
                $(".buildspot:not(.locked)").hide();
                $(".buildspot:not(.locked)").each(function () {
                    //  Find the node in the nodes object based on the id of this object
                    var node_id = parseInt($(this).attr('id').replace("node_", ""));

                    //  Now check to see if we can build here (if not the node we are already on)
                    if (node_id != ignore_index) {
                        if (can_build(nodes[node_id], node_to_ignore)) {
                            $(this).show();
                        }
                    }
                });
            }
        }
        if (object_type == "road") {
            //  During setup, we can only place a road on the settlement from this round
            var node_to_enforce = null;

            //  Is this a setup round?
            if (current_game.round_num < 3) {
                //  If no settlement has been placed yet, nothing to do
                if (turn_actions.length == 0) { return false; }

                //  If we have a settlement, then it is the only settlement we can use
                if (turn_actions.length > 0) {
                    node_to_enforce = turn_actions[0].action_data;
                }
            }

            //  All modes: show road spots user is connected to
            $(".roadspot:not(locked)").each(function () {
                //  Find the road in the roads object based on the id of this object
                var road_id = parseInt($(this).attr('id').replace("road_", ""));
                if (road_id != ignore_index) {
                    if (can_build_road(nodes[road_id], node_to_ignore, node_to_enforce)) {
                        $(this).show();
                    }
                }
            });
        }

        if (object_type == "city") {
            //  Not allowed in setup mode, all other modes
            if (current_game.round_num > 2) {
                $(".node.settlement.locked." + current_player.colour).each(function () {
                    $(this).addClass("expand");
                });

                if (ignore_index > -1 && is_pending) {
                    $("#node_" + ignore_index).show();
                }
            }
        }
    } else {
        build_popup_no_resources(object_type);
    }
}
function hide_open_spots(type) {
    $(".buildspot:not(locked)").hide();
    $(".roadspot:not(locked)").hide();
    $(".node.settlement.locked." + current_player.colour).each(function () {
        $(this).removeClass("expand");
    });

    //  Re-hide any settlements where a city was picked up and then re-dropped
    $(".city:not(locked)").each(function () {
        var name = $(this).attr("id");
        if (name.indexOf("pending") > -1) {
            var names = name.split('_');
            $("#node_" + names[names.length-1]).hide();
        }
    });
}

//  When a building it dropped on the board
function set_object_on_canvas(event, ui) {
    //  From the canvas, get the node and object being dragged
    var object_dragged_id = ui.draggable[0].id;
    var object_dragged = $("#" + object_dragged_id);
    var node_on_canvas = $("#" + event.target.id);

    //  Get the type of structure
    var object_type = (object_dragged_id.indexOf("settlement") > -1 ? "settlement" : (object_dragged_id.indexOf("road") > -1 ? "road" : "city"));
    //  Nodes vs Roads reference
    var nodes = current_game.nodes;
    if (object_type == "road") {
        nodes = current_game.roads;
    }

    //  Double check that resources are available
    var can_build_this = has_resources(object_type, object_dragged_id);

    //  Grab the node/road based on the drop target
    var node_id = parseInt(node_on_canvas.attr("id").replace("road_", "").replace("node_", ""));
    var node = nodes[node_id];
    
    //  Make sure it is not already owned
    if (!can_build_this || (node.owner > -1 && object_type != "city") || (object_type == "city" && node.owner != current_game.player.id)) {
        //  This piece should not be placed, return it to its pile
        return_object(object_dragged, object_dragged_id, node_id, false);
        
        //  If it came from a node on the board, it needs to be reset
        if (object_dragged_id.indexOf("_pending_") > -1) {
            reset_node_on_board(object_dragged_id, object_type);
        }

        //  TODO: Nicer warning??
        alert("That was an invalid move.");
    } else {
        //  Update game data node/road
        if (node.building) { node.building = object_type; }
        node.status = "pending";
        node.owner = current_player.id;
        
        //  If the object came from another node, clear that node
        if (object_dragged_id.indexOf("_pending_") > -1) {
            reset_node_on_board(object_dragged_id, object_type);
        }

        //  Adjust top/left to match node and put it in the body
        object_dragged.css("top", node_on_canvas.css("top"));
        object_dragged.css("left", node_on_canvas.css("left"));
        object_dragged.appendTo($("body"));

        //  Finally, adjust the class of this object to point to this node
        var dragged_object_new_id = object_type + "_" + current_player.colour + "_pending_" + node_id;
        $("#" + object_dragged_id).attr("id", dragged_object_new_id);

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

        //  When placing a city, we need to hide the settlement
        if (object_type == "city") {
            node_on_canvas.hide();
        }

        //  Get resources from previous object if available
        var resource_list = [];
        if (object_dragged.attr("data-card-list")) {
            resource_list = (object_dragged.attr("data-card-list").split(","));
        }
    
        //  Is a road building card going to effect this action?
        var using_road_building_now = current_player.road_building_used && current_player.free_roads > 0 && object_type == "road";

        //  Create our action
        create_player_action(object_type, node, (using_road_building_now ? ["road_building"] : resource_list));
        if (resource_list.length == 0) {
            if (!current_player.road_building_used || (object_type != "road" && object_type != "city") || (current_player.road_building_used && current_player.free_roads == 0)) {
                if (current_game.round_num > 2) {
                    //  Prompt the user for more cards
                    build_popup_round_build(dragged_object_new_id, object_type);
                }
            }

            //  In the case of a road building card, take away the resources directly
            if (using_road_building_now) {
                take_resources(dragged_object_new_id, ["lumber","brick"]);
                current_player.free_roads --;
            } else if (object_type == "city") {
                take_resources(dragged_object_new_id, ["ore","ore","ore","grain","grain"]);
            }
        }

        update_object_counts();
        updatePanelDisplay();
    }
}
//  Helper method to reset a node/road on the canvas and in the nodes/roads object
function reset_node_on_board(object_dragged_id, object_type) {
    //  Nodes vs Roads reference
    var nodes = current_game.nodes;
    if (object_type == "road") {
        nodes = current_game.roads;
    }

    //  Find node to be reset
    var last_node_id = parseInt(object_dragged_id.replace(object_type + "_" + current_player.colour + "_pending_", ""));
    var last_node = nodes[last_node_id];
    
    //  If the last place we dropped it is locked, we don't clear it (It exists from a previous round)
    var last_canvas_node_class = $("#" + (object_type == "road" ? "road" : "node") + "_" + last_node_id).attr("class");
    if (last_canvas_node_class) {
        if (last_canvas_node_class.indexOf("locked") == -1) {
            if (last_node.building) { last_node.building = ""; }
            last_node.owner = -1;
            last_node.status = "";
        }
    }

    //  Remove it from the turn_actions array
    remove_action_from_list(object_type, last_node_id);
}

function create_player_action(object_type, node, boost_cards){
    var action = new Action();
    action.action_type = (object_type == "road" ? "build_road" : (object_type == "city" ? "build_city" : "build_settlement"));
    action.action_data = node;
    action.boost_cards = boost_cards;
    turn_actions.push(action);
}

//  If returning an object to the pile, reset position and class
function return_object_on_drop(event, ui) {
    var object_dragged_id = ui.draggable[0].id;
    var object_dragged = $("#" + object_dragged_id);
    var node_id = -1;

    //  Do we have an associated node already on the canvas?
    if (object_dragged_id.indexOf("_pending_") > -1) {
        var object_diced = object_dragged_id.split('_');
        node_id = parseInt(object_diced[object_diced.length-1]);
    }

    return_object(object_dragged, object_dragged_id, node_id, true);
}

function return_object(object_to_return, object_to_return_id, last_node_id, clear_node) {
    //  First check to see if this is coming from something already on the canvas
    if (last_node_id > -1) {
        //  Get the type of structure
        var object_type = (object_to_return_id.indexOf("settlement") > -1 ? "settlement" : (object_to_return_id.indexOf("road") > -1 ? "road" : "city"));

        //  Nodes vs Roads reference
        var nodes = current_game.nodes;
        if (object_type == "road") {
            nodes = current_game.roads;
        }

        //  Need node id to remove or modify turn_action currently splitting div name
        var split_div_name = object_to_return_id.split('_');
        var node_id = parseInt(split_div_name[split_div_name.length - 1]);

        //  Find corresponding Action in actions array to modify or remove
        remove_action_from_list(object_type, node_id);

        //  Determine the node it was dropped on
        var last_node = nodes[last_node_id];

        //  Return the resources
        return_resources(object_to_return_id);
        
        //  Clear the node it was dropped on (if it matches the current owner)
        if (clear_node) {
            if (last_node.building) {
                if (last_node.building == "city") {
                    //  We return it to a settlement
                    last_node.building = "settlement";
                } else {
                    last_node.building = "";
                    last_node.owner = -1;
                    last_node.status = "";
                }
            } else {
                last_node.owner = -1;
                last_node.status = "";
            }
        }

        //  Reset class
        object_to_return.attr('class', object_type + ' ' + current_player.colour + ' ' + (object_type == "road" ? "angle30 " : "") + 'ui-draggable ui-draggable-handle');
        object_to_return.attr('style', '');

        //  Append to appropriate pile and clear positioning
        object_to_return.appendTo($("." + object_type + "box"));

        //  Reset ID
        var original_class = object_type + '_' + current_player.colour + '_open_';
        object_to_return.attr('id', original_class + find_next_object_id(original_class));

        //  Update counts
        update_object_counts();
        updatePanelDisplay();
    } else {
        object_to_return.attr('style', '');
    }

}

//  A recursive method to see if any "pending" nodes/roads on the canvas
//  no longer have a valid path when this node/road is removed
function return_dependents(object_type, node) {
    //  Are we using nodes or roads?
    var nodes = current_game.nodes;
    if (object_type == "road") { nodes = current_game.roads; }
    
    //  Temporarily remove this node from the game_state nodes/roads
    var tempNode = new BuildNode();
    stash_node(object_type, tempNode, node);

    //  Now check all pending items in turn_actions to see if they can reach a locked node/road
    for (var i = 1; i < turn_actions.length; i++) {
        var next_object_type = (turn_actions[i].action_type == "build_road" ? "road" : "settlement");
        var next_object_node = turn_actions[i].action_data;
        if (node.id != next_object_node.id || next_object_type != object_type) {
            if (!has_valid_path(next_object_type, next_object_node, "")) {
                //  No path found, so we need to return it to the pile and remove it from the canvas
                var object_to_return = $("#" + next_object_type + "_" + current_player.colour + "_pending_" + next_object_node.id);
                return_object(object_to_return, object_to_return.attr("id"), next_object_node.id, true);
            }
        }
    }

    //  Restore the original node
    restore_node(object_type, tempNode, node);
}

//  A recursive method to find a locked node or road for this player
function has_valid_path(object_type, node, checked) {
    var has_path = false;

    //  Make sure we have not already checked this node/road
    if (checked.indexOf(object_type + ":" + node.id) > -1) {
        return has_path;
    }
    checked += object_type + ":" + node.id + ",";

    //  No reason to be here if there is no owner
    if (node.owner == -1) {
        return false;
    }

    //  If this spot holds a locked node/road
    if (node.owner == current_player.id && node.status != "pending") {
        return true;
    }

    //  Otherwise we keep going
    if (object_type == "road") {
        //  Road: Check neighbor nodes
        for (var i = 0; i < node.connects.length; i++) {
            has_path = has_path || has_valid_path("settlement", current_game.nodes[node.connects[i]], checked);
            if (has_path) { break; }
        }
    } else {
        //  Settlement or City: If someone else owns it, we cannot continue on this path
        if (node.owner != current_player.id && node.owner > -1) {
            return false;
        }

        //  Otherwise check attached roads
        for (var i = 0; i < node.n_roads.length; i++) {
            has_path = has_path || has_valid_path("road", current_game.roads[node.n_roads[i]], checked);
            if (has_path) { break; }
        }
    }
    return has_path;
}

function update_object_counts() {
    //  Count the number of remaining settlements
    var count = 0;
    $(".settlementbox > div").each(function () {
        count ++;
    });
    $(".settlementcount").html(count);

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

function remove_action_from_list(object_type, node_id){
    for ( var i = 0; i < turn_actions.length; i++ ) {
        var action_object_type = (turn_actions[i].action_type.replace("build_", ""));
        if ( ( turn_actions[i].action_data.id === node_id ) && ( object_type === action_object_type ) ) {
            //  remove the action from the list
            turn_actions.splice(i,1);
            break;
        }
    }
}

function stash_node(object_type, new_node, old_node) {
    //  First get correct array (nodes or roads)
    var nodes_to_use = current_game.nodes;
    if (object_type == "road") {
        nodes_to_use = current_game.roads;
    }

    new_node.id = old_node.id;
    new_node.owner = old_node.owner;
    new_node.status = old_node.status;
    if (object_type == "settlement") { new_node.building = old_node.building;  }

    nodes_to_use[old_node.id].owner = -1;
    nodes_to_use[old_node.id].status = "";
    if (object_type == "settlement") { nodes_to_use[old_node.id].building = "";  }
}
function restore_node(object_type, new_node, old_node) {
    //  First get correct array (nodes or roads)
    var nodes_to_use = current_game.nodes;
    if (object_type == "road") {
        nodes_to_use = current_game.roads;
    }

    nodes_to_use[new_node.id].owner = new_node.owner;
    nodes_to_use[new_node.id].status = new_node.status;
    if (object_type == "settlement") { nodes_to_use[new_node.id].building = new_node.building;  }
}
