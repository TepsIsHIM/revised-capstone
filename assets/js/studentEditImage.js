// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3ybWx46L_MB_sFEsfV2MM1lXhUqE0Yag",
  authDomain: "lasalle-image.firebaseapp.com",
  projectId: "lasalle-image",
  storageBucket: "lasalle-image.appspot.com",
  messagingSenderId: "328353446232",
  appId: "1:328353446232:web:8129911dc91946f9770d2d",
  measurementId: "G-JCSNLZVWQ2"
};

firebase.initializeApp(firebaseConfig);


let profilePic = document.getElementById("profile-image");
let updatedProfilePic = document.getElementById("updated-profile-image");
let inputFile = document.getElementById("image-upload");
let studentEmail = document.getElementById("profileEmail").value;

document.addEventListener("DOMContentLoaded", function () {
  profilePic.onclick = function () {
    inputFile.click();
  };

  inputFile.onchange = function () {
    const file = inputFile.files[0];
    const imageName = file.name;
    uploadToServer(imageName);
    uploadImageToStorage(imageName, file);
  };

  // Fetch the image URL from Firebase storage on page load
  fetchImageFromStorage();

});

function fetchImageFromStorage() {
  // Retrieve the image URL from Firebase storage
  let storageRef = firebase.storage().ref("images/" + studentEmail);
  storageRef.getDownloadURL().then((url) => {
    console.log("URL: ", url);
    // Check if the URL is not null
    if (url !== "") {
      // Display the profile image
      profilePic.setAttribute("src", url);
    }
  }).catch((error) => {
    console.error("Error getting download URL:", error);
    // If image not found or error, show default image
  });
}

function uploadToServer(imageName) {

  fetch("/insertStudentImage", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({imageUrl: imageName, sEmail: studentEmail}),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to upload image to server");
      }
    })
    .then((data) => {
      console.log(data);
      alert("Image uploaded and saved to database successfully");
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
      alert("Failed to upload image to server");
    });
}

function uploadImageToStorage(imageName, file) {
  let storageRef = firebase.storage().ref("images/" + studentEmail);
  let uploadTask = storageRef.put(file);

  uploadTask.on("state_changed", (snapshot) => {
    console.log(snapshot);
  }, (error) => {
    console.log("Error", error);
  }, () => {
    fetchImageFromStorage(); // Fetch the image URL after upload
  });
}

