document.addEventListener('DOMContentLoaded', function() {
  const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');

  // Check if feedback has already been submitted (you should replace this condition with your logic)
  const feedback = true; // Replace this with your actual logic to check feedback status

  if (feedback) {
    submitFeedbackBtn.setAttribute('disabled', 'disabled');
  }

});