document.addEventListener('DOMContentLoaded', function () {
  
  let currentAppointmentId;

 
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('cancel-appointment')) {

      currentAppointmentId = event.target.dataset.appointmentId;
      $('#cancelModal').modal('show');
    } else if (event.target.classList.contains('confirm-cancel')) {

      const remarks = document.getElementById('modalRemarkInput2').value;

      cancelAppointment(currentAppointmentId, remarks);
    }
  });

  // Function to handle Cancelling an appointment
  function cancelAppointment(appointmentId, remarks) {
    fetch(`/cancelAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remarks }),
    })
    .then(response => {
      if (response.ok) {
        alert('Appointment cancelled successfully!');

        // After a short delay, refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Failed to cancel the appointment');
      }
    })
    .catch(error => {
      console.error('Error cancelling the appointment:', error);
      // Handle the error or show a message to the user
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  // Function to handle refreshing the page
  function refreshPage() {
    // You can customize this function based on your needs
    window.location.reload();
  }

  // Event delegation to handle modal close button clicks
  document.addEventListener('click', function (event) {
    // Check if the clicked element or its ancestor has the ID "closeModalBtn"
    if (event.target.id === 'closeModalBtn' || event.target.closest('#closeModalBtn')) {
      // Add your logic here before refreshing (if needed)
      refreshPage();
    } else if (event.target.id === 'closeModaX'|| event.target.closest('#closeModalX')) {
      refreshPage();
    }
  });
});

$(document).ready(function () {
  // Initialize DataTable
  $('#appointmentTable').DataTable();
});