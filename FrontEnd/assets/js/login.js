let form = document.getElementById('form-login');
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let req = await fetch("http://localhost:5678/api/users/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.value, password: password.value }),
    })
    if (req.status !== 200) {
        let error_p = document.getElementById('info-error');
        error_p.style.display = "block";
        email.classList.add('error');
        password.classList.add('error');
        error_p.innerHTML = "Erreur dans l’identifiant ou le mot de passe";
        return;
    }
    if (req.status === 200) {
        let res = await req.json();
        localStorage.setItem('token', res.token);
        window.location.href = 'http://127.0.0.1:5501/';
    }
}); 
        
