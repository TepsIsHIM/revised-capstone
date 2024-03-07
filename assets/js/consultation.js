function submitConsultation() {
    const fname= document.getElementById('fname').value;
    const lname= document.getElementById('lname').value;
    const email=document.getElementById('email').value;
    const progcode=document.getElementById('progcode').value;
    const department= document.getElementById('department').value;
    const consultSelect2 = document.getElementById('consultSelect2').value;
    const hoursInput2 = document.getElementById('hoursInput2').value;
    const minutesInput2 = document.getElementById('minutesInput2').value;
    const noteTextarea2 = document.getElementById('noteTextarea2').value;
    const dateInput2 = document.getElementById('dateInput2').value;

 
    const formData = {
        fname,
        lname,
        email,
        progcode,
        department,
        consultSelect2,
        hoursInput2,
        minutesInput2,
        noteTextarea2,
        dateInput2,
    };

    fetch('/submit-manualConsultation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) 
    })
    .then((response) => response.json())
    .then((data) => {
        // Handle the response from the server
        if (data.message === 'Encoded successfully') {
            // Display a success message or redirect to a confirmation page
            alert('Report Submitted Successfully');
            console.log('Encode created successfully');
        } else {
            // Handle errors or display an error message
            alert('Report Creation Failed');
            console.error('Encode creation failed');
        }
    })
    .catch((error) => {
        // Handle any errors that occur during the fetch
        console.error('Error:', error);
    });
}