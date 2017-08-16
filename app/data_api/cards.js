
/**
 * Create a cards object to hold relevant card relating to specific action
 */
function Cards(){
    this.cards = {
        brick : 0,
        wheat : 0,
        sheep : 0,
        wood  : 0,
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
        governors_house   : 0
    };
}

//Return number of cards in Cards Object
Cards.prototype.count_cards = function(){
    return this.cards.brick + this.cards.wheat + this.cards.sheep + this.cards.wood + this.cards.ore;
}

//Add card to cards
Cards.prototype.add_card = function(card){
    switch (card){
        case "brick":
            this.cards.brick++;
            break;
        case "wheat":
            this.cards.wheat++;
            break;
        case "sheep":
            this.cards.sheep++;
            break;
        case "wood":
            this.cards.wood++;
            break;
        case "ore":
            this.cards.ore++;
            break;
    }
}

Cards.prototype.remove_card = function(card){
    //switch was giving wierd results
    if(card == "sheep" && this.cards.sheep > 0){
        this.cards.sheep--;
        return true;
    }else if(card == "wheat" && this.cards.wheat > 0){
        this.cards.wheat--;
        return true;
    }else if(card == "brick" && this.cards.brick > 0){
        this.cards.brick--;
        return true;
    }else if(card == "wood" && this.cards.wood > 0){
        this.cards.wood--;
        return true;
    }else if(card == "ore" && this.cards.ore > 0){
        this.cards.ore--;
        return true;
    }else{
        return false;
    }
}

Cards.prototype.remove_cards = function(purchase){
    //returns true if cards loaded successfully
    if ( purchase == 'road' ) {
        return this.remove_card('brick') && this.remove_card('wood');
    }else if ( purchase == 'settlement' ) {
        return this.remove_card('brick') &&
            this.remove_card('wood') &&
            this.remove_card('wheat') &&
            this.remove_card('sheep');
    }else if ( purchase == 'city' ) {
        return this.remove_card('ore') &&
            this.remove_card('ore') &&
            this.remove_card('ore') &&
            this.remove_card('wheat') &&
            this.remove_card('wheat');
    }else if ( card == 'dev_card' ) {
        return this.remove_card('ore') &&
            this.remove_card('wheat') &&
            this.remove_card('sheep');
    }else{
        logger.log('error', 'remove_cards function failed');
        return false;
    }
}
module.exports = Cards;