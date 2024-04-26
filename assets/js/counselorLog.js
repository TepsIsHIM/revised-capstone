document.addEventListener('DOMContentLoaded', function () {
  const viewReportButtons = document.querySelectorAll('.view-report-btn');

  viewReportButtons.forEach(button => {
      button.addEventListener('click', function () {
          const timeEncoded = this.getAttribute('data-time-encoded');
          // Call a function to handle the click event and pass the timeEncoded value
          viewReport(timeEncoded);
      });
  });

  function filterTable(column, value) {
      var rows = document.getElementById("TableID").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      for (var i = 0; i < rows.length; i++) {
          var currentRow = rows[i].getElementsByTagName("td")[column];
          if (currentRow) {
              var textValue = currentRow.textContent || currentRow.innerText;
              if (textValue.indexOf(value) > -1) {
                  rows[i].style.display = "";
              } else {
                  rows[i].style.display = "none";
              }
          }
      }
  }

  function viewReport(timeEncoded) {
    // Redirect to the CounselorViewReport.ejs page with the timeEncoded parameter
    window.location.href = `/CounselorViewReport?timeEncoded=${encodeURIComponent(timeEncoded)}`;
  }
});