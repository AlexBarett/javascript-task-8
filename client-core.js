'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const chalk = require('chalk');
const request = require('request');
const defaultUrl = 'http://localhost:8080/messages/';
const commands = {
    list: get,
    send: send
};

function findArgs() {
    let parametrs = require('commander');
    parametrs
        .option('--from [name]', 'from')
        .option('--to [name]', 'to')
        .option('--text [text]', 'text');
    parametrs.from = undefined;
    parametrs.to = undefined;
    parametrs.text = '';

    return parametrs.parse(process.argv);
}

function execute() {
    let options = findArgs();

    return commands[options.args[0]](options);
}

function get(options) {
    let parametrs = { baseUrl: defaultUrl, url: '/', qs: { from: options.from, to: options.to },
        method: 'GET', json: true };

    return sendRequest(parametrs)
        .then(messages => messages.map(message => colorisingOut(message)))
        .then(message => message.join('\n\n'));
}

function send(options) {
    let parametrs = { baseUrl: defaultUrl, url: '/', qs: { from: options.from, to: options.to },
        method: 'POST', json: { text: options.text } };

    return sendRequest(parametrs)
        .then(message => colorisingOut(message));
}

function colorisingOut(message) {
    let red = chalk.hex('#f00');
    let green = chalk.hex('#0f0');
    let post = '';
    if (message.from) {
        post += (`${red('FROM')}: ${message.from}\n`);
    }
    if (message.to) {
        post += (`${red('TO')}: ${message.to}\n`);
    }
    post += (`${green('TEXT')}: ${message.text}`);

    return post;
}

function sendRequest(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, response, body) => {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
    });
}
