document.addEventListener('DOMContentLoaded', function () {
  
  

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-student')) {
      sEmail = event.target.getAttribute('studentEmail');
      $('#deleteStudentModal').modal('show');
    } else if (event.target.classList.contains('confirm-deleteStudent')) {
      fetch('/adminArchiveStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sEmail
        }),
      }).then(response => {
        if (response.ok) {
          alert('Account arhived successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error('Failed to archive the account');
        }
      })
      .catch(error => {
        $('#deleteStudentModal').modal('hide');
        console.error('Error deleting the account:', error);
        // Handle the error or show a message to the user
      });
    }


      if (event.target.classList.contains('delete-counselor')) {
        cEmail = event.target.getAttribute('counselorEmail');
        $('#deleteCounselorModal').modal('show');
      } else if (event.target.classList.contains('confirm-deleteCounselor')) {
        fetch('/adminArchiveCounselor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cEmail
          }),
        }).then(response => {
          if (response.ok) {
            alert('Account archived successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            $('#deleteCounselorModal').modal('hide');
            console.error('Failed to archive the Account');
          }
        })
        .catch(error => {
          $('#deleteCounselorModal').modal('hide');
          console.error('Error archive the account:', error);
          // Handle the error or show a message to the user
        });
    }
});

  // DELETE MODAL
  document.getElementById('closeDeleteModalX1').addEventListener('click', function () {
    $('#deleteStudentModal').modal('hide');
  });

  document.getElementById('closeDeleteBtn1').addEventListener('click', function () {
    $('#deleteStudentModal').modal('hide');
  });

  document.getElementById('closeDeleteModalX2').addEventListener('click', function () {
    $('#deleteCounselorModal').modal('hide');
  });

  document.getElementById('closeDeleteBtn2').addEventListener('click', function () {
    $('#deleteCounselorModal').modal('hide');
  });
});
