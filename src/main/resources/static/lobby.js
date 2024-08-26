let stompClient = null;

function connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('http://localhost:8080/topic/user', function (userData) {
            updateUserList(JSON.parse(userData.body));
        });

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        stompClient.subscribe(`/user/${currentUser.id}/queue/challenge`, function (gameRequest) {
            handleGameRequest(JSON.parse(gameRequest.body));
        });

        stompClient.subscribe(`/user/${currentUser.id}/topic/response`, function (gameResponse) {
            handleGameResponse(JSON.parse(gameResponse.body));
        });
    });
}

function updateUserList(users) {
    const userList = document.getElementById('player-list');
    userList.innerHTML = '';
    users.forEach(user => {
        if (user.id !== JSON.parse(localStorage.getItem('currentUser')).id) {
            const li = document.createElement('li');
            li.textContent = user.name;
            li.addEventListener('click', () => challengePlayer(user.id));
            userList.appendChild(li);
        }
    });
}

function challengePlayer(defenderId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    stompClient.send("http://localhost:8080/app/game_request", {}, JSON.stringify({
        attacker_id: currentUser.id,
        defender_id: defenderId,
        message: `${currentUser.name} has challenged you to a game!`
    }));
}

function handleGameRequest(request) {
    if (confirm(request.message)) {
        stompClient.send("http://localhost:8080/app/game_response", {}, JSON.stringify({
            attacker_id: request.attacker_id,
            receiver_id: JSON.parse(localStorage.getItem('currentUser')).id,
            accepted: true
        }));
        startGame(request.attacker_id, JSON.parse(localStorage.getItem('currentUser')).id);
    }
}

function handleGameResponse(response) {
    if (response.accepted) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        startGame(currentUser.id, response.receiver_id);
    } else {
        alert('Your game request was declined.');
    }
}

function startGame(attackerId, defenderId) {
    localStorage.setItem('gameInfo', JSON.stringify({ attackerId, defenderId }));
    window.location.href = 'game.html'; // Redirect to game page
}

connect();

fetch('http://localhost:8080/getUsers')
    .then(response => response.json())
    .then(users => updateUserList(users))
    .catch(error => console.error('Error fetching users:', error));