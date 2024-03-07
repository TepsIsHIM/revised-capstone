document.addEventListener('DOMContentLoaded', function () {
  
    let currentAppointmentId; 
  
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('feedback')) {
        currentAppointmentId = event.target.dataset.appointmentId;
        console.log(currentAppointmentId);
      } else if (event.target.classList.contains('confirm-submit')) {

        submitFeedback(currentAppointmentId);
      }
    
      
    });
  
    function submitFeedback(appointmentId) {
        // Retrieve the selected radio button value
        const ratingValue = document.querySelector('input[name="rating"]:checked').value;
    
        // Rest of your feedback function
        fetch(`/feedback/${appointmentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ratingValue }),
        })
        .then(response => {
            if (response.ok) {

              alert('Feedback successfully!');
             
            } else {
              response.json().then(data => {
                alert('Failed to Feedback: ' + data.message);
              });
            }
          })
          .catch(error => {
            console.error('Error Feedback:', error);
          });
        }
      });