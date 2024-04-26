document.addEventListener('DOMContentLoaded', function () {
  
  

    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('edit-student')) {
        // Get the email attribute from the clicked button
        sEmail = event.target.getAttribute('studentEmail');
        // Fetch the student data based on the email
        fetch(`/getStudentData/${sEmail}`)
          .then(response => response.json())
          .then(studentData => {
            // Populate the modal input fields with student data
            document.getElementById('idNumber').value = studentData.id_number;
            document.getElementById('programCode').value = studentData.progCode;
            document.getElementById('lastName').value = studentData.last_name;
            document.getElementById('firstName').value = studentData.first_name;
            const genderRadio = document.querySelector(`input[name="gender"][value="${studentData.gender}"]`);
            if (genderRadio) {
              genderRadio.checked = true;
            }
          
            // Set the selected value for the department dropdown
            const departmentSelect = document.getElementById('department');
            if (departmentSelect) {
              departmentSelect.value = studentData.department;
            }
            
            // Show the modal
            $('#editStudentModal').modal('show');
          })
          .catch(error => {
            console.error('Error fetching student data:', error.message);
          });
      } else if (event.target.classList.contains('confirm-editStudent')) {
        const idNumber = document.getElementById('idNumber').value;
        const programCode = document.getElementById('programCode').value; 
        const lastName = document.getElementById('lastName').value;
        const firstName = document.getElementById('firstName').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const departmentSelect = document.getElementById('department').value;
        const programCodeRegex = /^[a-zA-Z]{3}\d{2}$/;
        const nameRegex = /^[a-zA-Z\s]+$/; // Only alphabetic characters
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
          alert('First Name and Last Name should only contain alphabetic characters.');
          $('#editStudentModal').modal('hide');
          return; // Prevent form submission
      }
        if (!/^\d{9}$/.test(idNumber)) {
          alert('Please enter a valid ID number for students.');
          $('#editStudentModal').modal('hide');
          return; // Prevent form submission
      }

      if (
        !firstName ||
        !lastName ||
        !idNumber 
    ) {
        alert('Please fill out all required fields.');
        $('#editStudentModal').modal('hide');
        return; // Prevent form submission
    }

        // Perform programCode validation
        if (!programCodeRegex.test(programCode)) {
          alert('Please enter a valid program code (e.g., BIT12).');
          $('#editStudentModal').modal('hide');
          return; // Prevent form submission
      }
        fetch('/adminEditStudent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sEmail,idNumber, programCode, lastName, firstName, gender, departmentSelect
          }),
        }).then(response => {
          if (response.ok) {
            alert('Account Edit successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            console.error('Failed to Edit the Account');
          }
        })
        .catch(error => {
          $('#editStudentModal').modal('hide');
          console.error('Error editing the account:', error);
          // Handle the error or show a message to the user
        });
  
  
  
        if (event.target.classList.contains('delete-counselor')) {
          cEmail = event.target.getAttribute('counselorEmail');
          $('#deleteCounselorModal').modal('show');
        } else if (event.target.classList.contains('confirm-deleteCounselor')) {
          fetch('/adminDeleteCounselor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cEmail
            }),
          }).then(response => {
            if (response.ok) {
              alert('Account Deleted successfully!');
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              console.error('Failed to Delete the Account');
            }
          })
          .catch(error => {
            $('#deleteCounselorModal').modal('hide');
            console.error('Error deleting the account:', error);
            // Handle the error or show a message to the user
          });
      }
    }
    if (event.target.classList.contains('edit-counselor')) {
      // Get the email attribute from the clicked button
      cEmail = event.target.getAttribute('counselorEmail');
      // Fetch the student data based on the email
      fetch(`/getCounselorData/${cEmail}`)
        .then(response => response.json())
        .then(counselorData => {
          // Populate the modal input fields with student data
          document.getElementById('idNumber2').value = counselorData.id_number;
          document.getElementById('lastName2').value = counselorData.last_name;
          document.getElementById('firstName2').value = counselorData.first_name;
          const genderRadio = document.querySelector(`input[name="gender2"][value="${counselorData.gender}"]`);
          if (genderRadio) {
            genderRadio.checked = true;
          }
          
          // Show the modal
          $('#editCounselorModal').modal('show');
        })
        .catch(error => {
          console.error('Error fetching counselor data:', error.message);
        });
    } else if (event.target.classList.contains('confirm-editCounselor')) {
      const idNumber = document.getElementById('idNumber2').value;
      const lastName = document.getElementById('lastName2').value;
      const firstName = document.getElementById('firstName2').value;
      const gender = document.querySelector('input[name="gender2"]:checked').value;
      const nameRegex = /^[a-zA-Z\s]+$/; // Only alphabetic characters
      if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        alert('First Name and Last Name should only contain alphabetic characters.');
        $('#editCounselorModal').modal('hide');
        return; // Prevent form submission
    }
    if (!/^F-\d+$/.test(idNumber)) {
      alert('Please enter a valid ID number for counselors.');
      $('#editCounselorModal').modal('hide');
      return; // Prevent form submission
  }

    if (
      !firstName ||
      !lastName ||
      !idNumber 
  ) {
      alert('Please fill out all required fields.');
      $('#editCounselorModal').modal('hide');
      return; // Prevent form submission
  }

      // Perform programCode validation
      if (!programCodeRegex.test(programCode)) {
        alert('Please enter a valid program code (e.g., BIT12).');
        $('#editCounselorModal').modal('hide');
        return; // Prevent form submission
    }
      fetch('/adminEditCounselor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cEmail,idNumber, lastName, firstName, gender
        }),
      }).then(response => {
        if (response.ok) {
          alert('Account Edit successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error('Failed to Edit the Account');
        }
      })
      .catch(error => {
        $('#editCounselorModal').modal('hide');
        console.error('Error editing the account:', error);
        // Handle the error or show a message to the user
      });

  }
  });
  
    // DELETE MODAL
    document.getElementById('closeEditModalX1').addEventListener('click', function () {
      $('#editStudentModal').modal('hide');
    });
  
    document.getElementById('closeEditBtn1').addEventListener('click', function () {
      $('#editStudentModal').modal('hide');
    });
  
    document.getElementById('closeEditModalX2').addEventListener('click', function () {
      $('#editCounselorModal').modal('hide');
    });
  
    document.getElementById('closeEditBtn2').addEventListener('click', function () {
      $('#editCounselorModal').modal('hide');
    });
  });
  