const events = require("events");

module.exports = {
    ready: new events(),
    already: false,

    events: {
        ready: "ready",
        execute: "execute"
    },

    catch: {
        error: []
    },

    size: {
        total: 0,
        current: 0
    },

    start: {
        location: 'Core'
    },
    lock: ['lock', 'storage'],

    lang: ['js'],

    web: {
        root: {
            location: 'https://',
            domain: 'grandkiwi.kro.kr'
        }
    }
}
