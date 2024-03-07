
document.addEventListener('DOMContentLoaded', function () {

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('terms-modal')) {
          $('#termsModal').modal('show');
        } 
      });
    document.getElementById('closeTermsModalX1').addEventListener('click', function () {
        $('#termsModal').modal('hide');
      });
    
      document.getElementById('closeTermsBtn1').addEventListener('click', function () {
        $('#termsModal').modal('hide');
      });
    const createAccountButton = document.getElementById('createAccountButton');
    const accountTypeSelect = document.getElementById('accountType');
    const departmentDropdown = document.getElementById('departmentDropdown');
  
    if (createAccountButton && accountTypeSelect) {
        createAccountButton.addEventListener('click', handleRegistration);
        accountTypeSelect.addEventListener('change', handleAccountTypeChange);
    }
    handleAccountTypeChange();
  
    function handleAccountTypeChange() {
        const programCodeField = document.querySelector('#programCode');
        const programCodeLabel = document.querySelector('label[for="programCode"]');
        const selectedAccountType = accountTypeSelect.value;
        if (selectedAccountType === 'Student') {
            departmentDropdown.style.display = 'block';
            programCodeLabel.style.display = 'block'; 
            programCodeField.style.display = 'block';
        } else if (selectedAccountType === 'Counselor') {
            programCodeLabel.style.display = 'none';
            programCodeField.style.display = 'none';
            departmentDropdown.style.display = 'none';
        } else {
            
            programCodeField.style.display = 'none';
        }
    }
  
    async function handleRegistration() {
        try {
            const firstName = document.querySelector('#firstName').value;
            const lastName = document.querySelector('#lastName').value;
            const birthDate = document.querySelector('#birthdayDate').value;
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            const idNumber = document.querySelector('#IDnumber').value;
            const phoneNumber = document.querySelector('#phoneNumber').value;
            const accountType = document.querySelector('#accountType').value;
            const departmentSelect = document.querySelector('#departmentSelect').value;
            const programCode = document.querySelector('#programCode').value;
  
            // Regular expressions for validation
            const nameRegex = /^[a-zA-Z\s]+$/; // Only alphabetic characters
            const phPhoneNumberRegex = /^\+639\d{9}$/; // Philippine phone number format
            const dlsudEmailRegex = /^[\w-]+@dlsud\.edu\.ph$/; // DLSUD email format
            const programCodeRegex = /^[a-zA-Z]{3}\d{2}$/;
  
            // Perform form validation
            if (
                !firstName ||
                !lastName ||
                !birthDate ||
                !email ||
                !password ||
                !idNumber ||
                (accountType !== 'Counselor' && !programCode) ||
                !phoneNumber
            ) {
                alert('Please fill out all required fields.');
                return; // Prevent form submission
            }
  
            if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
                alert('First Name and Last Name should only contain alphabetic characters.');
                return; // Prevent form submission
            }
  
            if (!phPhoneNumberRegex.test(phoneNumber)) {
                alert('Please enter a valid Philippine phone number (+639xxxxxxxxx).');
                return; // Prevent form submission
            }
  
            if (!dlsudEmailRegex.test(email)) {
                alert('Please enter a valid DLSUD email address (e.g., user@dlsud.edu.ph).');
                return; // Prevent form submission
            }
  
            if (accountType === 'Student' && !/^\d{9}$/.test(idNumber)) {
                alert('Please enter a valid ID number for students.');
                return; // Prevent form submission
            } else if (accountType === 'Counselor' && !/^F-\d+$/.test(idNumber)) {
                alert('Please enter a valid ID number for counselors.');
                return; // Prevent form submission
            }
  
            // Perform programCode validation
            if (accountType !== 'Counselor' && !programCodeRegex.test(programCode)) {
                alert('Please enter a valid program code (e.g., BIT12).');
                return; // Prevent form submission
            }
          createAccountButton.disabled = true;
  
            // Create a user object with form data
            const user = {
                firstName,
                lastName,
                birthDate,
                gender,
                email,
                password,
                idNumber,
                phoneNumber,
                accountType,
                departmentSelect,
                programCode
            };
  
            // Send the user data to the server
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
  
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
  
            const data = await response.json();
  
            if (data.success) {
                const successMessage = document.querySelector('#successMessage');
                successMessage.style.display = 'block';
                const form = document.querySelector('#insertForm');
                form.style.display = 'none';
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
  
            console.error('Error:', error);
            alert('Registration failed. Please try again.');
        }
      finally {
        // Enable the button after the registration logic, regardless of success or failure
        createAccountButton.disabled = false;
    }
  }
    });