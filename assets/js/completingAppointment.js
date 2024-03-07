document.addEventListener('DOMContentLoaded', function () {

    function completeAppointment(appointmentId) {
      fetch(`/completeAppointment/${appointmentId}`, {
        method: 'POST',
      })
      .then(response => {
        if (response.ok) {
          alert('Appointment complete successfully!'); 
  

          setTimeout(() => {
            window.location.reload(); 
          }, 1000); 
        } else {
          console.error('Failed to accept the appointment');
        }
      })
      .catch(error => {
        console.error('Error accepting the appointment:', error);
 
      });
    }

    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('btn-outline-success')) {
        const appointmentId = event.target.dataset.appointmentId;
        completeAppointment(appointmentId);
      }
    });
  });
  