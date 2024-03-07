document.addEventListener('DOMContentLoaded', function () {
  
  

    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('delete-student')) {
        sEmail = event.target.getAttribute('studentEmail');
        $('#deleteStudentModal').modal('show');
      } else if (event.target.classList.contains('confirm-deleteStudent')) {
        fetch('/adminResetStudent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sEmail
          }),
        }).then(response => {
          if (response.ok) {
            alert('Account Deleted reset successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            console.error('Failed to Delete the Account');
          }
        })
        .catch(error => {
          $('#deleteStudentModal').modal('hide');
          console.error('Error deleting the account:', error);
          // Handle the error or show a message to the user
        });
  

    }
  });
  
    // DELETE MODAL
    document.getElementById('closeResetModalX1').addEventListener('click', function () {
      $('#deleteStudentModal').modal('hide');
    });
  
    document.getElementById('closeResetBtn1').addEventListener('click', function () {
      $('#deleteStudentModal').modal('hide');
    });
  
    document.getElementById('closeDeleteModalX2').addEventListener('click', function () {
      $('#deleteCounselorModal').modal('hide');
    });
  
    document.getElementById('closeDeleteBtn2').addEventListener('click', function () {
      $('#deleteCounselorModal').modal('hide');
    });
  });
  