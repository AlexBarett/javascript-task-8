'use strict';

module.exports.execute = execute;
module.exports.isStar = true;

const chalk = require('chalk');
const request = require('request');
const defaultUrl = 'http://localhost:8080/messages/';
const commands = {
    list: get,
    send: send,
    patch: patch,
    delete: deletePost
};
const red = chalk.hex('#f00');
const green = chalk.hex('#0f0');
const gray = chalk.hex('#777');
const yellow = chalk.hex('#ff0');

function findArgs() {
    let parametrs = require('commander');
    parametrs
        .option('--id [id]', 'id')
        .option('--from [name]', 'from')
        .option('--to [name]', 'to')
        .option('--text [text]', 'text');
    parametrs.id = undefined;
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

function patch(options) {
    let parametrs = { baseUrl: defaultUrl, url: `/${options.id}`,
        qs: { from: options.from, to: options.to },
        method: 'PATCH', json: { text: options.text } };

    return sendRequest(parametrs)
        .then(message => colorisingOut(message));
}

function deletePost(options) {
    let parametrs = { baseUrl: defaultUrl, url: `/${options.id}`,
        qs: { from: options.from, to: options.to },
        method: 'DELETE', json: { text: options.text } };

    return sendRequest(parametrs)
        .then(message => colorisingOut(message));
}

function colorisingOut(message, deleted) {
    let post = '';
    if (deleted) {

        return 'DELETED';
    }
    if (message.v) {
        post += (`${yellow('ID')}: ${message.id}\n`);
    }
    if (message.from) {
        post += (`${red('FROM')}: ${message.from}\n`);
    }
    if (message.to) {
        post += (`${red('TO')}: ${message.to}\n`);
    }
    post += (`${green('TEXT')}: ${message.text}`);
    if (message.edited) {
        post += (`${gray('(edited)')}`);
    }

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
