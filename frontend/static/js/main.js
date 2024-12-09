let map;
let markers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load crime reports
    fetchReports();

    // Check authentication status
    checkAuth();
});

async function fetchReports() {
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();

        // Clear existing markers
        markers.forEach(marker => map.removeMarker(marker));
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

        // Update recent reports list
        updateRecentReports(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

function updateRecentReports(reports) {
    const container = document.getElementById('recentReports');
    container.innerHTML = reports.slice(0, 5).map(report => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-title">${report.title}</h6>
                <p class="card-text small">${report.description.substring(0, 100)}...</p>
                <small class="text-muted">${new Date(report.reported_at).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('registerLink').style.display = 'none';
    }
}