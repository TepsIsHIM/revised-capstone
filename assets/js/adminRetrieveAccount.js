document.addEventListener('DOMContentLoaded', function () {
  
  

    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('retrieve-student')) {
        sEmail = event.target.getAttribute('studentEmail');
        $('#retrieveStudentModal').modal('show');
      } else if (event.target.classList.contains('confirm-retrieveStudent')) {
        fetch('/adminRetrieveStudent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sEmail
          }),
        }).then(response => {
          if (response.ok) {
            alert('Account retrieved successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            console.error('Failed to retrieve the account');
          }
        })
        .catch(error => {
          $('#retrieveStudentModal').modal('hide');
          console.error('Error retrieving the account:', error);
          // Handle the error or show a message to the user
        });
      }
  
  
        if (event.target.classList.contains('retrieve-counselor')) {
          cEmail = event.target.getAttribute('counselorEmail');
          $('#retrieveCounselorModal').modal('show');
        } else if (event.target.classList.contains('confirm-retrieveCounselor')) {
          fetch('/adminRetrieveCounselor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cEmail
            }),
          }).then(response => {
            if (response.ok) {
              alert('Account retrieved successfully!');
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              $('#retrieveCounselorModal').modal('hide');
              console.error('Failed to retrieve the Account');
            }
          })
          .catch(error => {
            $('#retrieveCounselorModal').modal('hide');
            console.error('Error retrieving the account:', error);
            // Handle the error or show a message to the user
          });
      }
  });
  
    // DELETE MODAL
    document.getElementById('closeRetrieveModalX1').addEventListener('click', function () {
      $('#retrieveStudentModal').modal('hide');
    });
  
    document.getElementById('closeRetrieveBtn1').addEventListener('click', function () {
      $('#retrieveStudentModal').modal('hide');
    });
  
    document.getElementById('closeRetrieveModalX2').addEventListener('click', function () {
      $('#retrieveCounselorModal').modal('hide');
    });
  
    document.getElementById('closeRetrieveBtn2').addEventListener('click', function () {
      $('#retrieveCounselorModal').modal('hide');
    });
  });
  