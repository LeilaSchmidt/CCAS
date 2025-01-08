document.addEventListener('DOMContentLoaded', async function() {
    const reportId = document.getElementById('reportDetail').dataset.reportId;

    try {
        // Fetch report details
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) {
            throw new Error('Report not found');
        }
        const report = await response.json();

        // Update content
        document.getElementById('reportDetail').innerHTML = `
            <h2>${report.title}</h2>
            <div class="text-muted mb-3">
                Reported on ${new Date(report.reported_at).toLocaleString()}
            </div>
            <div class="mb-3">
                <strong>Category:</strong> ${report.category}<br>
                <strong>Severity:</strong> ${report.severity}/5<br>
                <strong>Status:</strong> ${report.verified ? 'Cleared by police' : 'Active'}<br>
                <strong>Safety Level:</strong> ${getSafetyLevel(report.severity)}
            </div>
            <div class="mb-3">
                <h4>Description</h4>
                <p>${report.description}</p>
            </div>
            <a href="/" class="btn btn-secondary">Back to Map</a>
        `;

        // Initialize map
        const map = L.map('detailMap').setView([report.location[1], report.location[0]], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add marker
        L.circleMarker([report.location[1], report.location[0]], {
            radius: 8,
            className: `crime-marker severity-${report.severity}`
        }).addTo(map)
            .bindPopup(report.title)
            .openPopup();

    } catch (error) {
        console.error('Error fetching report:', error);
        document.getElementById('reportDetail').innerHTML = `
            <div class="alert alert-danger">
                Error loading report details. The report may not exist.
                <br><br>
                <a href="/" class="btn btn-secondary">Back to Map</a>
            </div>
        `;
    }
});

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