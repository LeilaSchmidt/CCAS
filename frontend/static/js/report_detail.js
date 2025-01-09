document.addEventListener('DOMContentLoaded', async function() {
    const reportId = document.getElementById('reportDetail').dataset.reportId;

    try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) {
            throw new Error('Report not found');
        }
        const report = await response.json();

        // Update content
        document.getElementById('reportDetail').innerHTML = `
            <div class="report-field">
                <div>- Type of crime: ${report.category}</div>
                <div>- Severity: ${report.severity}/5</div>
                <div>- Safety level: ${getSafetyLevel(report.severity)}</div>
            </div>

            <div class="description-section">
                <div class="description-title">Description:</div>
                <div>${report.description}</div>
            </div>

            <div class="confirmation-section">
                <div>Confirmed by Law Enforcement?</div>
                <div>${report.verified ? 'Yes' : 'No'}</div>
            </div>
        `;

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