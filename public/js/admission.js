document.getElementById('admissionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateForm()) {
        const submitBtn = this.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        submitBtn.classList.add('loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        fetch('/submit-admission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                document.querySelector('.form-container form').style.display = 'none';
                document.getElementById('application-success').style.display = 'block';
            } else {
                alert('An error occurred: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        })
        .finally(() => {
            submitBtn.classList.remove('loading');
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        });
    }
});

function validateForm() {
    let isValid = true;
    const form = document.getElementById('admissionForm');
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'gradeApplying', 'parentName', 'relationship', 'parentEmail', 'parentPhone', 'address'];

    requiredFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const formGroup = input.closest('.form-group');
        if (input.value.trim() === '') {
            isValid = false;
            formGroup.classList.add('error');
            formGroup.querySelector('.error-message').innerText = 'This field is required.';
        } else {
            formGroup.classList.remove('error');
        }
    });

    const emailField = document.getElementById('parentEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
        isValid = false;
        const formGroup = emailField.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.querySelector('.error-message').innerText = 'Please enter a valid email address.';
    }

    const phoneField = document.getElementById('parentPhone');
    const phoneRegex = /^\+?[0-9\s-()]{10,20}$/;
    if (!phoneRegex.test(phoneField.value)) {
        isValid = false;
        const formGroup = phoneField.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.querySelector('.error-message').innerText = 'Please enter a valid phone number.';
    }

    return isValid;
}

function resetApplicationForm() {
    document.getElementById('admissionForm').reset();
    document.querySelector('.form-container form').style.display = 'block';
    document.getElementById('application-success').style.display = 'none';
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.classList.remove('loading');
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.style.display = 'none');
    const errorFields = document.querySelectorAll('.form-group.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

function animateOnScroll() {
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('aos-animate');
        }
    });
}
window.addEventListener('scroll', animateOnScroll);
document.addEventListener('DOMContentLoaded', animateOnScroll);
