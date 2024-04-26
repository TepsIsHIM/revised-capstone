document.addEventListener('DOMContentLoaded', function () {

    function cancelAppointment(appointmentId) {
      fetch(`/studentCancelAppointment/${appointmentId}`, {
        method: 'POST',
      })
      .then(response => {
        if (response.ok) {
          alert('Appointment cancelled successfully!');
  
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error('Failed to cancel the appointment');
          alert('Failed to cancel the appointment');
        }
      })
      .catch(error => {
        console.error('Error cancelling the appointment:', error);

      });
    }
  
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('cancel-appointment')) {
        const appointmentId = event.target.dataset.appointmentId;
        cancelAppointment(appointmentId);
      }
    });
  });
  