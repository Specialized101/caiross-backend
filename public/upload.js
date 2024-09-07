document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    console.log('Form submitted'); // For debugging

    const password = document.getElementById('password').value;
    const file = document.getElementById('jsonFile').files[0];

    if (!file) {
        document.getElementById('message').textContent = 'Please select a JSON file.';
        return;
    }

    // Create a FormData object to send the file and password
    const formData = new FormData();
    formData.append('password', password); // Include password
    formData.append('file', file); // Include the JSON file

    try {
        // Send the FormData using fetch
        const response = await fetch('https://caiross-backend.onrender.com/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        document.getElementById('message').textContent = 'File uploaded successfully: ' + result.message;

    } catch (error) {
        document.getElementById('message').textContent = 'Error uploading file: ' + error.message;
    }
});