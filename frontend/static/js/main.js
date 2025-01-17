let map;
let markers = [];
let radiusCircle;
let locationPin;
let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', function () {
    const defaultLocation = [51.983, 8.849];
    const defaultRadius = 15;

    // Initialize map
    map = L.map('map').setView(defaultLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Create the default radius circle
    radiusCircle = L.circle(defaultLocation, {
        radius: defaultRadius * 1000,
        color: 'black',
        fillColor: 'rgba(0, 0, 0, 0.2)',
        fillOpacity: 0.5,
    }).addTo(map);

    // Add location pin to default location
    locationPin = L.marker(defaultLocation, {draggable: false}).addTo(map).bindPopup("Default Location");

    // Attach event listener to the radius slider
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    if (radiusSlider && radiusValue) {
        radiusSlider.value = defaultRadius;
        radiusValue.textContent = defaultRadius;

        // Update slider event listener to be async
        radiusSlider.addEventListener('input', async function () {
            const newRadius = parseInt(radiusSlider.value, 10);
            radiusValue.textContent = newRadius;

            // Update the radius of the circle
            radiusCircle.setRadius(newRadius * 1000);

            // Get current center
            const center = radiusCircle.getLatLng();

            // Generate new test data with updated radius
            await regenerateTestData(center.lat, center.lng, newRadius);
        });
    }

    // Check if the user consents to share their location
    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            map.setView(userLocation, 13);

            // Update the circle to center around the user's location
            radiusCircle.setLatLng(userLocation);

            // Generate test data for user's location
            await regenerateTestData(position.coords.latitude, position.coords.longitude, defaultRadius);
        },
        function () {
            console.log("Geolocation not shared or failed. Using default location.");
            // Fetch reports for the default location
            fetchReports();
        }
    );

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await handleLogin(email, password);
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
        });
    }

    // Signup form handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

            // Check if passwords match
            if (password !== passwordConfirm) {
                alert('Passwords do not match!');
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({email, password})
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please login.');
                    // Switch to login tab
                    document.getElementById('login-tab').click();
                    // Clear the form
                    signupForm.reset();
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }

    // Report Crime button handler
    const reportCrimeButton = document.getElementById('report-crime-button');
    if (reportCrimeButton) {
        reportCrimeButton.addEventListener('click', function () {
            const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
            reportModal.show();
        });
    }

    checkAuthenticationStatus();
});

// Authentication UI functions
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showSignupTab() {
    showLoginModal();
    document.getElementById('signup-tab').click();
}

function checkAuthenticationStatus() {
    const token = localStorage.getItem('token');
    isAuthenticated = !!token;
    updateUIForAuthStatus();
}

function updateUIForAuthStatus() {
    const reportButton = document.getElementById('report-crime-button');
    const loginSection = document.getElementById('login-section');
    const logoutSection = document.getElementById('logout-section');

    if (isAuthenticated) {
        if (reportButton) reportButton.style.display = 'block';
        if (loginSection) loginSection.style.display = 'none';
        if (logoutSection) logoutSection.style.display = 'block';
    } else {
        if (reportButton) reportButton.style.display = 'none';
        if (loginSection) loginSection.style.display = 'block';
        if (logoutSection) logoutSection.style.display = 'none';
    }
}

async function handleLogin(email, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password})
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            isAuthenticated = true;
            updateUIForAuthStatus();
            alert('Logged in successfully');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    isAuthenticated = false;
    updateUIForAuthStatus();
    alert('Logged out successfully');
}

// Search for a specific location
async function searchLocation() {
    const query = document.getElementById('locationSearch').value;
    if (!query) {
        alert("Please enter a location to search.");
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const results = await response.json();

        if (results.length === 0) {
            alert("No results found for this location.");
            return;
        }

        const {lat, lon, display_name} = results[0];

        // Center the map and the circle on the searched location
        map.setView([lat, lon], 13);
        radiusCircle.setLatLng([lat, lon]);

        // Generate new test data for this location
        const radius = radiusCircle.getRadius() / 1000; // Convert meters to km
        await regenerateTestData(lat, lon, radius);

        console.log(`Map moved to: ${display_name}`);
    } catch (error) {
        console.error("Error searching location:", error);
        alert("Failed to search location. Please try again.");
    }
}

// Fetch crime reports and display them on the map
async function fetchReports() {
    const center = radiusCircle.getLatLng();
    const radius = radiusCircle.getRadius() / 1000; // Convert meters to km

    try {
        const response = await fetch(`/api/reports?lat=${center.lat}&lon=${center.lng}&radius=${radius}`);
        const reports = await response.json();

        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Add new markers to the map
        reports.forEach(report => {
            const marker = L.circleMarker([report.location[1], report.location[0]], {
                radius: 8,
                className: `crime-marker severity-${report.severity}`,
            }).addTo(map);
            marker.bindPopup(`
                <h5>${report.title}</h5>
                <p>${report.description}</p>
                <small>Reported: ${new Date(report.reported_at).toLocaleString()}</small>
            `);
            markers.push(marker);
        });

        // Update the feed items
        updateFeedItems(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        updateFeedItems([]); // Fallback: Show no reports message
    }
}

async function regenerateTestData(lat, lon, radius) {
    try {
        const response = await fetch('/api/generate-test-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lat: lat,
                lon: lon,
                radius: radius
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate test data');
        }

        // Fetch reports again to update the display
        await fetchReports();
    } catch (error) {
        console.error('Error generating test data:', error);
    }
}

// Update the feed items
function updateFeedItems(reports) {
    const container = document.querySelector('.feed-items');
    if (!container) return;

    // Handle empty or undefined reports
    if (!reports || reports.length === 0) {
        container.innerHTML = `<p class="text-muted">No recent reports in this area.</p>`;
        return;
    }

    // Render the reports
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
                ${report.verified ? 'Cleared by police' : 'Active'}
            </div>
            <a href="/report/${report.id}" class="feed-more">read more...</a>
        </div>
    `).join('');
}

// Get safety level based on severity
function getSafetyLevel(severity) {
    const levels = {
        1: 'Safe',
        2: 'Moderate',
        3: 'Caution',
        4: 'High Risk',
        5: 'Extreme Danger',
    };
    return levels[severity] || 'Unknown';
}