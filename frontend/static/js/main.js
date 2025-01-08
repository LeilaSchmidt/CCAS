let map;
let markers = [];

document.addEventListener('DOMContentLoaded', function () {
    // Initialize map
    navigator.geolocation.getCurrentPosition(function(position) {
        map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Load crime reports
        fetchReports();

        // Check authentication status
        checkAuth();
    }, function() {
        // Fallback to a default location if geolocation fails
        map = L.map('map').setView([51.983, 8.849], 13); // Centered on Detmold
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Load crime reports
        fetchReports();

        // Check authentication status
        checkAuth();
    });
});

// Address search and selection
async function searchAddress() {
    const street = document.getElementById('streetName').value;
    const number = document.getElementById('streetNumber').value;
    const postal = document.getElementById('postalCode').value;
    const city = document.getElementById('city').value;

    const searchQuery = `${street} ${number}, ${postal} ${city}, Germany`;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const results = await response.json();

        displaySearchResults(results);
    } catch (error) {
        console.error('Error searching address:', error);
        alert('Error searching address. Please try again.');
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-warning">No results found</div>';
        return;
    }

    resultsContainer.innerHTML = `
        <div class="list-group">
            ${results.map((result, index) => `
                <button type="button" 
                        class="list-group-item list-group-item-action bg-dark text-light" 
                        onclick="selectLocation(${result.lat}, ${result.lon}, '${result.display_name.replace(/'/g, "&apos;")}')">
                    ${result.display_name}
                </button>
            `).join('')}
        </div>
    `;
}

function selectLocation(lat, lon, displayName) {
    document.getElementById('crimeLat').value = lat;
    document.getElementById('crimeLng').value = lon;
    document.getElementById('location-status').textContent = `Selected: ${displayName}`;

    // Center map on selected location
    map.setView([lat, lon], 16);

    // Clear existing location marker if it exists
    if (window.locationMarker) {
        map.removeLayer(window.locationMarker);
    }

    // Add marker at selected location
    window.locationMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup('Selected location')
        .openPopup();
}

// Login form handling
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            toggleLoginModal();
            checkAuth();
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Error logging in. Please try again.');
    }
});

// Report form handling
document.getElementById('reportForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const lat = document.getElementById('crimeLat').value;
    const lng = document.getElementById('crimeLng').value;

    if (!lat || !lng) {
        alert('Please select a location before submitting');
        return;
    }

    const reportData = {
        title: document.getElementById('crimeTitle').value,
        description: document.getElementById('crimeDescription').value,
        category: document.getElementById('crimeCategory').value,
        severity: parseInt(document.getElementById('crimeSeverity').value),
        location: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
        }
    };

    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            // Close the modal
            toggleReportModal();
            // Reset the form
            document.getElementById('reportForm').reset();
            document.getElementById('location-status').textContent = 'No location selected';
            if (window.locationMarker) {
                map.removeLayer(window.locationMarker);
                window.locationMarker = null;
            }
            // Refresh the reports
            fetchReports();
            // Show success message
            alert('Report submitted successfully');
        } else {
            const error = await response.json();
            alert(`Failed to submit report: ${error.message}`);
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('Failed to submit report. Please try again.');
    }
});

async function fetchReports() {
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();

        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Add new markers
        reports.forEach(report => {
            const marker = L.circleMarker([report.location[1], report.location[0]], {
                radius: 8,
                className: `crime-marker severity-${report.severity}`
            }).addTo(map);

            marker.bindPopup(`
                <h5>${report.title}</h5>
                <p>${report.description}</p>
                <small>Reported: ${new Date(report.reported_at).toLocaleDateString()}</small>
            `);

            markers.push(marker);
        });

        // Update feed items
        updateFeedItems(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

function updateFeedItems(reports) {
    const container = document.querySelector('.feed-items');
    container.innerHTML = reports.map(report => `
        <div class="feed-item">
            <div class="feed-date text-muted">
                ${new Date(report.reported_at).toLocaleString()}
            </div>
            <div class="feed-details">
                <div>- Type of crime: ${report.category}</div>
                <div>- Severity: ${report.severity}/5</div>
                <div>- Safety level: ${getSafetyLevel(report.severity)}</div>
            </div>
            <div class="feed-status">
                ${report.verified === true ? 'Cleared by police' : 'Active'}
            </div>
            <a href="/api/report/${report.id}" class="feed-more">read more...</a>
        </div>
    `).join('');
}

function getSafetyLevel(severity) {
    const levels = {
        1: 'Safe',
        2: 'Moderate',
        3: 'Caution',
        4: 'High Risk',
        5: 'Extreme Danger'
    };
    return levels[severity] || 'Unknown';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('registerLink').style.display = 'none';
    }
}

function toggleLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const modal = bootstrap.Modal.getOrCreateInstance(loginModal);
    modal.toggle();
}

function toggleReportModal() {
    const reportModal = document.getElementById('reportModal');
    const modal = bootstrap.Modal.getOrCreateInstance(reportModal);
    modal.toggle();
}