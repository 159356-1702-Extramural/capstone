//  Generic method to build a popup from a template
//   popupClass: name of the html file without the extention
//   customData: array of paired values to replace corresponding tags in the html template (i.e. {player_name})
function buildPopup(popupClass, useLarge, useRight, customData) {
    $.get("templates/" + popupClass + ".html", function(data) {
      //  In a few cases, we need a larger popup
      $(".popup_inner")
        .removeClass("popup_inner_large");
      $(".popup_inner")
        .removeClass("popup_inner_right");
      if (useLarge) {
        $(".popup_inner")
          .addClass("popup_inner_large");
      }
      if (useRight) {
        $(".popup_inner")
          .addClass("popup_inner_right");
      }

      //  Now load and update the template
      var html = data;
      if (customData) {
        customData.forEach(function(data) {
          html = html.replace(new RegExp("{" + data[0] + "}", 'g'), data[1]);
        });
      }
      $(".popup_inner")
        .html(html);
      $(".popup")
        .show();

    });
  }

  function hidePopup() {
    action_in_progress = false;
    allowed_actions.can_build = true;
    allowed_actions.can_finish = (current_game.round_num > 2 || turn_actions.length === 2);
    updatePanelDisplay();
    $(".game_chat").removeClass('game_chat_top_z');
    $('.popup').hide();
  }

  /***************************************************
   *  start_up.html
   **************************************************/
  function build_popup_start(section, isLarge) {
    buildPopup(section, isLarge, false);
  }

  /***************************************************
   *  start_intro.html
   **************************************************/

  /***************************************************
   *  start_menu.html
   **************************************************/
  function build_popup_start_menu() {
    buildPopup("start_menu", false, false);
  }

  /***************************************************
   *  start_settings.html
   **************************************************/

  /***************************************************
   *  start_players.html
   **************************************************/
  function build_popup_lobby(game_list) {
    //  Format list of games
    var show_join = (game_list.length > 0 ? "block" : "none");
    var game_list_html = "";

    for (var g = 0; g < game_list.length; g++) {
      var name_list = game_list[g].player_names.join(", ");
      game_list_html += "<div id='game_id_"+g+"' class='game_list_row' onclick='join_game(" + game_list[g].game_id + ");'>";
      game_list_html += "    <div class='game_list_row_title'>" + game_list[g].game_name + "</div>";
      game_list_html += "    <div class='game_list_row_spots'>" + game_list[g].player_names.length + " of " +
        game_list[g].max_players + "</div>";
      game_list_html += "    <div class='game_list_row_players'><b>In game:</b> " + name_list + "</div>";
      game_list_html += "</div>";
    }
    buildPopup("start_lobby", false, false, [
      ["join_game_display", show_join],
      ["player", current_player.name],
      ["list_of_games", game_list_html]
    ]);
  }

  /***************************************************
   *  waiting_for_players.html
   **************************************************/
  function build_popup_waiting_for_players(data) {
    buildPopup("waiting_for_players", false, false, data);
  }

  /***************************************************
   *  setup_phase_your_turn.html
   **************************************************/
  function build_popup_setup_phase_your_turn(setup_round) {
    buildPopup("setup_phase_your_turn", false, false);
  }

  /***************************************************
   *  waiting_for_turn.html
   **************************************************/
  function build_popup_waiting_for_turn() {
    buildPopup("waiting_for_turn", false, true);
    $(".game_chat").addClass('game_chat_top_z');
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
    popup_data.push(["brick", current_game.player.cards.resource_cards.brick - current_game.player.round_distribution_cards
      .resource_cards.brick
    ]);
    popup_data.push(["sheep", current_game.player.cards.resource_cards.sheep - current_game.player.round_distribution_cards
      .resource_cards.sheep
    ]);
    popup_data.push(["ore", current_game.player.cards.resource_cards.ore - current_game.player.round_distribution_cards
      .resource_cards.ore
    ]);
    popup_data.push(["lumber", current_game.player.cards.resource_cards.lumber - current_game.player.round_distribution_cards
      .resource_cards.lumber
    ]);
    popup_data.push(["grain", current_game.player.cards.resource_cards.grain - current_game.player.round_distribution_cards
      .resource_cards.grain
    ]);

    //  Build the html to show the cards in the popup
    var card_html = "";
    var card_count = 0;
    for (var i = 0; i < popup_data.length; i++) {
      for (var j = 0; j < popup_data[i][1]; j++) {
        if (card_count < 16) {
          card_html += '<div class="build_card" style="z-index:' + (500 + card_count) +
            ';"><img style="border-radius:6px" src="images/card_' + popup_data[i][0] + '_small.jpg"></div>';
        }
        card_count++;
      }
    }
    if (card_count > 15) {
      card_html += "<br /><div class='player-row' style='width:99%; clear:both;'>+ " + (card_count - 16) +
        " more cards</div>";
    }

    if (card_html.length == 0) {
      card_html += 'Nothing for you!';
    }

    //  Build the popup
    buildPopup("setup_complete", false, false, [
      ["setup_cards", card_html]
    ]);

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

    var title = robber_active ? "Robbed! Resources stolen this round:" : "Resources received this round:";
    $(".dice_row .robber_roll")
      .hide();
    if (robber_active) {
      $(".dice_row .robber_roll")
        .show();
    }

    //  Show the dice in the score area
    $("#score_dice_1")
      .attr("class", "dice dice" + current_game.dice_values[0]);
    $("#score_dice_2")
      .attr("class", "dice dice" + current_game.dice_values[1]);
    $(".score .dice_row")
      .show();

    // User the multipler to convert negative to positive for display
    var multiplier = robber_active ? -1 : 1;

    // Create message if a player has used the knight
    var knight = '';
    if (typeof current_game.knight_player_id !== 'undefined' && current_game.knight_player_id !== -1) {
      if (current_game.knight_player_id == current_game.player.id) {
        knight = "You have played the Knight. Robber has moved!";
      } else {
        knight = current_game.players[current_game.knight_player_id].name +
          " has played the knight! Robber has moved.";
      }
    }

    var popup_data = [];
    popup_data.push(["brick", current_game.player.round_distribution_cards.resource_cards.brick * multiplier]);
    popup_data.push(["sheep", current_game.player.round_distribution_cards.resource_cards.sheep * multiplier]);
    popup_data.push(["ore", current_game.player.round_distribution_cards.resource_cards.ore * multiplier]);
    popup_data.push(["lumber", current_game.player.round_distribution_cards.resource_cards.lumber * multiplier]);
    popup_data.push(["grain", current_game.player.round_distribution_cards.resource_cards.grain * multiplier]);

    //  Build the html to show the cards in the popup
    var card_html = "";
    var card_count = 0;
    for (var i = 0; i < popup_data.length; i++) {
      for (var j = 0; j < popup_data[i][1]; j++) {
        if (card_count < 16) {
          card_html += '<div class="build_card" style="z-index:' + (500 + card_count) +
            ';"><img style="border-radius:6px" src="images/card_' + popup_data[i][0] + '_small.jpg"></div>';
        }
        card_count++;
      }
    }
    if (card_count > 15) {
      card_html += "<br /><div class='player-row' style='width:99%; clear:both;'>+ " + (card_count - 16) +
        " more cards</div>";
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
    buildPopup("round_roll_results", false, false, [
      ["dice1", current_game.dice_values[0]],
      ["dice2", current_game.dice_values[1]],
      ["setup_cards", card_html],
      ["robber", robber_display],
      ["has_monopoly", has_monopoly],
      ["title", title],
      ["knight", knight]
    ]);
  }

  /***************************************************
   *  round_use_monopoly.html
   **************************************************/
  function build_popup_use_monopoly() {
    buildPopup('round_use_monopoly', false, true);
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
          stolen_cards += '<div class="failed_card" style="z-index:' + (500) +
            ';"><img style="border-radius:6px" class="card" src="images/card_' + (data.player.actions[0].action_data[data.player.actions[
              0].action_data.length - 1]) + '_small.jpg"></div>';
        }
        if (stolen_cards.length == 0) {
          stolen_cards = "Nothing! " + current_game.players[monopoly_played_by].name + " tried to steal " +
            data.player.actions[0].action_data[data.player.actions[0].action_data.length - 1] +
            ", but they didn't have any!";
        }

        popup_data.push(["player_" + j + "_display", "block"]);
        popup_data.push(["player_" + j + "_name", current_game.players[j].name]);
        popup_data.push(["stolen_cards_player_" + j, stolen_cards]);

      }
    }

    //  Build the popup
    buildPopup("round_monopoly_win", false, false, popup_data);
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
      stolen_cards += '<div class="failed_card" style="z-index:' + (500) +
        ';"><img style="border-radius:6px" class="card" src="images/card_' + data.player.actions[0].action_data[data.player.actions[0].action_data
          .length - 1] + '_small.jpg"></div>';
    }
    if (stolen_cards.length == 0) {
      stolen_cards = "Nothing! " + monopoly_played_by + " tried to steal " + data.player.actions[0].action_data[
        data.player.actions[0].action_data.length - 1] + ", but you didn't have any!";
    }

    //  Build the popup
    buildPopup("round_monopoly_lose", false, false, [
      ["player_id", current_player.id],
      ["monopoly_player_name", monopoly_played_by],
      ["stolen_cards", stolen_cards]
    ]);
  }

  /***************************************************
   *  round_build_no_resources.html
   **************************************************/
  //  build_popup_no_resources
  //      Shows information on what it takes to build an object when you do not have enough
  function build_popup_no_resources() {
    if (!action_in_progress) {
      buildPopup("round_build_no_resources", false, false, [
        ["setup_round_display", (current_game.round_num < 3 ? "block" : "none")],
        ["normal_round_display", (current_game.round_num < 3 ? "none" : "block")]
      ]);
    }
  }

  /***************************************************
   *  round_build.html
   **************************************************/
  //  build_popup_round_build
  //      Creates the initial popup for building an item, and allows the selection of
  //      extra resources to win conflicts
  //          {object_type} - Object being built (road/settlement/city)
  //          {build_cards} - html list of cards
  function build_popup_round_build(object_dragged_id, object_type) {
    //  Get the list of cards needed
    var cards = new Cards();
    var card_list = cards.get_required_cards(object_type);
    var card_html = "";

    //  Remove the base cards temporarily
    var my_cards = new Cards();
    my_cards.resource_cards = current_game.player.cards.resource_cards;
    my_cards.remove_boost_cards(card_list);

    //  Create the HTML and remove the initial cards
    for (var i = 0; i < card_list.length; i++) {
      card_html += '<div class="build_card" style="z-index:' + (500 + i) + ';"><img style="border-radius:6px" class="trade_' + card_list[
        i] + '" src="images/card_' + card_list[i] + '_small.jpg"></div>';
    }

    //  Add in the selectable resources based on what the player has
    var select_html = getResourceCardsHtml();

    //  Add the base cards back in
    my_cards.add_cards_from_list(card_list);

    buildPopup("round_build", false, false, [
      ["object_dragged_id", object_dragged_id],
      ["object_type", object_type],
      ["build_cards", card_html],
      ["select_cards", select_html]
    ]);
    action_in_progress = true;
  }
  //  round_build_complete
  //      Build button in the round_build.html template
  function round_build_complete(object_dragged_id, object_type) {
    //  Get html holding the cards
    var extra_cards = $(".extra_card_list").html();

    //  Create a reference to the players cards
    var my_cards = new Cards();
    var card_list = my_cards.get_required_cards(object_type);
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

    //  Now take the resources away
    take_resources(object_dragged_id, card_list);

    //  Update the turn_action data
    turn_actions[turn_actions.length - 1].boost_cards = card_list;

    //  Update our counts
    allowed_actions.can_finish = true;
    allowed_actions.can_build = true;
    update_object_counts();
    updatePanelDisplay();

    //  All done!
    hidePopup();
  }
  //  round_build_abort
  //      Nevermind button in the round_build.html template
  function round_build_abort(object_type) {
    //  We need to return it to the pile and remove it from turn_actions
    var object_type = (turn_actions[turn_actions.length - 1].action_type.replace("build_", ""));
    var object_node = turn_actions[turn_actions.length - 1].action_data;
    var object_to_return = $("#" + object_type + "_" + current_player.colour + "_pending_" + object_node.id);
    return_object(object_to_return, object_to_return.attr("id"), object_node.id);

    //  We need to reset the node on the board it was dropped on
    if (object_type == "city") {
      object_node.building = "settlement";

      //  Restore the settlement
      $("#node_" + object_node.id)
        .show();

    } else {
      object_node.owner = -1;
    }
    object_node.status = "";

    //  We need to restore the cards used to build this object
    return_resources(object_to_return.attr("id"));

    allowed_actions.can_finish = true;
    allowed_actions.can_build = true;
    updatePanelDisplay();
    hidePopup();
  }

  /***************************************************
   *  round_use_card.html
   **************************************************/
  function build_popup_round_use_card() {
    buildPopup("round_use_card", false, false);
  }

  /***************************************************
   *  round_use_year_of_plenty.html
   **************************************************/
  function build_popup_round_use_year_of_plenty() {
    buildPopup("round_use_year_of_plenty", false, false);
  }

  /***************************************************
   *  build_popup_use_road_building.html
   **************************************************/
  function build_popup_use_road_building() {
    buildPopup("round_use_road_building", false, false);
  }

  /***************************************************
   *  round_use_year_of_plenty.html
   **************************************************/
  function build_popup_victory_point_received(card) {
    var vp_html = '<div class="build_card  main_card" style="z-index:' + (500) + ';"><img style="border-radius:28px;" class="vp_' + card +
      ' set_large_image_width" src="images/dev_victory_' + card + '_large.jpg"></div>';

    var vp_cards = [
      ['vp_card', vp_html]
    ];

    // add cards they already have to bottom of window
    var other_vp_cards = [];
    if (this.current_game.player.cards.victory_point_cards.library == 1 && card !== 'library') {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_library" src="images/dev_victory_library.jpg"></div>'
    }
    if (this.current_game.player.cards.victory_point_cards.market == 1 && card !== 'market') {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_market" src="images/dev_victory_market.jpg"></div>'

    }
    if (this.current_game.player.cards.victory_point_cards.chapel == 1 && card !== 'chapel') {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_chapel" src="images/dev_victory_chapel.jpg"></div>'

    }
    if (this.current_game.player.cards.victory_point_cards.great_hall == 1 && card !== 'great_hall') {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_great_hall" src="images/dev_victory_great_hall.jpg"></div>'

    }
    if (this.current_game.player.cards.victory_point_cards.university_of_catan == 1 && card !==
      'university_of_catan') {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_university_of_catan" src="images/dev_victory_university_of_catan.jpg"></div>'

    }
    vp_cards.push(['other_vp_cards', other_vp_cards]);
    buildPopup("victory_point_received", false, false, vp_cards);
  }

  /***************************************************
   *  round_domestic_trade.html
   **************************************************/
  function build_popup_round_domestic_trade() {
    //  Add in the selectable resources based on what the player has
    var select_html = getTradeCardsHtml(current_game.player.cards.resource_cards, false);
    
    buildPopup("round_domestic_trade", false, false, [["select_cards", select_html]]);
  }

  function build_popup_round_accept_trade(player_id) {
    //  Show the trade this player is offering
    var give_html = $(".give_cards" + player_id).html();
    var want_html = $(".want_cards" + player_id).html();

    buildPopup("round_trade_accept", false, false, [["player_id", player_id],["player_name", current_game.players[player_id].name], ["give_cards", give_html], ["want_cards", want_html]]);
  }

  function build_popup_trade_failed() {
    buildPopup("round_trade_failed", false, false);
  }
  
  /***************************************************
   *  round_maritime_trade.html
   **************************************************/
  function build_popup_round_maritime_trade() {
    buildPopup("round_maritime_trade", false, false);
  }

  /***************************************************
   *  round_largest_army.html
   **************************************************/
  function build_popup_largest_army(won) {
    buildPopup("round_largest_army", false, false, [
      ["result", won]
    ]);
  }

  /***************************************************
   *  round_waiting_others.html
   **************************************************/
  function build_popup_round_waiting_for_others() {
    buildPopup("round_waiting_others", false, true);
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
        var card_list = [];
        for (var c = 0; c < current_game.player.turn_data.actions[i].boost_cards.length; c++) {
          card_list.push(current_game.player.turn_data.actions[i].boost_cards[c]);
        }

        //  Now the html
        for (var c = 0; c < card_list.length; c++) {
          card_html += '<div class="failed_card" style="z-index:' + (500 + c) +
            ';"><img style="border-radius:6px" class="card" src="images/card_' +
            card_list[c] + '_small.jpg"></div>';
        }

        var failure = [object_type + "_" + current_game.player.colour + ".png", card_html];
        objects.push(failure);
        fail_count++;
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
    buildPopup("round_post_results", false, false, popup_details);
  }

  //  This method will return any failed objects to the players piles
  function build_popup_failed_done() {
    var turn_actions = current_game.player.turn_data.actions;

    for (var i = 0; i < turn_actions.length; i++) {
      if (turn_actions[i].action_result > 0) {
        //  Return the item to the pile
        var object_type = turn_actions[i].action_type.replace("build_", "");
        var object_node = turn_actions[i].action_data;
        var object_to_return = $("#" + object_type + "_" + current_player.colour + "_locked_" + object_node.id);
        if (object_to_return.length == 0) {
          object_to_return = $("#" + object_type + "_" + current_player.colour + "_pending_" + object_node.id);
        }
        return_object(object_to_return, object_to_return.attr("id"), object_node.id);
      }
    }

    //  Now continue with the round
    build_popup_round_roll_results();
  }

  /***************************************************
   *  player_detail.html
   **************************************************/
  function build_popup_player_detail(id) {
    var popup_data = [];

    popup_data.push(["player_id", id]);
    popup_data.push(["player_name", current_game.players[id].name]);
    popup_data.push(["player_score", current_game.players[id].points]);

    var settlements = 0;
    var cities = 0;
    this.current_game.nodes.forEach(function(node) {
      if (node.owner > -1 && node.owner == id) {
        settlements += (node.building === 'settlement') ? 1 : 0;
        cities += (node.building === 'settlement') ? 0 : 2;
      }
    }, this);

    //  Build settlements in use
    var settlement_html = "";
    for (var i = 0; i < 5; i++) {
      settlement_html += '<div class="player_score_detail' + (settlements <= i ? " disabled" : "") +
        '"><img src="images/settlement_' + current_game.players[id].colour + '_small.png" /></div>';
    }
    popup_data.push(["settlements", settlement_html]);

    //  Build cities in use
    var city_html = "";
    for (var i = 0; i < 5; i++) {
      city_html += '<div class="player_score_detail' + (cities <= i ? " disabled" : "") +
        '"><img src="images/city_' + current_game.players[id].colour + '_small.png" /></div>';
    }
    popup_data.push(["cities", city_html]);
    
    var left_margin = 0;
    var cards_html = "";
    // Hidden Resource Cards
    cards_html += '<div class="player_detail_cards">';
    for( var i = 0; i < current_game.players[id].cards_count; i++){
      left_margin = ((i===0) ? 0 : -40);
      cards_html += '<img class="player_detail_card_backs" style="margin-left: ' + left_margin + 'px" src="images/card_back.jpg" width="50" />';
    }
    cards_html += '</div>';
    
    // Hidden Dev Cards and Victory Point Cards
    cards_html += '<div class="player_detail_cards">';
    for( var k = 0; k < (current_game.players[id].dev_cards_count + current_game.players[id].victory_points); k++){
      left_margin = ((k===0) ? 0 : -40);
      cards_html += '<img  class="player_detail_card_backs" style="margin-left: ' + left_margin + 'px" src="images/card_back_dev.jpg" width="50" />';
    }
    cards_html += '</div>';

    // Knights played (face up)
    cards_html += '<div class="player_detail_cards">';
    for( var j = 0; j < current_game.players[id].knight_played; j++){
      left_margin = ((j===0) ? 0 : -40);
      cards_html += '<img class="player_detail_card_backs" style="margin-left: ' + left_margin + 'px" src="images/dev_knight_small.jpg" onclick="build_popup_show_dev_card(\'knight\');" width="50" />';
    }
    cards_html += '</div>';

    // largest army (face up)
    if (current_game.players[id].vp_cards[0]){
      cards_html += '<div class="player_detail_vp_cards"><img src="images/largest_army.jpg" width="60" /></div>';
    }
    // longest road (face up)
    if (current_game.players[id].vp_cards[1]){
      cards_html += '<div class="player_detail_vp_cards"><img src="images/longest_road.jpg" width="60" /></div>';
    }
    popup_data.push(["cards", cards_html]);
  
    buildPopup("player_detail", false, false, popup_data);
  }

  /***************************************************
   *  end_results.html
   **************************************************/
  function build_popup_end_results(data) {
    var winner_id = data.winners_id;
    var end_game_stuff = [];

    //  Determine order of winners
    var winners = [];
    winners.push(data.players[data.winners_id]);
    data.players.forEach(function(player) {
      if (player.id != data.winners_id) {
        winners.push(player);
      }
    });
      
    //  Collect all the details we need
    for (var i = 0; i < winners.length; i++) {
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_id', winners[i].id]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_name', winners[i].name]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_colour', winners[i].colour]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_points', winners[i].score.total_points]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_building_points', winners[i].score.settlements + (winners[i].score.cities * 2)]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_settlement_count', winners[i].score.settlements]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_city_count', winners[i].score.cities]);
      
      var has_victory = 1;
      var last_victory = 5;
      var cards = ["chapel", "market", "library", "university_of_catan", "great_hall"];
      for (var j = 0; j < cards.length; j++) {
        if (winners[i].cards.victory_point_cards[cards[j]]) {
          end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_has_victory_card_' + has_victory, "block"]);
          end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_victory_card_' + has_victory, cards[j]]);
          has_victory ++;
        } else {
          end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_has_victory_card_' + last_victory, "none"]);
          end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_victory_card_' + last_victory, cards[j]]);
          last_victory --;
        }
      }
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_victory_points', (has_victory - 1)]);

      var has_bonus = 1;
      var bonus_points = (winners[i].score.longest_road ? 2 : 0) + (winners[i].score.largest_army ? 2 : 0);
      if (winners[i].score.longest_road) {
        end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_has_bonus_card_' + has_bonus, 'block']);
        end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_bonus_card_' + has_bonus, 'longest_road']);
        has_bonus = 2;
      } else {
        end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_has_bonus_card_2', 'none']);
        end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_bonus_card_2', 'longest_road']);
      }
      
      if (winners[i].score.largest_army) {
        end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_has_bonus_card_' + has_bonus, 'block']);
      } else {
        end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_has_bonus_card_' + has_bonus, 'none']);
      }
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_bonus_card_' + has_bonus, 'largest_army']);
      
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_bonus_points', bonus_points]);
      end_game_stuff.push(['winner' + (i == 0 ? '' : i + 1) + '_non_building_points', bonus_points + has_victory - 1]);
    }

    //  Hide players when not needed
    for (var i = winners.length; i < 4; i++) {
      end_game_stuff.push(['winner' + (i + 1) + '_id', i]);
      end_game_stuff.push(['winner' + (i + 1) + '_colour', "red"]);

      var cards = ["chapel", "market", "library", "university_of_catan", "great_hall"];
      for (var j = 0; j < cards.length; j++) {
        end_game_stuff.push(['winner' + (i + 1) + '_has_victory_card_' + (j + 1), "none"]);
        end_game_stuff.push(['winner' + (i + 1) + '_victory_card_' + (j + 1), cards[j]]);
      }
      end_game_stuff.push(['winner' + (i + 1) + '_has_bonus_card_1', 'none']);
      end_game_stuff.push(['winner' + (i + 1) + '_bonus_card_1', 'longest_road']);
      end_game_stuff.push(['winner' + (i + 1) + '_has_bonus_card_2', 'none']);
      end_game_stuff.push(['winner' + (i + 1) + '_bonus_card_2', 'largest_army']);
}

    end_game_stuff.push(['show_two_players', (winners.length == 2 ? "block" : "none")]);
    end_game_stuff.push(['show_three_players', (winners.length == 3 ? "block" : "none")]);
    end_game_stuff.push(['show_four_players', (winners.length == 4 ? "block" : "none")]);

    buildPopup("end_results", true, false, end_game_stuff);
  }

  /***************************************************
   *  round_show_dev_card.html
   **************************************************/
  function build_popup_show_dev_card(card) {

    var dev_card = '<div class="build_card  main_card" style="z-index:' + (500) + ';"><img style="border-radius:28px;" class="dev_' + card +
      ' set_large_image_width" src="images/dev_' + card + '_large.jpg"></div>';

    var dev_cards_rules = "";
    var other_dev_cards = "";
    if (card === "knight") {
      dev_cards_rules = "Rules coming soon";
    } else if (card === "year_of_plenty") {
      dev_cards_rules =
        "Year of Plenty is played by clicking the 'Year of Plenty' card at any time during your turn.  You can choose any two resource cards to add to your hand.";
    } else if (card === "monopoly") {
      dev_cards_rules =
        "Monopoly takes all of a resource you nominate from all of the other players.  Use it wisely.  The monopoly button will show at the start of each turn until you use it.  To use it, click the button and choose a resource."
    } else if (card === "road_building") {
      dev_cards_rules =
        "Click this card to play it.  You are given the resources to build two additional roads in the turn.  They will automatically win any road conflicts with other players so you don't need to boost the success with cards.";
    }
  
    //use this to show all cards
    other_dev_cards += '<div class="inline_cards" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_year_of_plenty" src="images/dev_year_of_plenty.jpg"></div>';
    other_dev_cards += '<div class="inline_cards" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_knight" src="images/dev_knight.jpg"></div>';
    other_dev_cards += '<div class="inline_cards" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_monopoly" src="images/dev_monopoly.jpg"></div>';
    other_dev_cards += '<div class="inline_cards" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_road_building" src="images/dev_road_building.jpg"></div>';

    var dev_cards = [
      ['dev_card', dev_card]
    ];
    dev_cards.push(['dev_card_rules', dev_cards_rules]);
    dev_cards.push(['other_dev_cards', other_dev_cards]);
    buildPopup("round_show_dev_card", false, false, dev_cards);
  }

  /**
   * Displays the knight popup
   */
  function build_popup_play_knight() {
    buildPopup("knight_options", false, false);
  }

  /***************************************************
   *  round_restrict_dev_card_use.html
   **************************************************/
  function build_popup_restrict_dev_card_use(card_use, current_cards) {

    var dev_cards = [];
    var heading = "";
    var content = "";
    var other_dev_cards = "";

    if (card_use === 'purchase') {
      heading = "Only two development cards can be purchased per turn.";
      content = "You can purchase a maximum of <b>2</b> cards in any turn and you've purchased two this turn.";
    } else if (card_use === 'play') {
      heading = "Card cannot be played.";
      content = "You can play a maximum of <b>1</b> card in any turn and you may not play a card immediately after purchase.";
    }

    // load cards to display
    var count = current_game.player.cards.dev_cards.year_of_plenty;
    for (var i=0; i<count; i++) {
      var last = (i === count-1) ? "last" : "";
      other_dev_cards += '<div class="build_card '+last+'" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_year_of_plenty" src="images/dev_year_of_plenty.jpg"></div>';
    }
    count = current_game.player.cards.dev_cards.knight;
    for (var i=0; i<count; i++) {
      var last = (i === count-1) ? "last" : "";
      other_dev_cards += '<div class="build_card '+last+'" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_knight" src="images/dev_knight.jpg"></div>';
    }
    count = current_game.player.cards.dev_cards.monopoly;
    for (var i=0; i<count; i++) {
      var last = (i === count-1) ? "last" : "";
      other_dev_cards += '<div class="build_card '+last+'" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_monopoly" src="images/dev_monopoly.jpg"></div>';
    }
    count = current_game.player.cards.dev_cards.road_building;
    for (var i=0; i<count; i++) {
      var last = (i === count-1) ? "last" : "";
      other_dev_cards += '<div class="build_card '+last+'" style="z-index:' + (500) +
      ';"><img class="dev_rules dev_road_building" src="images/dev_road_building.jpg"></div>';
    }

    var other_vp_cards = [];
    if (this.current_game.player.cards.victory_point_cards.library == 1) {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_rules vp_library" title="Library" src="images/dev_victory_library.jpg"></div>'
    }
    if (this.current_game.player.cards.victory_point_cards.market == 1) {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_rules vp_market" title = "Market" src="images/dev_victory_market.jpg"></div>'
    }
    if (this.current_game.player.cards.victory_point_cards.chapel == 1) {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_rules vp_chapel" title="Chapel" src="images/dev_victory_chapel.jpg"></div>'
    }
    if (this.current_game.player.cards.victory_point_cards.great_hall == 1) {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_rules vp_great_hall" title="Great Hall" src="images/dev_victory_great_hall.jpg"></div>'
    }
    if (this.current_game.player.cards.victory_point_cards.university_of_catan == 1) {
      other_vp_cards += '<div class="build_card" style="z-index:' + (500) +
        ';"><img class="vp_rules vp_university_of_catan" title="University" src="images/dev_victory_university_of_catan.jpg"></div>'
    }

    dev_cards.push(['dev_card_heading', heading]);
    dev_cards.push(['dev_card_content', content]);
    dev_cards.push(['other_dev_cards', other_dev_cards+other_vp_cards]);
    buildPopup("round_restrict_dev_card_use", false, false, dev_cards);
  }


  function chat_set(area, setting) {
    $(".menu_" + area + "_choice").removeClass("selected");
    $(".menu_" + area + "_choice." + setting).addClass("selected");
    if (area == "font") {
      $(".game_chat .messages").removeClass("small");
      $(".game_chat .messages").removeClass("medium");
      $(".game_chat .messages").removeClass("large");
      $(".game_chat .messages").addClass(setting);
    } else {
      $(".game_chat").removeClass("small");
      $(".game_chat").removeClass("medium");
      $(".game_chat").removeClass("large");
      $(".game_chat").addClass(setting);
    }
  }
  function chat_tips() {
    show_tips = !show_tips;
    $(".menu_tips .fa").removeClass("fa-toggle-" + (show_tips ? "off" : "on"));
    $(".menu_tips .fa").addClass("fa-toggle-" + (show_tips ? "on" : "off"));
    $(".menu_tip_text").html("Tips currently " + (show_tips ? "on" : "off"));
  }
  function chat_reset() {
    chat_set("size", "small");
    chat_set("font", "medium");
    
    show_tips = false;
    chat_tips();
    $(".game_chat").css("top", "").css("left", "");
  }