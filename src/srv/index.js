const {
    performance
} = require('perf_hooks');
let express = require('express')
let app = express()
let server = app.listen(process.env.PORT || 2000, () =>
    console.log('Server started - http://localhost:2000')
)

// Force SSL
// app.use((req, res, next) => {
//     if (req.header('x-forwarded-proto') !== 'https') {
//         res.redirect(`https://${req.header('host')}${req.url}`)
//     } else {
//         next();
//     }
// });

app.use(express.static('src/web'))
let io = require('socket.io')(server)
let GAMES = {};

// Catch wildcard socket events
var middleware = require('socketio-wildcard')()
io.use(middleware)

io.sockets.on('connection', function (socket) {
    console.log(`[${performance.now()}]${socket.id} joined `);
    socket.on('join', (key) => {
        console.log(`[${performance.now()}]${socket.id} has key ${key} `);
        if (GAMES[key]) {
            GAMES[key].players.push(socket);
            GAMES[key].status.playerCount = GAMES[key].status.playerCount + 1;
            socket.emit("start", GAMES[key].status);
            GAMES[key].players.forEach(s => s.emit("joined", GAMES[key].status))

        } else {
            GAMES[key] = {
                status: {
                    started: true,
                    playerCount: 1
                },
                players: [
                    socket
                ]
            }
            socket.emit("start", GAMES[key].status);
        }
    })
    socket.on("update", ({
        key,
        x,
        y
    }) => {
        //console.log(key, x, y);
        if (GAMES[key]) {
            GAMES[key].players.filter(x => x.id != socket.id).forEach(s => s.emit("update", {
                x,
                y
            }))
        }
    })

})