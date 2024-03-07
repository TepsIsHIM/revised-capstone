function submitOthers() {
    const fname= document.getElementById('fname').value;
    const lname= document.getElementById('lname').value;
    const email=document.getElementById('email').value;
    const progcode=document.getElementById('progcode').value;
    const department= document.getElementById('department').value;
    const concernSelect5 = document.getElementById('concernSelect5').value;
    const clientSelect5 = document.getElementById('clientSelect5').value;
    const hoursInput5 = document.getElementById('hoursInput5').value;
    const minutesInput5 = document.getElementById('minutesInput5').value;
    const noteTextarea5 = document.getElementById('noteTextarea5').value;
    const dateInput5 = document.getElementById('dateInput5').value;
    // Create an object with the form data
    const formData = {
        fname,
        lname,
        email,
        progcode,
        department,
        concernSelect5,
        clientSelect5,
        hoursInput5,
        minutesInput5,
        noteTextarea5,
        dateInput5,
    };

    fetch('/submit-manualOthers', {
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