/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express  = require('express'),
  app        = express(),
  extend     = require('util')._extend,
  pkg        = require('./package.json'),
  training   = require('./training/setup'),
  Q          = require('q');


// Bootstrap application settings
require('./config/express')(app);

var log = console.log.bind(null, '  ');

var apis = null;

// promises
var converse, updateProfile, getIntent;

// train the service and create the promises with the result
training.train(function(err) {
	if (err){
    console.log('ERROR:', err.error);
  }

  apis = require('./api/services');

  converse = Q.nfbind(apis.dialog.conversation.bind(apis.dialog));
  updateProfile = Q.nfbind(apis.dialog.updateProfile.bind(apis.dialog));
  getIntent = Q.nfbind(apis.classifier.classify.bind(apis.classifier));
});

// create the conversation
app.post('/api/create_conversation', function(req, res, next) {
  log('called /api/create_conversation: conversing with input ' + req.body);
  converse(req.body)
  .then(function(result){
    res.json(result[0]);
  })
  .catch(next);
});

// converse
app.post('/api/conversation', function(req, res, next) {
  log('called /api/conversation: conversing with input ' + req.body.input);
  log('--------------------------');
  log('1. classifying user intent');
  getIntent({ text: req.body.input })
  .then(function(result) {
    log('2. updating the dialog profile with the user intent');
    var classes = result[0].classes;
    var profile = {
      client_id: req.body.client_id,
      name_values: [
        { name:'Class1', value: classes[0].class_name },
        { name:'Class1_Confidence', value: classes[0].confidence },
        { name:'Class2', value: classes[1].class_name },
        { name:'Class2_Confidence', value: classes[1].confidence }
      ]
    };
    log('Classifier result: Class1=' + classes[0].class_name + ' Class2=' +  classes[1].class_name);
    
    return updateProfile(profile);
  })
  .catch(function(error ){
    log('2.', error.description || error);
  })
  .then(function() {
    log('3. calling dialog.conversation()');
    return converse(req.body)
    .then(function(result) {
      var conversation = result[0];
      log('4. continue the conversation');
      res.json(conversation);
    });
  })
  .catch(next);
});


/**
 * Returns the classifier_id and dialog_id to the user.
 */
app.get('/api/services', function(req, res) {
  log('called /api/services');
  res.json({
    dialog_id: apis ? apis.dialog_id : 'Unknown',
    classifier_id: apis ? apis.classifier_id : 'Unknown'
  });
  log('returning ids ' + res.json);
});

// error-handler application settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
var host = process.env.VCAP_APP_HOST || 'localhost';
app.listen(port);

console.log(pkg.name + ':' + pkg.version, host + ':' + port);
