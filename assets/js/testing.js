function submitTesting() {
    const fname= document.getElementById('fname').value;
    const lname= document.getElementById('lname').value;
    const email=document.getElementById('email').value;
    const progcode=document.getElementById('progcode').value;
    const department= document.getElementById('department').value;
    const categType4 = document.getElementById('categType4').value;
    const concernSelect4 = document.getElementById('concernSelect4').value;
    const hoursInput4 = document.getElementById('hoursInput4').value;
    const minutesInput4 = document.getElementById('minutesInput4').value;
    const noteTextarea4 = document.getElementById('noteTextarea4').value;
    const dateInput4 = document.getElementById('dateInput4').value;
    // Create an object with the form data
    const formData = {
        fname,
        lname,
        email,
        progcode,
        department,
        categType4,
        concernSelect4,
        hoursInput4,
        minutesInput4,
        noteTextarea4,
        dateInput4,
    };

    fetch('/submit-manualTesting', {
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