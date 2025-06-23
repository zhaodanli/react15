let EventEmitter = require('events');
let e = new EventEmitter();

e.once('click', (data) => {
    console.log('clicked', data);
});

e.emit('click', 'data');
e.emit('click', 'data');