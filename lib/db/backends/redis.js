/*!
 * PLAY live monitoring
 * Redis Backend implementation
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
 var redis = require('redis');

 var RedisClient = function RedisClient(options) {
   options = options || {};

   this._options = options;
   this._client = this._getClient();
 };

 RedisClient.prototype._getClient = function() {
   var client = redis.createClient(this._options.port, this._options.host);

   if (this._options.password) {
     client.auth(this._options.password);
   }

   return client;
 };

 RedisClient.prototype.get = function(key, callback) {
   this._client.get(key, callback);
 };

 exports.RedisClient = RedisClient;
 