function login() {
    const username = document.getElementById('username').value;
    if (username) {
        localStorage.setItem('username', username);
        window.location.href = 'user-list.html';
    } else {
        alert('Please enter a username');
    }
}