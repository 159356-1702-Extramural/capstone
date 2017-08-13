
/**
 * Create a cards object to hold relevant card relating to specific action
 */
function Cards(){
    this.toPlay = {
        brick : 0,
        wheat : 0,
        sheep : 0,
        wood  : 0,
        ore   : 0
    };
}

//Return number of cards in Cards Object
Cards.prototype.countCards = function(){
    return this.toPlay.brick + this.toPlay.wheat + this.toPlay.sheep + this.toPlay.wood + this.toPlay.ore;
}

//Add card to cards
Cards.prototype.addCard = function(card){
    switch (card){
        case "brick":
            this.toPlay.brick++;
            break;
        case "wheat":
            this.toPlay.wheat++;
            break;
        case "sheep":
            this.toPlay.sheep++;
            break;
        case "wood":
            this.toPlay.wood++;
            break;
        case "ore":
            this.toPlay.ore++;
            break;
    }
}

Cards.prototype.removeCard = function(card){
    //switch was giving wierd results
    if(card == "sheep" && this.toPlay.sheep > 0){
        this.toPlay.sheep--;
    }else if(card == "wheat" && this.toPlay.wheat > 0){
        this.toPlay.wheat--;
    }else if(card == "brick" && this.toPlay.brick > 0){
        this.toPlay.brick--;
    }else if(card == "wood" && this.toPlay.wood > 0){
        this.toPlay.wood--;
    }else if(card == "ore" && this.toPlay.ore > 0){
        this.toPlay.ore--;
    }
}

module.exports = Cards;