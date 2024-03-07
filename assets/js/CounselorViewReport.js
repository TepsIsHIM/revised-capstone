// Get the timeEncoded parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const timeEncoded = urlParams.get('timeEncoded');

// Now you can use the timeEncoded variable in your page logic
console.log("Time Encoded: " + timeEncoded);


document.addEventListener('DOMContentLoaded', function () {
    // Select the print button
    const printBtn = document.getElementById('printBtn');

    // Function to print the report content only
    const printReport = () => {
      // Clone the report section content
      const contentToPrint = document.querySelector('.report-section').cloneNode(true);

      // Create a new window and append the content to it
      const printWindow = window.open('', '_blank');
      printWindow.document.body.appendChild(contentToPrint);

      // Trigger the print dialog for the new window
      printWindow.print();
    };

    // Attach click event listener to the print button
    printBtn.addEventListener('click', printReport);
  });