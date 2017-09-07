/**
 * Create a cards object to hold relevant card relating to specific action
 */
function Cards(){
    this.resource_cards = {
        brick : 0,
        grain : 0,
        sheep : 0,
        lumber: 0,
        ore   : 0
    };

    this.dev_cards = {
        year_of_plenty : 0,
        monopoly : 0,
        knight : 0,
        road_building  : 0,
    };

    this.victory_point_cards = {
        library : 0,
        market : 0,
        chapel : 0,
        university_of_catan  : 0,
        great_hall   : 0
    };

}

//Return number of resource cards in Cards Object
Cards.prototype.count_cards = function(){
    return this.resource_cards.brick + this.resource_cards.grain + this.resource_cards.sheep + this.resource_cards.lumber + this.resource_cards.ore;
};

//Return number of development cards in Cards Object
Cards.prototype.count_dev_cards = function(){
    return this.dev_cards.year_of_plenty + this.dev_cards.monopoly + this.dev_cards.knight + this.dev_cards.road_building;
};

//Return number of victory point cards in Cards Object
Cards.prototype.count_victory_cards = function(){
    return this.victory_point_cards.library + this.victory_point_cards.market + this.victory_point_cards.chapel + this.victory_point_cards.university_of_catan + this.victory_point_cards.great_hall;
}

/**
 * Add a single card to the players hand
 * @param {String} card : a card (resource, victory, development)
 * @return {Boolean}
 */
Cards.prototype.add_card = function(card){
    switch (card){
        case "brick":
            this.resource_cards.brick++;
            break;
        case "grain":
            this.resource_cards.grain++;
            break;
        case "sheep":
            this.resource_cards.sheep++;
            break;
        case "lumber":
            this.resource_cards.lumber++;
            break;
        case "ore":
            this.resource_cards.ore++;
            break;

        case "knight":
            this.dev_cards.knight++;
            break;
        case "year_of_plenty":
            this.dev_cards.year_of_plenty++;
            break;
        case "monopoly":
            this.dev_cards.monopoly++;
            break;
        case "road_building":
            this.dev_cards.road_building++;
            break;

        case "library":
            this.victory_point_cards.library++;
            break;
        case "chapel":
            this.victory_point_cards.chapel++;
            break;
        case "market":
            this.victory_point_cards.market++;
            break;
        case "great_hall":
            this.victory_point_cards.great_hall++;
            break;
        case "university_of_catan":
            this.victory_point_cards.university_of_catan++;
            break;
    }
}

/**
 * Remove a single card from the resources hand
 * @param {String} card : a resource card
 * @return {Boolean}
 */
Cards.prototype.remove_card = function(card){
    return this.remove_multiple_cards(card, 1);
}

/**
 * Remove a group of cards from the resources hand by quantity
 * @param {String}  card : a resource card
 * @param {int}     qty  : number of cards to remove
 * @return {Boolean}
 */
Cards.prototype.remove_multiple_cards = function(card, qty){
    if (qty > 0) {
        if(card == "sheep" && this.resource_cards.sheep >= qty){
            this.resource_cards.sheep -= qty;
            return true;
        }else if(card == "grain" && this.resource_cards.grain >= qty){
            this.resource_cards.grain -= qty;
            return true;
        }else if(card == "brick" && this.resource_cards.brick >= qty){
            this.resource_cards.brick -= qty;
            return true;
        }else if(card == "lumber" && this.resource_cards.lumber >= qty){
            this.resource_cards.lumber -= qty;
            return true;
        }else if(card == "ore" && this.resource_cards.ore >= qty){
            this.resource_cards.ore -= qty;
            return true;
        }else if(card == "monopoly" && this.dev_cards.monopoly >= qty){
            this.dev_cards.monopoly -= qty;
            return true;
        }else if(card == "year_of_plenty" && this.dev_cards.year_of_plenty >= qty){
            this.dev_cards.year_of_plenty -= qty;
            return true;
        }else if(card == "knight" && this.dev_cards.knight >= qty){
            this.dev_cards.knight -= qty;
            return true;
        }else if(card == "road_building" && this.dev_cards.road_building >= qty){
            this.dev_cards.road_building -= qty;
            return true;
        }else{
            return false;
        }
    }
    return false;
}

Cards.prototype.remove_boost_cards = function(boost_cards){
    for (var b = 0; b < boost_cards.length; b++) {
        this.remove_card(boost_cards[b]);
    }
}


/**
 * Remove a group of cards from the resources hand by purchase
 * @param {String} card : a purchase (road, city, development card, settlement)
 * @return {Boolean}
 */
Cards.prototype.remove_cards = function(purchase){
    //returns true if cards loaded successfully
    if ( purchase == 'road' ) {
        this.remove_card('brick');
        this.remove_card('lumber');
        return true;
    }else if ( purchase == 'settlement' ) {
        this.remove_card('brick');
        this.remove_card('lumber');
        this.remove_card('grain');
        this.remove_card('sheep');
        return true;
    }else if ( purchase === 'city' ) {
        this.remove_card('ore');
        this.remove_card('ore');
        this.remove_card('ore');
        this.remove_card('grain');
        this.remove_card('grain');
        return true;
    }else if ( purchase === 'dev_card' ) {
        this.remove_card('ore');
        this.remove_card('grain');
        this.remove_card('sheep');
        return true;
    }else{
        //logger.log('error', 'remove_cards function failed');
        return false;
    }
}


Cards.prototype.has_cards = function(card_list) {
    var missing_card = false;
    var removed_list = [];

    //  Mimic the removal of each card and see if we run out
    for (var i = 0; i < card_list.length; i++) {
        var next_card = card_list[i];
        if (this.remove_card(next_card)) {
            removed_list.push(next_card);
        } else {
            missing_card = true;
            break;
        }
    }

    //  In all cases, we restore the cards
    for (var i = 0; i < removed_list.length; i++) {
        var next_card = removed_list[i];
        this.add_card(next_card);
    }
    return !missing_card;
};

/**
 * Get a list of cards required to purchase an item
 * @param {String} object_type : road, settlement, city, development_card
 * @return {Array} card_list : ['sheep', 'grain', 'ore']
 */
Cards.prototype.get_required_cards = function(object_type){
    var card_list = [];

    if ( object_type == 'road' ) {
        card_list.push('lumber');
        card_list.push('brick');
    }
    if ( object_type == 'settlement' ) {
        card_list.push('lumber');
        card_list.push('brick');
        card_list.push('grain');
        card_list.push('ore');
    }
    if ( object_type == 'city' ) {
        card_list.push('grain');
        card_list.push('grain');
        card_list.push('ore');
        card_list.push('ore');
        card_list.push('ore');
    }
    if ( object_type == 'development_card' ) {
        card_list.push('sheep');
        card_list.push('grain');
        card_list.push('ore');
    }
    return card_list;
};



/**
 * @param {String} card_type : check whether players have enough cards
 */
Cards.prototype.available_cards = function ( card_type ) {
    if(card_type === 'dev_card'){
        return((this.resource_cards.ore > 0) && (this.resource_cards.sheep > 0) && (this.resource_cards.grain > 0));
    }
    if(card_type === 'settlement'){
        return((this.resource_cards.brick > 0) && (this.resource_cards.sheep > 0) && (this.resource_cards.grain > 0) && (this.resource_cards.lumber > 0));
    }
    if(card_type === 'road'){
        return((this.resource_cards.brick > 0) && (this.resource_cards.lumber > 0));
    }
    if(card_type === 'city'){
        return((this.resource_cards.ore > 2) && (this.resource_cards.grain > 1) && (this.resource_cards.grain > 0));
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cards;
}

