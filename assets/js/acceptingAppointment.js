document.addEventListener('DOMContentLoaded', function () {
  
  let currentAppointmentId; 

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('accept-appointment')) {
      currentAppointmentId = event.target.dataset.appointmentId;
      $('#acceptModal').modal('show');
    } else if (event.target.classList.contains('confirm-accept')) {
      const remarks = document.getElementById('modalRemarkInput1').value;
      acceptAppointment(currentAppointmentId, remarks);
    }
  });

  // Add event listeners for the close button and the "X" button
  document.getElementById('closeModalX2').addEventListener('click', function () {
    $('#acceptModal').modal('hide');
  });

  document.getElementById('closeModalBtn2').addEventListener('click', function () {
    $('#acceptModal').modal('hide');
  });

  function acceptAppointment(appointmentId, remarks) {
    fetch(`/acceptAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remarks }),
    })
    .then(response => {
      if (response.ok) {
        $('#acceptModal').modal('hide');
        alert('Appointment accepted successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        response.json().then(data => {
          $('#acceptModal').modal('hide');
          alert('Failed to accept the appointment: ' + data.message);
        });
      }
    })
    .catch(error => {
      console.error('Error accepting the appointment:', error);
    });
  }
});
