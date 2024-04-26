document.addEventListener('DOMContentLoaded', function () {
  
  let currentAppointmentId; 

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('reject-appointment')) {
      currentAppointmentId = event.target.dataset.appointmentId;
      $('#rejectModal').modal('show');
    } else if (event.target.classList.contains('confirm-reject')) {
      const remarks = document.getElementById('modalRemarkInput2').value;
      rejectAppointment(currentAppointmentId, remarks);
    }else if  (event.target.classList.contains('reschedule-appointment')) {
      $('#reschedModal').modal('show');
      $('#rejectModal').modal('hide');
  }else if (event.target.classList.contains('confirm-reschedule')) {
    handleRescheduleConfirmation();
    
  }
});

 // Function to handle reschedule action
 function handleRescheduleConfirmation() {
  const dateInput = document.getElementById('rescheduleDate');
  const timeInput = document.getElementById('rescheduleTime');

  const selectedDate = new Date(dateInput.value);
  const currentDate = new Date();

  if (selectedDate < currentDate) {
    alert('Please select a future date.');
    dateInput.value = '';
    return;
  }

  if (timeInput.value.trim() === '') {
    alert('Please enter a valid time.');
    return;
  }

  if (dateInput.value.trim() === '') {
    alert('Please enter a valid date.');
    return;
  }

  if (dateInput.value.trim() === '' || timeInput.value.trim() === '') {
    alert('Please enter a valid date and time.');
    return;
  }

  // Check if the selected date is not a weekend (Saturday or Sunday)
  const dayOfWeek = selectedDate.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert('Please select a date from Monday to Friday.');
    dateInput.value = ''; // Clear the date input
    return;
  }

  const selectedTime = timeInput.value;
  const startTime = '08:00';
  const endTime = '17:00';
  const timeRegex = /^([01]\d|2[0-3]):([0-5]0)$/;
  const isValidTime = timeRegex.test(selectedTime);

  if (selectedTime < startTime || selectedTime > endTime) {
    alert('Please select a valid time between 8:00 AM and 5:00 PM in 10-minute intervals.');
    timeInput.value = ''; // Clear the time input
    return;
  }

  if (!isValidTime) {
    alert('Time must be in 10-minutes intervel ex. 8:00 8:10 8:20 8:30');
    timeInput.value = ''; // Clear the time input
    return;
  }


  const rescheduleNotes = document.getElementById('rescheduleNotes').value;
  reschedAppointment(currentAppointmentId, selectedDate, selectedTime, rescheduleNotes);
}

  // REJECT MODAL
  document.getElementById('closeModalX').addEventListener('click', function () {
    $('#rejectModal').modal('hide');
  });

  document.getElementById('closeModalBtn').addEventListener('click', function () {
    $('#rejectModal').modal('hide');
  });

  function rejectAppointment(appointmentId, remarks) {
    fetch(`/rejectAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remarks }),
    })
    .then(response => {
      if (response.ok) {
        alert('Appointment rejected successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Failed to reject the appointment');
      }
    })
    .catch(error => {
      console.error('Error rejecting the appointment:', error);
      // Handle the error or show a message to the user
    });
  }

  //RESCHED MODAL

   // Add event listeners for the close button and the "X" button
   document.getElementById('closeModalX3').addEventListener('click', function () {
    $('#reschedModal').modal('hide');
    $('#rejectModal').modal('show');
  });

  document.getElementById('closeModalBtn3').addEventListener('click', function () {
    $('#reschedModal').modal('hide');
    $('#rejectModal').modal('show');
  });

  function reschedAppointment(appointmentId, date,rescheduleTime,rescheduleNotes) {
    fetch(`/reschedAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date,rescheduleTime,rescheduleNotes }),
    })
    .then(response => {
      if (response.ok) {
        alert('Appointment Reschedule successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Failed to Reschedule the appointment');
      }
    })
    .catch(error => {
      console.error('Error Reschedule the appointment:', error);
    });
  }
});
