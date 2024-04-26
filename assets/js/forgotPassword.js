// forgotPassword.js

document.addEventListener('DOMContentLoaded', function () {
    const forgotForm = document.getElementById('forgotForm');
    const emailStatus = document.getElementById('emailStatus');

    if (forgotForm) {
        forgotForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const emailInput = document.getElementById('forgotAccount');
            const email = emailInput.value.trim();

            try {
                const response = await fetch('/forgotPassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    // Password reset email sent successfully
                    const message = await response.text();
                    if (message === 'Password reset email sent successfully') {
                        emailStatus.innerText = 'An email has been sent';
                        emailStatus.className = 'status-box success';
                        // You can also redirect the user to a confirmation page or handle it as needed
                    } else {
                        emailStatus.innerText = 'Unknown success message';
                        emailStatus.className = 'status-box error';
                    }
                } else {
                    const data = await response.text();
                    if (data === 'User not found') {
                        emailStatus.innerText = 'User not found';
                        emailStatus.className = 'status-box error';
                    } else {
                        emailStatus.innerText = `Error: ${data}`;
                        emailStatus.className = 'status-box error';
                    }
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                emailStatus.innerText = 'Make Sure To Check Existing Email.';
                emailStatus.className = 'status-box error';
            }
        });
    }
});
