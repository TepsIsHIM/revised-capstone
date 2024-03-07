function submitInterview() {
    const fname= document.getElementById('fname').value;
    const lname= document.getElementById('lname').value;
    const email=document.getElementById('email').value;
    const progcode=document.getElementById('progcode').value;
    const department= document.getElementById('department').value;
    const concernSelect3 = document.getElementById('concernSelect3').value;
    const hoursInput3 = document.getElementById('hoursInput3').value;
    const minutesInput3 = document.getElementById('minutesInput3').value;
    const noteTextarea3 = document.getElementById('noteTextarea3').value;
    const dateInput3 = document.getElementById('dateInput3').value;

    const formData = {
        fname,
        lname,
        email,
        progcode,
        department,
        concernSelect3,
        hoursInput3,
        minutesInput3,
        noteTextarea3,
        dateInput3,
    };

    fetch('/submit-manualInterview', {
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