document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    // Function to display messages to the user
    function showMessage(message, type) {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);

        // Animate the message in
        setTimeout(() => {
            messageBox.style.opacity = '1';
        }, 10);

        // Automatically remove the message after 3 seconds
        setTimeout(() => {
            messageBox.style.opacity = '0';
            messageBox.addEventListener('transitionend', () => {
                messageBox.remove();
            });
        }, 3000);
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const role = document.getElementById('role').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const data = {
            email,
            password,
            role
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Registration successful! Redirecting to login...', 'success');
                // Redirect to the login page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showMessage(result.message || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred during registration.', 'error');
        }
    });
});
