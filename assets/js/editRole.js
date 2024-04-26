document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll('.btn-edit-user');
    const editForm = document.getElementById('editForm');
    const adminSwitch = document.getElementById('adminSwitch');
    
  
    // Initialize the Bootstrap Switch
    $(adminSwitch).bootstrapSwitch();
  
    let selectedEmail; // Variable to store the selected counselor's email
    
    editButtons.forEach(editButton => {
      editButton.addEventListener('click', async function () {
        const card = this.closest('.counselor-card');
        const emailText = card.querySelector('.card-text.email').innerText;
        // Extract the email address without the "Email: " prefix
        selectedEmail = emailText.replace('Email: ', '');
        const response = await fetch(`/getCounselorAdminStatus/${selectedEmail}`);
        const isAdmin = await response.json();
        // Set the switch based on admin status
        $(adminSwitch).bootstrapSwitch('state', isAdmin, true);

        const roleResponse  = await fetch(`/getCounselorRoles/${selectedEmail}`);
        const existingRoles = await roleResponse .json();
        existingRoles.forEach(role => {
          const checkbox = document.querySelector(`input[name="department"][value="${role.department}"]`);
          if (checkbox) {
              checkbox.checked = true;
          }
      });
        // Open the modal
        $('#editModal').modal('show');
      });
    });
  
    if (editForm) {
      document.getElementById('confirmButton').addEventListener('click', async function () {
        const departmentCheckboxes = document.querySelectorAll('input[name="department"]:checked');
        const programsInput = document.getElementById('programInput');
        const programs = programsInput.value
            .split(',')
            .map(program => program.trim().toUpperCase());
             // Fetch the current admin status
        const adminResponse = await fetch(`/getCounselorAdminStatus/${selectedEmail}`);
        const currentAdminStatus = await adminResponse.json();

        // Count the number of admins
        const adminCountResponse = await fetch('/getAdminCount');
        const adminCount = await adminCountResponse.json();

        // Check if there is only one admin and trying to make it false
        if (!adminSwitch.checked && currentAdminStatus && adminCount === 1) {
            // Display an alert if there is only one admin
            alert('There should be at least one admin.');
            return;
        }

         // Validate program codes before submitting
      if (!validateProgramCode(programInput.value)) {
        alert('Invalid program code format. Example: BIT,BCS,MEB');
        return;
      }

        const data = {
          counselorEmail: selectedEmail,
          departments: Array.from(departmentCheckboxes).map(checkbox => ({
            department: checkbox.value,
        })),
          admin: adminSwitch.checked,
          programs: programs,
        };
        
        // Send the data object to the server using fetch
        fetch('/adminEditRoles/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            console.log(data); // Log the server response
            // Display a success message to the user
            alert('Counselor role updated successfully!');
            // Reload the current page or perform any other actions
            window.location.reload();
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
            // Display an error message to the user
            alert('Error updating counselor role. Please try again.');
          });
      });
    }

});

// Add smooth closing for the modal
$('#modalCloseButtonX, #modalCancelButton').on('click', function () {
    $('#editModal').modal('hide');
});
function validateProgramCode(programCode) {
  if (!programCode.trim()) {
    // Empty input, no validation needed
    return true;
  }

  const codes = programCode.split(',');
  const isValid = codes.every(code => /^[A-Za-z]{3}$/.test(code.trim()));
  return isValid;
}