document.addEventListener('DOMContentLoaded', function () {
  
    let currentAppointmentId;
  
 
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('reject-appointment')) {
        currentAppointmentId = event.target.dataset.appointmentId;
        $('#rejectModal').modal('show');
      } else if (event.target.classList.contains('confirm-reject')) {
        const remarks = document.getElementById('modalRemarkInput2').value;
        rejectAppointment(currentAppointmentId, remarks);
      }
    });

        // Add event listeners for the close button and the "X" button
        document.getElementById('closeModalX').addEventListener('click', function () {
            $('#rejectModal').modal('hide');
          });
        
          document.getElementById('closeModalBtn').addEventListener('click', function () {
            $('#rejectModal').modal('hide');
          });
      
  
    // Function to handle rejecting an appointment
    function rejectAppointment(appointmentId, remarks) {
      fetch(`/rejectResched/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks }),
      })
      .then(response => {
        if (response.ok) {
            $('#rejectModal').modal('hide');
          alert('Appointment rejected successfully!');
  
          // After a short delay, refresh the page
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
            $('#rejectModal').modal('hide');
          console.error('Failed to reject the appointment');
        }
      })
      .catch(error => {
        console.error('Error rejecting the appointment:', error);
        // Handle the error or show a message to the user
      });
    }
  });
  

  