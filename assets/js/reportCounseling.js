document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('click', function (event) {
        let id;
      if (event.target.classList.contains('showCounselingModal')) {
        id = event.target.getAttribute('data-id');
        $('#counselingModal').modal('show');
      }
      else if (event.target.classList.contains('showConsultationModal')) {
         id = event.target.getAttribute('data-id');
        $('#consultationModal').modal('show');
      }
      else if (event.target.classList.contains('showInterviewModal')) {
         id = event.target.getAttribute('data-id');
        $('#interviewModal').modal('show');
      }
      else if (event.target.classList.contains('showTestingModal')) {
         id = event.target.getAttribute('data-id');
        $('#testingModal').modal('show');
      }
      else if (event.target.classList.contains('showOtherModal')) {
         id = event.target.getAttribute('data-id');
        $('#othersModal').modal('show');
      }
  
    

    document.getElementById('submitCounseling').addEventListener('click', function () {
        const nameOfConcern = document.getElementById('concernSelect1').value;
        const typeOfClient = document.getElementById('clientSelect1').value;
        const typeOfSession = document.getElementById('sessionSelect1').value;
        const hours = document.getElementById('hoursInput1').value;
        const minutes = document.getElementById('minutesInput1').value;
        const notes = document.getElementById('noteTextarea1').value;
        // Send the data to the server
        fetch('/submit-counseling', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nameOfConcern,
            typeOfClient,
            typeOfSession,
            hours,
            minutes,
            notes,
            id
          }),
        })
        .then(response => {
          if (response.ok) {
            alert('Report successfully!');
    
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
      });

      document.getElementById('submitConsultation').addEventListener('click', function () {
        const category = document.getElementById('consultSelect2').value;
        const hours = document.getElementById('hoursInput2').value;
        const minutes = document.getElementById('minutesInput2').value;
        const notes = document.getElementById('noteTextarea2').value;
        // Send the data to the server
        fetch('/submit-consultation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            hours,
            minutes,
            notes,
            id
          }),
        })
        .then(response => {
          if (response.ok) {
            alert('Report successfully!');
    
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
      });
      
      document.getElementById('submitInterview').addEventListener('click', function () {
        const nameOfConcern = document.getElementById('concernSelect3').value;
        const hours = document.getElementById('hoursInput3').value;
        const minutes = document.getElementById('minutesInput3').value;
        const notes = document.getElementById('noteTextarea3').value;
        const title = document.getElementById('counselingModalLabel').value;
        // Send the data to the server
        fetch('/submit-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nameOfConcern,
            date,
            hours,
            minutes,
            notes,
            id
          }),
        })
        .then(response => {
          if (response.ok) {
            alert('Report successfully!');
    
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
      });
      
      document.getElementById('submitTesting').addEventListener('click', function () {
        const nameOfConcern = document.getElementById('concernSelect4').value;
        const categType = document.getElementById('categType4').value;
        const hours = document.getElementById('hoursInput4').value;
        const minutes = document.getElementById('minutesInput4').value;
        const notes = document.getElementById('noteTextarea4').value;
        // Send the data to the server
        fetch('/submit-testing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nameOfConcern,
            categType,
            hours,
            minutes,
            notes,
            id
          }),
        })
        .then(response => {
          if (response.ok) {
            alert('Report successfully!');
    
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
      });

      document.getElementById('submitOthers').addEventListener('click', function () {
        const nameOfConcern = document.getElementById('concernSelect5').value;
        const typeOfClient = document.getElementById('clientSelect5').value;
        const hours = document.getElementById('hoursInput5').value;
        const minutes = document.getElementById('minutesInput5').value;
        const notes = document.getElementById('noteTextarea5').value;
        // Send the data to the server
        fetch('/submit-others', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nameOfConcern,
            typeOfClient,
            hours,
            minutes,
            notes,
            id
          }),
        })
        .then(response => {
          if (response.ok) {
            alert('Report successfully!');
    
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
      });
    });
});


  
  