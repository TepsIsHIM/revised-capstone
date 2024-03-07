document.getElementById('generateButton').addEventListener('click', async (event) => {
    event.preventDefault();
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    if (!fromDate || !toDate) {
        // Display an alert or update a message to inform the user
        alert('Please select both "From" and "To" dates.');
        return;
    }

    try {
        const response = await fetch('/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fromDate, toDate }),
        });

        // Handle the response as needed
        const data = await response.json();
        console.log(data);

        // Update the content with the generated statistics
        updateYearLevelCounts(data.appointmentStatistics);
        updateReportStatistics(data.reportStatistics);
        updateTotalCounts(data.reportStatistics);
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});

function updateYearLevelCounts(statistics) {
    // Update the content with the generated statistics
    document.getElementById('firstYearCount').innerText = statistics['1st Year'];
    document.getElementById('secondYearCount').innerText = statistics['2nd Year'];
    document.getElementById('thirdYearCount').innerText = statistics['3rd Year'];
    document.getElementById('fourthYearCount').innerText = statistics['4th Year'];

    // Calculate and update the total count
    const totalCount = Object.values(statistics).reduce((acc, count) => acc + count, 0);
    document.getElementById('totalCount').innerText = totalCount;
}

function updateReportStatistics(reportStatistics) {
    // Update report statistics
    updateServiceCount('COUNSELING', reportStatistics['COUNSELING']);
    updateServiceCount('CONSULTATION', reportStatistics['CONSULTATION']);
    updateServiceCount('INTERVIEW', reportStatistics['INTERVIEW']);
    updateServiceCount('TESTING', reportStatistics['TESTING']);
    updateServiceCount('OTHERS', reportStatistics['OTHERS']);
}

function updateServiceCount(service, counts) {
    document.getElementById(`${service.toLowerCase()}1`).innerText = counts['1st Year'];
    document.getElementById(`${service.toLowerCase()}2`).innerText = counts['2nd Year'];
    document.getElementById(`${service.toLowerCase()}3`).innerText = counts['3rd Year'];
    document.getElementById(`${service.toLowerCase()}4`).innerText = counts['4th Year'];
}

function updateTotalCounts(reportStatistics) {
    // Update total counts for each service
    updateTotalCount('COUNSELING', reportStatistics);
    updateTotalCount('CONSULTATION', reportStatistics);
    updateTotalCount('INTERVIEW', reportStatistics);
    updateTotalCount('TESTING', reportStatistics);
    updateTotalCount('OTHERS', reportStatistics);
}

function updateTotalCount(service, reportStatistics) {
    const totalCount = Object.values(reportStatistics[service]).reduce((acc, count) => acc + count, 0);
    document.getElementById(`${service.toLowerCase()}Total`).innerText = totalCount;
}
