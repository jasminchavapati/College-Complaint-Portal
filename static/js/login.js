document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

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

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const data = {
            email,
            password
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Pass user information in URL parameters for direct use
                const userRole = result.role;
                const userEmail = result.email;
                
                showMessage('Login successful!', 'success');

                // Redirect to the complaint form page with URL parameters
                setTimeout(() => {
                    window.location.href = `complaint_form.html?role=${userRole}&email=${userEmail}`;
                }, 1000);
            } else {
                showMessage(result.message || 'Login failed.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred during login.', 'error');
        }
    });
});
