var $ = require('jquery-browserify');
require('jquery-mousewheel')($);
var terminal = require('jquery.terminal');

function lineByLine (terminal, msgArray, delay) {
    var msgIndex = 0;
    terminal.stopKeypress = true;
    var interval = setInterval(function () {
        terminal.echo(msgArray[msgIndex++]);
        if (msgIndex >= msgArray.length) {
            clearInterval(interval);
            terminal.stopKeypress = false;
        }
    }, delay);
}

var empty = {
    options: [],
    args: []
};
var commands = {
    'get-command': {
        args: ['clear'],
        options: ['name', 'age', 'description', 'address']
    },
    'git': {
        args: ['commit', 'push', 'pull'],
        options: ['amend', 'hard', 'version', 'help']
    },
    'get-name': empty,
    'get-age': empty,
    'get-money': empty
};
var terminalMethods = {
    verifiedMessage: [
        '>>> Validating operator credentials...',
        '>>> Operator verified...',
        '[[b;#44D544;]>>> ACCESS GRANTED\n\n'
    ],
    loginGreeting: '[[b;#44D544;]>>> INITIALIZING PROGRAM <<<]\n',
    wrongPasswordTryAgain: '>>> ACCESS DENIED',
    login: function (user, password, callback) {

        //todo: auth api call here
        var self = this;
        if (user == 'asd' && password == 'asd') {
            callback('AUTHENTICATION TOKEN');
            console.log(self.token(true));
        } else {
            callback(null);
        }

    },
    keypress: function (e) {
        /* Disable tilda */
        if (e.which == 96) {
            return false;
        }
    },
    keydown: function (e) {
        var self = this;
        // setTimeout because terminal is adding characters in keypress
        // we use keydown because we need to prevent default action for tab and still execute custom code
        setTimeout(function () {
            var command = self.get_command();
            var name = command.match(/^([^\s]*)/)[0];
            if (name) {
                var word = self.before_cursor(true);
                var regex = new RegExp('^' + $.terminal.escape_regex(word));
                var list;
                if (name == word) {
                    list = Object.keys(commands);
                } else if (command.match(/\s/)) {
                    if (commands[name]) {
                        if (word.match(/^--/)) {
                            list = commands[name].options.map(function (option) {
                                return '--' + option;
                            });

                        } else {
                            list = commands[name].args;
                        }
                    }
                }
                if (word.length >= 2 && list) {
                    var matched = [];
                    for (var i = list.length; i--;) {
                        if (regex.test(list[i])) {
                            matched.push(list[i]);
                        }
                    }
                    var insert = false;
                    if (e.which == 9) {
                        if (self.complete(matched)) {
                            word = self.before_cursor(true);
                            regex = new RegExp('^' + $.terminal.escape_regex(word));
                        }
                        /* Show available options on TAB */
                        /*if (matched.length) {
                         var matches = [];
                         for (var i=0; i<matched.length; ++i) {
                         matches.push(matched[i]);
                         }
                         self.echo(matches.toString().replace(/,/g, '\t'));
                         }*/
                    }
                }
            }
        }, 0);
        if (e.which === 9 || self.stopKeypress) {
            return false;
        }
    },
    onInit: function () {
        this.clear();
        lineByLine(this, terminalMethods.verifiedMessage, 200);
    },
    onExit: function () {
        this.clear();
        this.echo(terminalMethods.loginGreeting);
    }
};

$(function () {
    var focus = false;
    var terminal = $('#console').terminal({
        echo: function (arg1) {
            this.echo(arg1);
        },
        rpc: 'some_file.php',
        calc: {
            add: function (a, b) {
                this.echo(a + b);
            },
            sub: function (a, b) {
                this.echo(a - b);
            }
        }
    }, {
        greetings: false,
        maskChar: '',
        enabled: false,
        strings: {
            loginGreeting: terminalMethods.loginGreeting,
            login: 'ENTER USER ID',
            password: 'ENTER PASSCODE',
            wrongPasswordTryAgain: terminalMethods.wrongPasswordTryAgain
        },
        login: terminalMethods.login,
        keypress: terminalMethods.keypress,
        keydown: terminalMethods.keydown,
        onInit: terminalMethods.onInit,
        onExit: terminalMethods.onExit

    });

    $(document.documentElement).keypress(function (e) {
        if (e.charCode == 96) {
            terminal.toggle();
            terminal.focus(focus = !focus);
        }
    });
});
