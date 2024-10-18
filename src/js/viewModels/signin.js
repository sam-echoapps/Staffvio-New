'use strict';
define(['ojs/ojcore', 'knockout', 'appController', 'appUtils',
    'ojs/ojknockout', 'ojs/ojcheckboxset', 'ojs/ojinputtext',
    'ojs/ojbutton', 'ojs/ojvalidationgroup',
    'ojs/ojanimation','ojs/ojformlayout','ojs/ojdialog'], 
    function(oj, ko, app, appUtils) {
        class signin {
            constructor() {
                var self = this;
                $("#loaderViewSec").hide();

                self.transitionCompleted = function() {
                    appUtils.setFocusAfterModuleLoad('signInBtn');
                    var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
                    oj.AnimationUtils['fadeIn'](document.getElementsByClassName('demo-signin-bg')[0], animateOptions);
                }

                self.groupValid = ko.observable();
                self.SignIn = ko.observable();
                self.LoginErr = ko.observableArray([]);
                self.OnePlaceuserName = ko.observable();
                self.OnePlacepassWord = ko.observable();
                self.CancelBehaviorOpt = ko.observable('icon');
                self.device = ko.observable();
                
                self.signIn = function(data, event) {
                    var valid = self._checkValidationGroup("tracker");
                    if (valid){
                        sessionStorage.setItem("timeInetrval",0);
                        //sessionStorage.setItem("timeInetrval",1000 * 3);
                        document.querySelector('#signInProgress').open();
                        //alert(sessionStorage.getItem("timeInetrval"))
                        self.SignIn('');
                        self.LoginErr([]);

                        const characters ='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                        function generateString(length) {
                            let result = '';
                            const charactersLength = characters.length;
                            for ( let i = 0; i < length; i++ ) {
                                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                            }
                            
                            return result;
                        }
                        var key = "."+generateString(8);
                        $.ajax({
                            //url: "/jobPlusLogin", 
                            //url: "http://169.197.183.168:8030/jobPlusLogin",
                            url: "http://65.0.111.226:8030/jobPlusLogin",
                            type: 'POST',
                            data: JSON.stringify({
                                user: self.OnePlaceuserName(),
                                passwd : self.OnePlacepassWord(),
                                onepsuid :  key
                            }),
                            dataType: 'json',
                            timeout: sessionStorage.getItem("timeInetrval"),
                            context: self,
                            error: function (xhr, textStatus, errorThrown) {
                                if(textStatus == 'timeout' || textStatus == 'error'){
                                    document.querySelector('#signInProgress').close();
                                    document.querySelector('#TimeoutSign').open();
                                }
                            },
                            success: function (data) {
                                if (data[1]== 'Y') {
                                    //sessionStorage.setItem("BaseURL", "");
                                    //sessionStorage.setItem("BaseURL", "http://169.197.183.168:8030");
                                    sessionStorage.setItem("BaseURL", "http://65.0.111.226:8030");
                                    sessionStorage.setItem("userId", data[2]);
                                    sessionStorage.setItem("userName", data[3]);
                                    sessionStorage.setItem("userRole", data[4]);
                                    sessionStorage.setItem("clientId", data[5]);
                                    sessionStorage.setItem("fullName", data[6]);
                                    sessionStorage.setItem("userStatus", data[7]);
                                    var login = localStorage.getItem('login');
                                    self.SignIn('Y');
                                    if(login == "yes"){
                                        console.log('Success')
                                        app.onLoginSuccess();
                                    }
                                    else{
                                        console.log('Time')
                                        setTimeout(function(){
                                            //document.querySelector('#signInProgress').close();
                                            app.onLoginSuccess();
                                        }, 1000 * 5);
                                    }
                            
                                    localStorage.setItem('login', 'yes');
                                    sessionStorage.setItem("userName", self.OnePlaceuserName());
                                }
                                else {
                                    self.SignIn('N');
                                    document.querySelector('#LoginErrDialog').open();
                                    self.LoginErr(data[0]);
                                }
                                return self;
                            }

                        })
                    }
                };
                self._checkValidationGroup = (value) => {
                    var tracker = document.getElementById(value);
                    if (tracker.valid === "valid") {
                        return true;
                    }
                    else {
                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                        return false;
                    }
                };

                self.LoginMsgOKClose = function () {
                    document.querySelector('#TimeoutSign').close();
                    document.querySelector('#LoginErrDialog').close();
                    document.querySelector('#signInProgress').close();
                }
                self.connected = function () {
                    var loginCheck = sessionStorage.getItem('userRole');
                    if(loginCheck){
                        app.onLoginSuccess();
                    }
            //Checking device type
                // const userAgent = navigator.userAgent;
                // console.log(userAgent);
                const userAgent = navigator.userAgent.toLowerCase();

                if (/android|iphone|ipad|ipod/.test(userAgent)) {
                    if (/chrome|safari|firefox|edge|opera/.test(userAgent)) {
                       console.log('Accessed via mobile browser');
                       self.device('Mobile')
                       sessionStorage.setItem("deviceTypeValue", 'Mobile');
                    } else {
                       console.log('Accessed via an app or unknown browser');
                       self.device('App')
                       sessionStorage.setItem("deviceTypeValue", 'App');
                    }
                } else {
                   console.log('Accessed via desktop browser');
                   self.device('Desktop')
                   sessionStorage.setItem("deviceTypeValue", 'Desktop');
                }

                };
            }
        }
        return signin;
    }
);
