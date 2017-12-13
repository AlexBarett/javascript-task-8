'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const chalk = require('chalk');
const request = require('request');
const defaultUrl = 'http://localhost:8080/messages/';
const commands = {
    list: get,
    send: send,
    edit: patch,
    delete: deletePost
};
const red = chalk.hex('#f00');
const green = chalk.hex('#0f0');
const gray = chalk.hex('#777');
const yellow = chalk.hex('#ff0');

function findArgs() {
    let parametrs = require('commander');
    parametrs
        .option('-v')
        .option('--id [id]', 'id')
        .option('--from [name]', 'from')
        .option('--to [name]', 'to')
        .option('--text [text]', 'text');
    parametrs.V = false;
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
        .then(messages => messages.map(message => colorisingOut(options, message)))
        .then(message => message.join('\n\n'));
}

function send(options) {
    let parametrs = { baseUrl: defaultUrl, url: '/', qs: { from: options.from, to: options.to },
        method: 'POST', json: { text: options.text } };

    return sendRequest(parametrs)
        .then(message => colorisingOut(options, message));
}

function patch(options) {
    let parametrs = { baseUrl: defaultUrl, url: `/${options.id}`,
        qs: { from: options.from, to: options.to },
        method: 'PATCH', json: { text: options.text } };

    return sendRequest(parametrs)
        .then(message => colorisingOut(options, message));
}

function deletePost(options) {
    let parametrs = { baseUrl: defaultUrl, url: `/${options.id}`,
        qs: { from: options.from, to: options.to },
        method: 'DELETE', json: { text: options.text } };

    return sendRequest(parametrs)
        .then(message => colorisingOut(options, message));
}

function colorisingOut(options, message) {
    let post = '';
    if (options.args[0] === 'delete') {
        return 'DELETED';
    }
    if (options.V) {
        post += (`${yellow('id')}: ${message.id}\n`);
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
