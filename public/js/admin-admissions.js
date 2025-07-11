document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const statusFilter = document.getElementById('filter-status');
    const sortBy = document.getElementById('sort-by');
    const admissionsContainer = document.getElementById('admissions-container');

    let searchTimeout;

    const fetchAdmissions = async () => {
        const searchValue = searchInput.value;
        const statusValue = statusFilter.value;
        const sortValue = sortBy.value;

        const response = await fetch(`/admin/api/admissions?search=${searchValue}&status=${statusValue}&sort=${sortValue}`);
        const admissions = await response.json();
        renderAdmissions(admissions);
    };

    const renderAdmissions = (admissions) => {
        admissionsContainer.innerHTML = '';
        if (admissions.length === 0) {
            admissionsContainer.innerHTML = '<p>No admissions found.</p>';
            return;
        }

        admissions.forEach(admission => {
            const admissionCard = `
                <div class="admission-card admin-card">
                    <div class="card-header">
                        <div class="student-info">
                            <h3 class="card-title">${admission.firstName} ${admission.lastName}</h3>
                            <p>Grade: ${admission.gradeApplying}</p>
                        </div>
                        <span class="status status-${admission.status.toLowerCase().replace('_', '-')}">
                            ${admission.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Parent Name</strong>
                                <span>${admission.parentName}</span>
                            </div>
                            <div class="info-item">
                                <strong>Parent Email</strong>
                                <span><a href="mailto:${admission.parentEmail}">${admission.parentEmail}</a></span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <span class="application-date">
                            Applied on: ${new Date(admission.applicationDate).toLocaleDateString()}
                        </span>
                        <div class="status-update-container">
                            <select class="status-select" data-id="${admission._id}">
                                <option value="Submitted" ${admission.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                                <option value="Under Review" ${admission.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                                <option value="Accepted" ${admission.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                                <option value="Rejected" ${admission.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                            <button class="btn btn-secondary btn-sm update-status-btn" data-id="${admission._id}">Update</button>
                        </div>
                        <a href="/admin/admissions/${admission._id}" class="btn btn-primary btn-sm">View Details</a>
                        <i class="fas fa-trash-alt delete-icon" data-id="${admission._id}"></i>
                    </div>
                </div>
            `;
            admissionsContainer.innerHTML += admissionCard;
        });
    };

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(fetchAdmissions, 300);
    });

    statusFilter.addEventListener('change', fetchAdmissions);
    sortBy.addEventListener('change', fetchAdmissions);

    admissionsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('update-status-btn')) {
            const id = e.target.dataset.id;
            const select = document.querySelector(`.status-select[data-id="${id}"]`);
            const status = select.value;

            try {
                const response = await fetch(`/admin/admissions/${id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });

                if (response.ok) {
                    fetchAdmissions();
                } else {
                    console.error('Failed to update status');
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }

        let deleteAdmissionId = null;
        const deleteModal = document.getElementById('delete-modal');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

        if (e.target.classList.contains('delete-icon')) {
            deleteAdmissionId = e.target.dataset.id;
            deleteModal.style.display = 'flex';
        }

        confirmDeleteBtn.addEventListener('click', async () => {
            if (!deleteAdmissionId) return;
            try {
                const response = await fetch(`/admin/admissions/${deleteAdmissionId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchAdmissions();
                } else {
                    console.error('Failed to delete admission');
                }
            } catch (error) {
                console.error('Error deleting admission:', error);
            }
            deleteModal.style.display = 'none';
            deleteAdmissionId = null;
        });

        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            deleteAdmissionId = null;
        });
    });

    // SIDEBAR TOGGLE FOR MOBILE
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('adminSidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open');
        }
    };

    // Auto-refresh admissions every 30 seconds
    setInterval(fetchAdmissions, 30000);

    fetchAdmissions();
});
