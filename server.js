const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 정적 파일 제공 설정
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let activeMessages = []; // 현재 화면에 떠 있는 말풍선 데이터

io.on('connection', (socket) => {
    console.log('A user connected');

    // 기존 말풍선 데이터를 새 사용자에게 전송
    socket.emit('initialize_messages', activeMessages);

    // 새 말풍선 데이터 수신
    socket.on('new_message', (message) => {
        activeMessages.push(message);

        // 6초 후 말풍선을 삭제
        setTimeout(() => {
            activeMessages = activeMessages.filter(
                (msg) => msg.timestamp !== message.timestamp
            );
        }, 6000);

        // 모든 사용자에게 새 말풍선 전송
        io.emit('display_message', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
