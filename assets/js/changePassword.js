document.addEventListener('DOMContentLoaded', function () {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmButton = document.getElementById('confirmButton');

    confirmButton.addEventListener('click', async function () {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (newPassword !== confirmPassword) {
            // Passwords do not match
            alert('Passwords do not match');
            return;
        }


        try {
            const response = await fetch('/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });

            if (response.ok) {
                // Password changed successfully
                const message = await response.json();
                alert(message.success); // You can customize this alert or handle it as needed
            } else {
                // Handle other response statuses
                const errorMessage = await response.json();
                alert(`Error: ${errorMessage.error}`);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('Failed to change password. Please try again.'); // Provide user-friendly error message
        }
    });
});
