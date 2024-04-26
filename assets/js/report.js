$(document).ready(function () {
  
    hideAllSections();

 
    $("#serviceSelect3").change(function () {
      hideAllSections(); 

    
      var selectedCategory = $(this).val();
      if (selectedCategory === "CONSULTATION") {
        showConsultationSection();
      } else if (selectedCategory === "COUNSELING") {
        showCounselingSection();
      } else if (selectedCategory === "INTERVIEW") {
        showInterviewSection();
      } else if (selectedCategory === "TESTING") {
        showTestingSection();
      } else if (selectedCategory === "OTHERS") {
        showOthersSection();
      }
    });

    function hideAllSections() {
      $(".consultation-section, .counseling-section, .interview-section, .testing-section, .others-section").hide();
    }

    function showConsultationSection() {
      $(".consultation-section").show();
    }

    function showCounselingSection() {
      $(".counseling-section").show();
    }

    function showInterviewSection() {
      $(".interview-section").show();
    }

    function showTestingSection() {
      $(".testing-section").show();
    }

    function showOthersSection() {
      $(".others-section").show();
    }
  });

  function clearCounselingFields() {
    document.getElementById('fname').value;
    document.getElementById('lname').value;
    document.getElementById('email').value;
    document.getElementById('progcode').value;
    document.getElementById('department').value;
    document.getElementById("dateInput1").value = "";
    document.getElementById("hoursInput1").value = "";
    document.getElementById("minutesInput1").value = "";
    document.getElementById("noteTextarea1").value = "";
  }

  function clearConsultationFields() {
    document.getElementById('fname').value;
    document.getElementById('lname').value;
    document.getElementById('email').value;
    document.getElementById('progcode').value;
    document.getElementById('department').value;
    document.getElementById("consultSelect2").value = "";
    document.getElementById("dateInput2").value = "";
    document.getElementById("hoursInput2").value = "";
    document.getElementById("minutesInput2").value = "";
    document.getElementById("noteTextarea2").value = "";
  }
  
  function clearInterviewFields() {
    document.getElementById('fname').value;
    document.getElementById('lname').value;
    document.getElementById('email').value;
    document.getElementById('progcode').value;
    document.getElementById('department').value;
    document.getElementById("concernSelect3").value = "";
    document.getElementById("dateInput3").value = "";
    document.getElementById("hoursInput3").value = "";
    document.getElementById("minutesInput3").value = "";
    document.getElementById("noteTextarea3").value = "";
  }
  
  function clearTestingFields() {
    document.getElementById('fname').value;
    document.getElementById('lname').value;
    document.getElementById('email').value;
    document.getElementById('progcode').value;
    document.getElementById('department').value;
    document.getElementById("concernSelect4").value = "";
    document.getElementById("dateInput4").value = "";
    document.getElementById("hoursInput4").value = "";
    document.getElementById("minutesInput4").value = "";
    document.getElementById("noteTextarea4").value = "";
  }
  
  function clearOthersFields() {
    document.getElementById('fname').value;
    document.getElementById('lname').value;
    document.getElementById('email').value;
    document.getElementById('progcode').value;
    document.getElementById('department').value;
    document.getElementById("dateInput5").value = "";
    document.getElementById("hoursInput5").value = "";
    document.getElementById("minutesInput5").value = "";
    document.getElementById("noteTextarea5").value = "";
  }
//SUGGESTION
async function suggestEmails() {
  const input = document.getElementById('email').value;

  // Fetch email suggestions from the server endpoint
  const response = await fetch(`/emailSuggestions?input=${input}`);
  const data = await response.json();

  const suggestionList = document.getElementById('emailSuggestions');
  suggestionList.innerHTML = ''; // Clear previous suggestions

  if (data.suggestions) {
      const filteredSuggestions = data.suggestions.filter(emailData => emailData.email.toLowerCase().startsWith(input.toLowerCase()));

      filteredSuggestions.forEach(emailData => {
          const suggestion = document.createElement('div');
          suggestion.textContent = emailData.email; // Display email in the suggestion list
          suggestion.classList.add('suggestion-item'); // Add a class to the suggestion
          suggestion.addEventListener('click', () => {
              fillFormFields(emailData);
              suggestionList.innerHTML = ''; // Clear the suggestion list after selecting
          });
          suggestionList.appendChild(suggestion);
      });
  }
}

function fillFormFields(selectedData) {
  // Fill form fields with the selected data
  document.getElementById('email').value = selectedData.email;
  document.getElementById('fname').value = selectedData.first_name;
  document.getElementById('lname').value = selectedData.last_name;
  document.getElementById('department').value = selectedData.department;
  // ... and so on for other fields
}