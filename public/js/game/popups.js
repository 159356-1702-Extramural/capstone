//  Generic method to build a popup from a template
//   popupClass: name of the html file without the extention
//   customData: array of paired values to replace corresponding tags in the html template (i.e. {player_name})
function buildPopup(popupClass, useLarge, customData) {
    $.get("templates/" + popupClass + ".html", function(data) {

        //  In a few cases, we need a larger popup
        $(".popup_inner").removeClass("popup_inner_large");
        if (useLarge) {
            $(".popup_inner").addClass("popup_inner_large");
        }

        //  Now load and update the template
        var html = data;
        if (customData) {
            customData.forEach(function(data) {
                html = html.replace(new RegExp("{" + data[0] + "}", 'g'), data[1]);
            });
        }
        $(".popup_inner").html(html);
        $(".popup").show();

    });
}
function hidePopup() {
    $('.popup').fadeOut(400, function() {

    });
}

/***************************************************
 *  start_up.html
 **************************************************/
function build_popup_start(section) {
    buildPopup(section, false);
}

/***************************************************
 *  start_intro.html
 **************************************************/

/***************************************************
 *  start_menu.html
 **************************************************/
function build_popup_start_menu() {
    buildPopup("start_menu", false);
}

/***************************************************
 *  start_settings.html
 **************************************************/

/***************************************************
 *  start_players.html
 **************************************************/


/***************************************************
 *  waiting_for_players.html
 **************************************************/
function build_popup_waiting_for_players(data) {
    buildPopup("waiting_for_players", false, data);
}

/***************************************************
 *  setup_phase_your_turn.html
 **************************************************/
function build_popup_setup_phase_your_turn(setup_round) {
    if(setup_round === 1){
        //TODO: Place First Settlement
        buildPopup("setup_phase_your_turn", false);
    }else{
        //TODO: Place Second Settlement
        buildPopup("setup_phase_your_turn", false);
    }
}

/***************************************************
 *  waiting_for_turn.html
 **************************************************/
function build_popup_waiting_for_turn() {
    buildPopup("waiting_for_turn", false);
}

/***************************************************
 *  setup_complete.html
 **************************************************/
//  build_popup_setup_complete
//      Shows resourcees given from setup phase
//          {setup_cards} - html list of cards
function build_popup_setup_complete() {

    //  First build a list of cards received during the setup round
    var popup_data = [];
    popup_data.push(["brick", current_game.player.cards.resource_cards.brick - current_game.player.round_distribution_cards.resource_cards.brick]);
    popup_data.push(["sheep", current_game.player.cards.resource_cards.sheep - current_game.player.round_distribution_cards.resource_cards.sheep]);
    popup_data.push(["ore", current_game.player.cards.resource_cards.ore - current_game.player.round_distribution_cards.resource_cards.ore]);
    popup_data.push(["lumber", current_game.player.cards.resource_cards.lumber - current_game.player.round_distribution_cards.resource_cards.lumber]);
    popup_data.push(["grain", current_game.player.cards.resource_cards.grain - current_game.player.round_distribution_cards.resource_cards.grain]);

    //  Build the html to show the cards in the popup
    var card_html = "";
    for (var i = 0; i < popup_data.length; i++) {
        for (var j = 0; j < popup_data[i][1]; j++) {
            card_html += '<div class="build_card" style="z-index:' + (500 + i) + ';"><img src="images/card_' + popup_data[i][0] + '_small.png"></div>';
        }
    }

    //  Build the popup
    buildPopup("setup_complete", false, [["setup_cards", card_html]]);

}

/***************************************************
 *  round_roll_results.html
 **************************************************/
//  build_popup_round_roll_results
//      Shows resources, dice roll and result of robber for upcoming round
//          {setup_cards} - html list of cards
//          {dice1} - numeric result of 1st dice
//          {dice2} - numeric result of 2nd dice
function build_popup_round_roll_results() {

    var robber_active = current_game.dice_values[0] + current_game.dice_values[1] === 7;

    var title = robber_active ?
          "Robbed! Resources stolen this round:" :
          "Resources received this round:";

    // User the multipler to convert negative to positive for display
    var multiplier = robber_active ? -1 : 1;

    var popup_data = [];
    popup_data.push(["brick", current_game.player.round_distribution_cards.resource_cards.brick * multiplier]);
    popup_data.push(["sheep", current_game.player.round_distribution_cards.resource_cards.sheep * multiplier]);
    popup_data.push(["ore", current_game.player.round_distribution_cards.resource_cards.ore * multiplier]);
    popup_data.push(["lumber", current_game.player.round_distribution_cards.resource_cards.lumber * multiplier]);
    popup_data.push(["grain", current_game.player.round_distribution_cards.resource_cards.grain * multiplier]);

    //  Build the html to show the cards in the popup
    var card_html = "";
    for (var i = 0; i < popup_data.length; i++) {
        for (var j = 0; j < popup_data[i][1]; j++) {
            card_html += '<div class="build_card" style="z-index:' + (500 + i) + ';"><img src="images/card_' + popup_data[i][0] + '_small.png"></div>';
        }
    }
    if (card_html.length == 0) {
        card_html += 'Nothing for you!';
    }

    //  Robber
    var robber_display = "none";
    if (robber_active) {
      robber_display = "block";
    }

   //  Does this player have a monopoly card?
    var has_monopoly = current_game.player.cards.dev_cards.monopoly > 0 ? "inline-block" : "none";


    //  Build the popup
    buildPopup("round_roll_results", false, [
      ["dice1", current_game.dice_values[0]],
      ["dice2", current_game.dice_values[1]],
      ["setup_cards", card_html],
      ["robber", robber_display],
      ["has_monopoly", has_monopoly],
      ["title", title]
    ]);
}

/***************************************************
 *  round_use_monopoly.html
 **************************************************/
function build_popup_use_monopoly() {
    buildPopup('round_use_monopoly', false);
}
function build_popup_monopoly_win(data) {
    //  Who played the card?
    var monopoly_played_by = -1;
    for (var i = 0; i < current_game.players.length; i++) {
        if (data.player.actions[0].action_data[i] < 0) {
            monopoly_played_by = i;
            break;
        }
    }

    var popup_data = [];
    for (var j = 0; j < 4; j++) {
        if (j >= current_game.players.length) {
            popup_data.push(["player_" + j + "_display", "none"]);
        } else if (j === monopoly_played_by) {
            popup_data.push(["player_" + j + "_display", "none"]);
        } else {
            var stolen_cards = "";

            // length - 2 used to get second to last item which is total stolen
            for (var i = 0; i < data.player.actions[0].action_data[j]; i++) {
                stolen_cards += '<div class="failed_card" style="z-index:' + (500) + ';"><img class="card" src="images/card_' + (data.player.actions[0].action_data[data.player.actions[0].action_data.length - 1]) + '_small.png"></div>';
            }
            if (stolen_cards.length == 0) {
                stolen_cards = "Nothing! " + current_game.players[monopoly_played_by].name + " tried to steal " + data.player.actions[0].action_data[data.player.actions[0].action_data.length - 1] + ", but they didn't have any!";
            }

            popup_data.push(["player_" + j + "_display", "block"]);
            popup_data.push(["player_" + j + "_name", current_game.players[j].name]);
            popup_data.push(["stolen_cards_player_" + j, stolen_cards]);

        }
    }

    //  Build the popup
    buildPopup("round_monopoly_win", false, popup_data);
}

function build_popup_monopoly_lose(data) {

    //  Who played the card?
    var monopoly_played_by = "";
    for (var i = 0; i < current_game.players.length; i++) {
        if (data.player.actions[0].action_data[i] < 0) {
            monopoly_played_by = current_game.players[i].name;
            break;
        }
    }

    //  Get the list of cards
    var stolen_cards = "";
    for (var i = 0; i < data.player.actions[0].action_data[current_game.player.id]; i++) {
        stolen_cards += '<div class="failed_card" style="z-index:' + (500) + ';"><img class="card" src="images/card_' + data.player.actions[0].action_data[data.player.actions[0].action_data.length - 1] + '_small.png"></div>';
    }
    if (stolen_cards.length == 0) {
        stolen_cards = "Nothing! " + monopoly_played_by + " tried to steal " + data.player.actions[0].action_data[data.player.actions[0].action_data.length - 1] + ", but you didn't have any!";
    }

    //  Build the popup
    buildPopup("round_monopoly_lose", false, [
        ["player_id", current_player.id],
        ["monopoly_player_name", monopoly_played_by],
        ["stolen_cards", stolen_cards]
      ]);
}
/***************************************************
 *  round_build.html
 **************************************************/
//  build_popup_round_build
//      Creates the initial popup for building an item, and allows the selection of
//      extra resources to win conflicts
//          {object_type} - Object being built (road/settlement/city)
//          {build_cards} - html list of cards
function build_popup_round_build(object_type) {
    //  Get the list of cards needed
    var cards = new Cards();
    var card_list = cards.get_required_cards(object_type);
    var card_html = "";

    //  Create the HTML and remove the initial cards
    for (var i = 0; i < card_list.length; i++) {
        card_html += '<div class="build_card" style="z-index:' + (500 + i) + ';"><img class="trade_' + card_list[i] + '" src="images/card_' + card_list[i] + '_small.png"></div>';
    }

    //  Remove for this player
    remove_base_cards_for_item(object_type);

    //  Add in the selectable resources based on what the player has
    var select_html = getResourceCardsHtml();

    buildPopup("round_build", false, [["object_type", object_type], ["build_cards", card_html], ["select_cards", select_html]]);
}
//  round_build_complete
//      Build button in the round_build.html template
function round_build_complete(object_type) {
    //  Get html holding the cards
    var extra_cards = $(".extra_card_list").html();
    var card_list = [];

    //  Create a reference to the players cards
    var my_cards = new Cards();
    my_cards.resource_cards = current_game.player.cards.resource_cards;

    //  Remove cards from player
    var resource_list = ['ore', 'brick', 'lumber', 'grain', 'sheep'];
    for (var i = 0; i < resource_list.length; i++) {
        //  Count each instance in the html
        var resource_matches = extra_cards.match(new RegExp(resource_list[i], 'g'));
        var resource_count = (resource_matches ? resource_matches.length : 0);
        if (resource_count > 0) {
            //  Remove that many from the player
            var result = my_cards.remove_multiple_cards(resource_list[i], resource_count);

            //  Keep track of the cards
            for (var j = 0; j < resource_count; j++) {
                card_list.push(resource_list[i]);
            }
        }
    }

    //  Update the turn_action data
    turn_actions[turn_actions.length-1].boost_cards = card_list;

    //  Update our counts
    update_object_counts();
    updatePanelDisplay();

    //  All done!
    hidePopup();
}
//  round_build_abort
//      Nevermind button in the round_build.html template
function round_build_abort(object_type) {
    //  We need to return it to the pile and remove it from turn_actions
    var object_type = (turn_actions[turn_actions.length - 1].action_type == "build_road" ? "road" : "settlement");
    var object_node = turn_actions[turn_actions.length - 1].action_data;
    var object_to_return = $("#" + object_type + "_" + current_player.colour + "_pending_" + object_node.id);
    return_object(object_to_return, object_to_return.attr("id"), object_node.id);

    //  Create a reference to the players cards
    var my_cards = new Cards();
    my_cards.resource_cards = current_game.player.cards.resource_cards;

    //  We need to restore the base cards for the object
    var card_list = my_cards.get_required_cards(object_type);
    for (var i = 0; i < card_list.length; i++) {
        my_cards.add_card(card_list[i])
    }

    updatePanelDisplay();
    hidePopup();
}

/***************************************************
 *  round_use_card.html
 **************************************************/
function build_popup_round_use_card() {
    buildPopup("round_use_card", false);
}

/***************************************************
 *  round_use_year_of_plenty.html
 **************************************************/
function build_popup_round_use_year_of_plenty() {
    buildPopup("round_use_year_of_plenty", false);
}

/***************************************************
 *  build_popup_use_road_building.html
 **************************************************/
function build_popup_use_road_building() {
    buildPopup("round_use_road_building", false);
}

/***************************************************
 *  round_use_year_of_plenty.html
 **************************************************/
function build_popup_victory_point_received(card) {
    var vp_html = '<div class="build_card" style="z-index:' + (500) + ';"><img class="vp_' + card + '" src="images/dev_victory_' + card + '.png"></div>';

    var vp_cards = [['vp_card',vp_html]];

    // add cards they already have to bottom of window
    var other_vp_cards = [];
    if(this.current_game.player.cards.victory_point_cards.library == 1 && card !== 'library'){
        other_vp_cards += '<div class="build_card" style="z-index:' + (500) + ';"><img class="vp_library" src="images/dev_victory_library.png"></div>'
    }
    if(this.current_game.player.cards.victory_point_cards.market == 1 && card !== 'market'){
        other_vp_cards += '<div class="build_card" style="z-index:' + (500) + ';"><img class="vp_market" src="images/dev_victory_market.png"></div>'

    }
    if(this.current_game.player.cards.victory_point_cards.chapel == 1 && card !== 'chapel'){
        other_vp_cards += '<div class="build_card" style="z-index:' + (500) + ';"><img class="vp_chapel" src="images/dev_victory_chapel.png"></div>'
        
    }
    if(this.current_game.player.cards.victory_point_cards.great_hall == 1 && card !== 'great_hall'){
        other_vp_cards += '<div class="build_card" style="z-index:' + (500) + ';"><img class="vp_great_hall" src="images/dev_victory_great_hall.png"></div>'
        
    }
    if(this.current_game.player.cards.victory_point_cards.universtiy_of_catan == 1 && card !== 'university_of_catan'){
        other_vp_cards += '<div class="build_card" style="z-index:' + (500) + ';"><img class="vp_universtiy_of_catan" src="images/dev_victory_universtiy_of_catan.png"></div>'
        
    }
    vp_cards.push(['other_vp_cards',other_vp_cards]);
    buildPopup("victory_point_received", false, vp_cards);
}

/***************************************************
 *  round_domestic_trade.html
 **************************************************/
function build_popup_round_domestic_trade() {
    buildPopup("round_domestic_trade", false);
}

/***************************************************
 *  round_maritime_trade.html
 **************************************************/
function build_popup_round_maritime_trade() {
    buildPopup("round_maritime_trade", false);
}

/***************************************************
 *  round_domestic_trade.html
 **************************************************/
function build_popup_round_domestic_trade() {
    buildPopup("round_domestic_trade", false);
}

/***************************************************
 *  round_waiting_others.html
 **************************************************/
function build_popup_round_waiting_for_others() {
    buildPopup("round_waiting_others", false);
}

/***************************************************
 *  round_post_results.html
 **************************************************/
function build_popup_failed_moves() {
    var objects = []
    var fail_count = 0;

    var cards = new Cards();

    for (var i = 0; i < current_game.player.turn_data.actions.length; i++) {
        if (current_game.player.turn_data.actions[i].action_result > 0) {
            var card_html = "";

            //  Get the object type
            var object_type = current_game.player.turn_data.actions[i].action_type.replace("build_", "");

            //  Build cards to be returned
            var card_list = cards.get_required_cards(object_type);
            for (var c = 0; c < current_game.player.turn_data.actions[i].boost_cards.length; c++) {
                card_list.push(current_game.player.turn_data.actions[i].boost_cards[c]);
            }

            //  Now the html
            for (var c = 0; c < card_list.length; c++) {
                card_html += '<div class="failed_card" style="z-index:' + (500 + c) + ';"><img class="card" src="images/card_' + card_list[c] + '_small.png"></div>';
            }

            var failure = [object_type + "_" + current_game.player.colour + ".png", card_html];
            objects.push(failure);
            fail_count ++;
        }
    }

    //  Put it all together for the popup call
    var popup_details = [];
    popup_details.push(["failed_count", fail_count]);
    for (var i = 0; i < 3; i++) {
        if (i < objects.length) {
            popup_details.push(["object_type_" + i, objects[i][0]]);
            popup_details.push(["cards_" + i, objects[i][1]]);
            popup_details.push(["show_" + i, "block"]);
        } else {
            popup_details.push(["show_" + i, "none"]);
        }
    }

    //  Build it
    buildPopup("round_post_results", false, popup_details);
}

//  This method will return any failed objects to the players piles
function build_popup_failed_done() {
    var turn_actions = current_game.player.turn_data.actions;

    for (var i = 0; i < turn_actions.length; i++) {
        if (turn_actions[i].action_result > 0) {
            //  Return the item to the pile
            var object_type = (turn_actions[i].action_type == "build_road" ? "road" : "settlement");
            var object_node = turn_actions[i].action_data;
            var object_to_return = $("#" + object_type + "_" + current_player.colour + "_locked_" + object_node.id);
            return_object(object_to_return, object_to_return.attr("id"), object_node.id);
        }
    }

    //  Now continue with the round
    build_popup_round_roll_results();
}

 /***************************************************
 *  player_detail.html
 **************************************************/
function build_popup_player_detail() {
    buildPopup("player_detail", false);
}

 /***************************************************
 *  end_results.html
 **************************************************/
function build_popup_end_results(data) {

  var winner_name = data.winners_name;
  var results_html = '';

  data.players.forEach(function(player) {
      results_html += '<div class="player_row">' +
                        '<div class="player_icon"><img src="images/player'+player.id+'.png" /></div>' +
                        '<div class="player_name">' +
                          player.name + '<br>' +
                          '<span class="player_score">'+player.score.total_points+' Victory Points!</span>' +
                        '</div>' +
                        '<div class="player_score_details">' +
                          '<div class="player_score_detail"><img src="images/settlement_'+player.colour+'_small.png" /><br />x 2</div>' +
                          '<div class="player_score_detail"><img src="images/score_victory.png" width="50" /><br /> x '+player.score.victory_points+'</div>' +
                          '<div class="player_score_detail"><img src="images/score_longroad.png" width="50" /><br /> x ' + (player.score.longest_road ? 1 : 0) + '</div>' +
                          '<div class="player_score_detail"><img src="images/score_army.png" width="50" /><br /> x ' + (player.score.largest_army ? 1 : 0) + '</div>' +
                        '</div>' +
                      '</div>';
  }, this);

  buildPopup("end_results", false, [['results_html', results_html], ['winner_name', winner_name]]);
}