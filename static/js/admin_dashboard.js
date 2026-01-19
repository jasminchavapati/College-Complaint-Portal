const backendUrl = 'http://127.0.0.1:5000/api/complaints';

document.addEventListener('DOMContentLoaded', () => {
    // Fetch all complaints on page load
    fetchComplaints('All');
});

// Fetches complaints from the backend and filters them by role
async function fetchComplaints(role) {
    const tableBody = document.getElementById('complaintsTable').querySelector('tbody');
    const heading = document.getElementById('complaints-heading');

    try {
        const response = await fetch(backendUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }
        const complaints = await response.json();
        
        // Filter complaints based on the selected role
        let filteredComplaints = [];
        if (role === 'All') {
            filteredComplaints = complaints;
        } else {
            filteredComplaints = complaints.filter(c => c.role === role);
        }

        heading.textContent = `${role} Complaints`;
        tableBody.innerHTML = '';
        
        // Populate the table with the filtered complaints
        filteredComplaints.forEach(complaint => {
            const row = document.createElement('tr');
            
            // Check if the complaint is already resolved to disable the button
            const isInProgressDisabled = complaint.status === 'Resolved' ? 'disabled' : '';
            
            row.innerHTML = `
                <td>${complaint.short_id}</td>
                <td>${complaint.role}</td>
                <td>${complaint.category}</td>
                <td>${complaint.title}</td>
                <td>${complaint.status}</td>
                <td>${complaint.user_email}</td>
                <td>
                    <button class="status-btn in-progress" onclick="updateStatus('${complaint.id}', 'In Progress', '${role}')" ${isInProgressDisabled}>In Progress</button>
                    <button class="status-btn resolved" onclick="updateStatus('${complaint.id}', 'Resolved', '${role}')">Resolved</button>
                </td>
            `;
            row.style.cursor = 'pointer';
            row.onclick = () => showComplaintDetails(complaint.id);
            tableBody.appendChild(row);
        });

        if (filteredComplaints.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `<td colspan="7">No complaints found for this category.</td>`;
            tableBody.appendChild(noDataRow);
        }

    } catch (error) {
        console.error('Error fetching complaints:', error);
        heading.textContent = 'Error loading complaints.';
    }
}

// Shows a detailed view of a single complaint
async function showComplaintDetails(complaintId) {
    try {
        const response = await fetch(backendUrl);
        const complaints = await response.json();
        const complaint = complaints.find(c => c.id === complaintId);

        if (!complaint) {
            alert('Complaint details not found.');
            return;
        }

        document.getElementById('main-dashboard-view').style.display = 'none';
        document.getElementById('complaint-details-view').style.display = 'block';

        document.getElementById('details-title').textContent = complaint.title;
        document.getElementById('details-id').textContent = complaint.short_id;
        document.getElementById('details-user-email').textContent = complaint.user_email;
        document.getElementById('details-role').textContent = complaint.role;
        document.getElementById('details-category').textContent = complaint.category;
        document.getElementById('details-status').textContent = complaint.status;
        document.getElementById('details-description').textContent = complaint.description;

    } catch (error) {
        console.error('Error showing details:', error);
        alert('An error occurred while fetching complaint details.');
    }
}

// Updates the status of a complaint via the backend API
async function updateStatus(complaintId, newStatus, currentRole) {
    try {
        const response = await fetch(`${backendUrl}/${complaintId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || 'Failed to update status.');
        }

        alert(`Complaint ${complaintId} status updated to ${newStatus}.`);
        fetchComplaints(currentRole); // Refresh the table
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status.');
    }
}

// Hides the details view and shows the main dashboard table
function goBackToList() {
    document.getElementById('main-dashboard-view').style.display = 'block';
    document.getElementById('complaint-details-view').style.display = 'none';
}
