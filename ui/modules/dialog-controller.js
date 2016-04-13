/* Copyright IBM Corp. 2015
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
    'use strict';

    /**
     * @name DialogController
     * @module dialog/controller
     * @description
     *
     * Controls the state of the Dialog view. At any given point of time, the Dialog is in one of the following states:
     *
     * - initial  The "home" view displayed to the user when launching dialog
     * - chatting  The view displayed when user is typing a new response/question
     *
     */
    var DialogController = function (_, $rootScope, $scope, $location, $anchorScroll, $timeout, gettextCatalog, dialogService) {
        var self = this;
        var placeholderText = null;
        var states = {
            'intro': {
                'key': 'intro',
                'class': 'intro',
                'placeholder': 'Loading. Please wait...',
                'introText': ''
            },
            'chatting': {
                'key': 'chatting',
                'class': 'chatting',
                'placeholder': 'Start typing...',
                'introText': ''
            }
        };

        var setState = function (state) {
            self.state = _.cloneDeep(state);
        };




        setState(states.intro);
        //gets the conversation array such that it can be tracked for additions
        self.conversation = dialogService.getConversation();
        self.question = null;

        if (!self.placeHolder) {
            //if we haven't received the placeholder, make a call to initChat API to get welcome message
            self.placeHolder = (function () {
                var init = dialogService.initChat();
                return init.then(function (response) {
                    placeholderText = response.welcomeMessage;
                    states.intro.introText = placeholderText.replace(/\n\n/g, ' '); //for placeholder attr use spaces
                    states.intro.placeholder = 'Start typing...';
                    $('#question').removeAttr('disabled');
                    setState(states.intro);
                    $('#question').focus();
                });
            }());
        }

        /**
         * Submits the current question using dialogService
         */
        self.submit = function () {
            var child = null;
            var timeout = null;
            var footer = null;
            if (!self.question || self.question.length === 0) {
                $('#question').focus();
                return;
            }
            if (self.conversation.length > 1 && self.conversation[self.conversation.length - 1].options) {
                self.conversation[self.conversation.length - 1].options = null;
            }
            $('#question').attr('disabled', '');
            timeout = $timeout(function () {
                    var scrollable = $('#scrollable-div');
                    if (scrollable[0]) {
                        scrollable[0].scrollTop = scrollable[0].scrollHeight;
                    }
                }, 500);

            dialogService.query(self.question, true).then(function (response) {
                $('#question').removeAttr('disabled');
                $('#question').val('');
                if ($.isArray(response)) {
                    response = response[response.length - 1];
                    //If we are displaying on a mobile device (less than 750 tall) we do
                    //not want to put focus into the field! (we don't want the keyboard popping up)
                    if ($(window).height() > 750) {
                        $('#question').focus();
                    }
                }
                //This is not a great hack, but the only fix I could find for compensating
                //for the width of the scrollbars. When the scrollbar appears it
                if ($('#scrollable-div').prop('clientHeight') < $('#scrollable-div').prop('scrollHeight')) {
                    child = document.getElementById('resize-footer-col');
                    child.style.display = 'table-cell';
                    footer = document.getElementById('dialog-footer');
                    footer.style.overflowY = 'scroll';
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    timeout = $timeout(function () {
                        var scrollableDiv = $('#scrollable-div');
                        child.style.display = 'none';
                        if (scrollableDiv[0]) {
                            scrollableDiv[0].scrollTop = scrollableDiv[0].scrollHeight;
                        }
                     }, 500);
                }
                else {
                    child = document.getElementById('resize-footer-col');
                    child.style.display = 'table-cell';
                    footer = document.getElementById('dialog-footer');
                    footer.style.overflowY = 'hidden';
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    timeout = $timeout(function () {
                        var scrollableDiv = $('#scrollable-div');
                        child.style.display = 'none';
                        if (scrollableDiv[0]) {
                            scrollableDiv[0].scrollTop = scrollableDiv[0].scrollHeight;
                        }
                    }, 500);
                }
            });
            delete self.question;
        };


        self.submitLink = function (textToSubmit) {
            $('#question').val(textToSubmit);
            self.question = textToSubmit;
            self.submit();
        };

        self.switchToChatting = function () {
            $location.path('chatting');
        };

        $scope.$on('$viewContentLoaded', function (next, current) {
            if (placeholderText) {
                $('#question').removeAttr('disabled');
                $('#question').focus();
            }
        });

        //Watch the conversation array.. If a segment is added then update the state
        $scope.$watch(function () {
            return self.conversation;
        }, function () {
            // We have a new response, switch to 'answered' state
            if (!_.isEmpty(self.conversation)) {
                if (self.conversation.length === 1) {
                   states.intro.introText = self.conversation[0].responses;
                    $('body').addClass('dialog-body-running');
                    setState(states.chatting);
                }
            }
        }, true);
    };

    angular.module('dialog.controller', [ 'gettext', 'lodash', 'ngRoute', 'ngSanitize', 'ngAnimate', 'dialog.service' ]).config(
            function ($routeProvider) {
                $routeProvider.when('/', {
                    'templateUrl': 'modules/home.html',
                    'reloadOnSearch': false
                }).when('/chatting', {
                    'templateUrl': 'modules/dialog.html',
                    'reloadOnSearch': false
                });
            }).controller('DialogController', DialogController);
}());
