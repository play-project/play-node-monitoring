/*!
 * PLAY live monitoring
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var data = {
  calls : 0,
  last_call_date : null
}

exports.new_call = function() {
  data.calls ++;
  data.last_call_date = new Date();
}

exports.stats = function() {
  return data;
}