'use strict';

const http = require('http');
const server = http.createServer();
const url = require('url');
const queryString = require('querystring');
const shortid = require('shortid');
const commands = {
    GET: get,
    POST: post,
    PATCH: patch,
    DELETE: deletePost
};

let messages = [];

server.on('request', (req, res) => {
    if ((/^\/messages($|\?)/).test(req.url)) {
        res.setHeader('content-type', 'application/json');
        commands[req.method](req, res);
    } else {
        res.statusCode = 404;
        res.end();
    }
});

function get(req, res) {
    let query = url.parse(req.url).query;
    let { from, to } = queryString.parse(query);

    let posts = messages.filter(message =>
        (!from || from === message.from) &&
        (!to || to === message.to));
    res.end(JSON.stringify(posts));
}

function post(req, res) {
    let query = url.parse(req.url).query;
    let { from, to } = queryString.parse(query);
    let message = {};
    let text = '';
    req
        .on('data', data => {
            text += data;
        })
        .on('end', () => {
            message.id = shortid.generate();
            message.from = from;
            message.to = to;
            message.text = JSON.parse(text).text;
            messages.push(message);
            res.end(JSON.stringify(message));
        });
}

function patch(req, res) {
    let id = getID(req);
    let text = '';
    req
        .on('data', data => {
            text += data;
        })
        .on('end', () => {
            messages.forEach(message => {
                if (message.id === id) {
                    message.text = JSON.parse(text).text;
                    message.edited = true;
                    res.end(JSON.stringify(message));
                }
            });
        });
}

function deletePost(req, res) {
    let id = getID(req);
    messages = messages.filter(message => message.id !== id);
    res.end(JSON.stringify({ status: 'ok' }));
}

function getID(req) {
    let id = url(req.url).split('/')
        .slice(-1)[0];

    return id;
}

module.exports = server;
