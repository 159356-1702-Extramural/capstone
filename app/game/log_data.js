/********************************************************
 * Only used to debug program
 *Log a data object
 *
 ********************************************************/
function log_data(data) {
  this.log('debug','=====data object====');
  this.log('debug','data_type :'+data.data_type);
  this.log('debug','player_id : '+data.player_id);
  this.log('debug','=====actions=======');
  data.actions.forEach(function (item,index) {
    this.log('debug','  ===action '+index+'===');
    this.log('debug','action type'+item.action_type);
    this.log('debug','action type'+item.action_result);
    // this.log('debug','--action data--'+item.action_data[0].valueOf());
    // item.action_data.forEach(function (itm,idx) {
    //   this.log('debug','action data: '+itm.id);
    //   this.log('debug','action data: '+itm);
    // })
    this.log('debug','action data'+item.action_data[1].toString());
    this.log('debug','boost cards'+item.boost_cards);

  })
}

function log_player(playerid){
  this.log('debug','====player object====');

}

module.exports=log_data

