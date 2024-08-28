let stompClient = null;
let currentUser = localStorage.getItem('username');

function connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect(
        { username: localStorage.getItem('username') },
        function (frame) {
            stompClient.subscribe('/topic/user', function (response) {
                console.log('Received user update:', response.body);
                updateUserList();
            });
            stompClient.subscribe(`/user/${currentUser}/queue/challenge`, function(message) {
                const challenge = JSON.parse(message.body);
                if(confirm(challenge.message)) {
                    acceptChallenge(challenge.attacker_id);
                } else {
                    declineChallenge(challenge.attacker_id);
                }
            });

            stompClient.subscribe('/topic/games', function (response) {
                console.log('Game updates received:', response.body);
                updateOngoingList();
            });

            stompClient.subscribe(`/user/${currentUser}/queue/response`, function(message) {
                const response = JSON.parse(message.body);
                handleGameResponse(response);
            });
            registerUser();
        },
        function (error) {
            console.error('Error connecting to WebSocket:', error);
        }
    );
}
function registerUser() {
    const userName = localStorage.getItem('username');
    if (userName) {
        currentUser = { name: userName };
        stompClient.send('/app/addUser', {}, JSON.stringify(currentUser));
        document.querySelector('h1').textContent = `Welcome, ${userName}!`;
        updateUserList();
    } else {
        window.location.href = 'index.html';
    }
}

function acceptChallenge(attackerId) {
    const gameResponse = {
        attacker_id: attackerId,
        defender_id: currentUser.name,
        accepted: true
    };
    stompClient.send("/app/game_response", {}, JSON.stringify(gameResponse));
    alert(`You accepted the challenge from ${attackerId}`);
    createGameRoomAndRedirect(attackerId, currentUser.name); //here
}

function declineChallenge(attackerId) {
    const gameResponse = {
        attacker_id: attackerId,
        defender_id: currentUser.name,
        accepted: false
    };
    stompClient.send("/app/game_response", {}, JSON.stringify(gameResponse));
    alert(`You declined the challenge from ${attackerId}`);
}

function createGameRoomAndRedirect(attackerId, defenderId) {
    const gameRoomId = `${attackerId}_${defenderId}`;

    stompClient.send("/app/create_game_room", {}, JSON.stringify({
        id: gameRoomId,
        attacker_id: attackerId,
        defender_id: defenderId
    }));

    stompClient.subscribe(`/topic/game/${gameRoomId}`, function(message) {
        console.log('Received game state:', message.body);
        const gameState = JSON.parse(message.body);
        updateGameState(gameState);
    });
    localStorage.setItem('attacker_id', attackerId);
    localStorage.setItem('defender_id', defenderId);
    localStorage.setItem('gameRoomId', gameRoomId);
    window.location.href = `game.html?roomId=${gameRoomId}`;
}

function updateGameState(gameState) {
    console.log('Updating game state:', gameState);
}
function updateUserList() {
    fetch('http://localhost:8080/users')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';

            users.forEach(user => {
                if (user.name !== currentUser.name) {
                    const userElement = document.createElement('div');
                    userElement.classList.add('user-item');
                    userElement.textContent = user.name;
                    userElement.onclick = () => sendGameRequest(user.name);
                    userList.appendChild(userElement);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function updateOngoingList() {
    fetch('http://localhost:8080/current_matches')
        .then(response => response.json())
        .then(matches => {
            const matchList = document.getElementById('match-list');
            matchList.innerHTML = '';

            matches.forEach(match => {
                const matchElement = document.createElement('div');
                matchElement.classList.add('match-item');
                matchElement.textContent = `${match.attacker_id} vs ${match.defender_id}`;

                // When clicked, redirect to the game board in spectate mode
                matchElement.onclick = () => watchGameRequest(match.id);
                matchList.appendChild(matchElement);
            });
        })
        .catch(error => {
            console.error('Error fetching ongoing matches:', error);
        });
}

function watchGameRequest(roomId) {
    window.location.href = `game.html?roomId=${roomId}&spectate=true`;
}


function sendGameRequest(defenderId) {
    const gameRequest = {
        attacker_id: currentUser.name,
        defender_id: defenderId,
        message: `${currentUser.name} wants to play with you!`
    };
    stompClient.send("/app/game_request", {}, JSON.stringify(gameRequest));
    alert(`Game request sent to ${defenderId}`);

    localStorage.setItem('pendingGameRequest', JSON.stringify(gameRequest));
}
function handleGameResponse(response) {
    if (response.accepted) {
        alert(`${response.defender_id} accepted your challenge!`);
        const pendingRequest = JSON.parse(localStorage.getItem('pendingGameRequest'));
        if (pendingRequest && pendingRequest.defender_id === response.defender_id) {
            createGameRoomAndRedirect(currentUser.name, response.defender_id); //here
        } else {
            console.error('No matching pending game request found');
        }
    } else {
        alert(`${response.defender_id} declined your challenge.`);
    }
    localStorage.removeItem('pendingGameRequest');
}


window.onload = function(){
    connectWebSocket()
    updateOngoingList()
}

window.onbeforeunload = function() {
    if (stompClient !== null && currentUser !== null) {
        stompClient.send("/app/disconnect", {}, JSON.stringify(currentUser));
        notifyServerGameFinished();
    }
};

function notifyServerGameFinished() {
    const gameRoomId = localStorage.getItem('gameRoomId');
    if (gameRoomId) {
        const gameRoom = {
            id: gameRoomId
        };
        const url = 'http://localhost:8080/finish_game';
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameRoom)
        };

        if (navigator.sendBeacon) {
            const blob = new Blob([options.body], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
        } else {
            fetch(url, options).catch(error => {
                console.error('Error finishing game on server:', error);
            });
        }
    }
}