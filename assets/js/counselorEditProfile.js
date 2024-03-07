document.addEventListener('DOMContentLoaded', function () {
    // Get references to the modal and the "Save Changes" button
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const openConfirmModalBtn = document.getElementById('openConfirmModalBtn');
  
    // Add an event listener to the "Save Changes" button
    openConfirmModalBtn.addEventListener('click', function () {
          const phone_number = document.getElementById('editPhoneNumber').value;
          const birth_date = document.getElementById('editBirthdate').value;
      const phPhoneNumberRegex = /^\+639\d{9}$/; // Philippine phone number format
      if (
        !phone_number ||
        !birth_date 
    ) {
        alert('Please fill out all required fields.');
        return; // Prevent form submission
    }
    if (!phPhoneNumberRegex.test(phone_number)) {
      alert('Please enter a valid Philippine phone number (+639xxxxxxxxx).');
      return; // Prevent form submission
  }
      confirmModal.show();
    });
  
    // Add an event listener to the "Yes, Save Changes" button in the confirmation modal
    const confirmChangesBtn = document.getElementById('confirmChangesBtn');
    confirmChangesBtn.addEventListener('click', function () {
     
      
      const email = document.getElementById('editEmail').value;
          const phone_number = document.getElementById('editPhoneNumber').value;
          const birth_date = document.getElementById('editBirthdate').value;
          
          fetch('/updateCounselorProfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              phone_number,
              birth_date
            }),
          })
          .then(response => {
            if (response.ok) {
              alert('Changes successfully!');
      
              // After a short delay, refresh the page
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } 
          })
          .catch(error => {
            console.error('Error Report ', error);
            // Handle the error or show a message to the user
          });
      editProfileModal.hide();
      confirmModal.hide();
    });
  });