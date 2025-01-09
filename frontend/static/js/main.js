let map;
let markers = [];

// Initialize map
document.addEventListener('DOMContentLoaded', function () {
    // Default location if geolocation is not shared or fails
    const defaultLocation = [51.983, 8.849]; // Example: Centered on Detmold
    const defaultRadius = 50; // Default radius in km

    map = L.map('map').setView(defaultLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add default radius circle
    radiusCircle = L.circle(defaultLocation, {
        radius: defaultRadius * 1000, // Convert km to meters
        color: 'black',
        fillColor: 'rgba(0, 0, 0, 0.2)',
        fillOpacity: 0.5,
    }).addTo(map);

    // Check if the user consents to share their location
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const userLocation = [position.coords.latitude, position.coords.longitude];
            map.setView(userLocation, 13);
            L.marker(userLocation).addTo(map).bindPopup("Your Location").openPopup();
        },
        function () {
            console.log("Geolocation not shared or failed. Showing default location.");
        }
    );

    // Load crime reports
    fetchReports();
});

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

        const { lat, lon, display_name } = results[0];

        // Center map on the searched location
        map.setView([lat, lon], 13);

        // Add marker for the searched location
        L.marker([lat, lon]).addTo(map).bindPopup(`Search Result: ${display_name}`).openPopup();

        console.log(`Moved map to ${display_name}`);
    } catch (error) {
        console.error("Error searching location:", error);
        alert("Failed to search location. Please try again.");
    }
}

// Fetch crime reports and display them on the map
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
                className: `crime-marker severity-${report.severity}`,
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
        console.error("Error fetching reports:", error);
    }
}

// Update the feed items
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

// Toggle login modal
function toggleLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const modal = bootstrap.Modal.getOrCreateInstance(loginModal);
    modal.toggle();
}

// Toggle report modal
function toggleReportModal() {
    const reportModal = document.getElementById('reportModal');
    const modal = bootstrap.Modal.getOrCreateInstance(reportModal);
    modal.toggle();
}