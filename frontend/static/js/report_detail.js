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
            <div class="report-status ${report.verified ? 'status-verified' : 'status-active'}">
                ${report.verified ? 'Cleared by police' : 'Active'}
            </div>

            <div class="report-field">
                <div>- Type of crime: ${report.category}</div>
                <div>- Severity: ${report.severity}/5</div>
                <div>- Safety level: ${getSafetyLevel(report.severity)}</div>
                <div>- Status: ${getStatusWithLabel(report.verified)}</div>
            </div>

            <div class="description-section">
                <div class="description-title">Description:</div>
                <div>${report.description}</div>
            </div>

            <div class="report-meta">
                <div class="report-date">
                    Reported: ${formatDate(report.reported_at)}
                </div>
                <div class="verification-section">
                    <div class="verification-label">Report Status:</div>
                    <div class="verification-status ${report.verified ? 'verified' : 'active'}">
                        ${getStatusDetails(report.verified)}
                    </div>
                </div>
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

function getStatusWithLabel(verified) {
    return verified ? 'Cleared' : 'Active - Under Investigation';
}

function getStatusDetails(verified) {
    if (verified) {
        return 'This report has been verified and cleared by law enforcement';
    }
    return 'This report is active and under investigation';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}