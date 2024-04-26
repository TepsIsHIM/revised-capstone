function submitCounseling() {
    const fname= document.getElementById('fname').value;
    const lname= document.getElementById('lname').value;
    const email=document.getElementById('email').value;
    const progcode=document.getElementById('progcode').value;
    const department= document.getElementById('department').value;
    const concernSelect1 = document.getElementById('concernSelect1').value;
    const clientSelect1 = document.getElementById('clientSelect1').value;
    const sessionSelect1 = document.getElementById('sessionSelect1').value;
    const hoursInput1 = document.getElementById('hoursInput1').value;
    const minutesInput1 = document.getElementById('minutesInput1').value;
    const noteTextarea1 = document.getElementById('noteTextarea1').value;
    const dateInput1 = document.getElementById('dateInput1').value;

    const formData = {
        fname,
        lname,
        email,
        progcode,
        department,
        concernSelect1,
        sessionSelect1,
        clientSelect1,
        minutesInput1,
        hoursInput1,
        noteTextarea1,
        dateInput1
    };

    fetch('/submit-manualCounseling', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) // Send form data as JSON
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