// Base URL for the backend API
const backendUrl = 'http://127.0.0.1:5000/api/complaints';

// Custom alert/message box to replace the default alert()
function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');
    messageBox.textContent = message;
    if (type) {
        messageBox.classList.add(type);
    }
    document.body.appendChild(messageBox);
    setTimeout(() => {
        messageBox.remove();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Get user role and email from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');
    const userEmail = urlParams.get('email');
    const formHeading = document.getElementById('form-heading');
    
    // Update heading based on the user's role
    if (userRole) {
        formHeading.textContent = `${userRole} Complaint Form`;
    } else {
        formHeading.textContent = 'Complaint Form';
    }

    // --- COMPLAINT SUBMISSION LOGIC ---

    // Define complaint categories based on user roles
    const complaintCategories = {
        'Student': ['Academic Problems', 'Hostel Issues', 'Transport Issues', 'Faculty Behaviour', 'Other'],
        'Faculty': ['Department/Academic Support', 'Administrative Issues', 'Workload/Resources', 'Other'],
        'Non-Teaching Staff': ['Workplace Issues', 'Salary/Payroll/Leave', 'Facilities/Infrastructure', 'Management Behaviour', 'Other'],
        'Security Guard': ['Duty Allocation/Staff Issues', 'Facilities (Hostel/Campus)', 'Safety Concerns', 'Management Behaviour', 'Other']
    };

    const categorySelect = document.getElementById('category');
    const categories = complaintCategories[userRole] || [];

    // Populate the dropdown with the correct categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Handle complaint form submission
    document.getElementById('complaintForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        // Gather form data
        const complaintData = {
            email: userEmail,
            role: userRole,
            category: categorySelect.value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            privacy: 'public' // Added a default privacy field for submission
        };

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(complaintData)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(`Complaint submitted successfully! Your ID is: ${result.complaintId}`, 'success');
                document.getElementById('complaintForm').reset();
                if(userRole === 'Admin') {
                    window.location.href = 'admin_dashboard.html';
                }
            } else {
                showMessage(`Failed to submit complaint. ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        }
    });

    // --- COMPLAINT TRACKING LOGIC ---

    const complaintStatusDiv = document.getElementById('complaintStatus');

    // Handle complaint tracking form submission
    document.getElementById('trackingForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const complaintId = document.getElementById('complaintIdInput').value.trim();

        if (!complaintId) {
            complaintStatusDiv.innerHTML = '<p>Please enter a Complaint ID.</p>';
            return;
        }

        complaintStatusDiv.innerHTML = '<p>Tracking your complaint...</p>';

        try {
            const response = await fetch(backendUrl);
            const complaints = await response.json();

            // Find the complaint in the fetched data
            const complaint = complaints.find(c => String(c.short_id) === complaintId);

            if (complaint) {
                complaintStatusDiv.innerHTML = `<h3>Complaint ID: ${complaint.short_id}</h3><p>Status: <strong>${complaint.status}</strong></p>`;
            } else {
                complaintStatusDiv.innerHTML = '<p>Complaint not found.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            complaintStatusDiv.innerHTML = '<p>An error occurred while tracking. Please try again.</p>';
        }
    });
});
