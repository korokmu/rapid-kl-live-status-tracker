// Sanitize user input to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Phase 2: Dynamic Station Logic
let currentStationName = "KL Sentral"; // Default
let currentStationId = null;
let currentReportId = null;
let lastSubmitTime = 0;
let selectedCategory = null;

const stationSelector = document.getElementById('station-selector');

// 1. Fetch all stations and populate the dropdown
async function loadStations() {
    const { data: stations, error } = await sb
        .from('stations')
        .select('name')
        .order('sequence', { ascending: true });

    if (error) {
        console.error('Error loading stations:', error.message);
        return;
    }

    // Fill the dropdown
    stationSelector.innerHTML = stations.map(s => `
        <option value="${s.name}" ${s.name === currentStationName ? 'selected' : ''}>
            ${s.name}
        </option>
    `).join('');
}

// 2. Fetch and show status for the SELECTED station
async function getStatus() {
    const statusCard = document.getElementById('status-card');
    const currentStatus = document.getElementById('current-status');
    const statusMeta = document.getElementById('status-meta');
    const statusIcon = statusCard.querySelector('.status-icon');
    const verifyActions = document.getElementById('verify-actions');

    const { data: station, error } = await sb
        .from('stations')
        .select('id, name, reports(*)')
        .eq('name', currentStationName)
        .single();

    if (error) {
        console.error('Error fetching status:', error.message);
        return;
    }

    currentStationId = station.id;

    // Filter for active reports
    const activeReports = (station.reports || []).filter(r => r.is_active === true);

    // Apply 2-hour auto-expire rule for the UI display
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentReports = activeReports.filter(r => {
        const reportTime = new Date(r.created_at);
        const confirmTime = r.last_confirmed_at ? new Date(r.last_confirmed_at) : reportTime;
        return reportTime > twoHoursAgo || confirmTime > twoHoursAgo;
    });

    if (recentReports.length > 0) {
        const activeReport = recentReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        currentReportId = activeReport.id;
        
        let statusText = activeReport.status.charAt(0).toUpperCase() + activeReport.status.slice(1);
        if (activeReport.category) {
            const catMap = { technical: '🚨 Technical', crowd: '👥 Crowd', weather: '⛈️ Weather', facility: '🛠️ Facility' };
            statusText += ` — ${catMap[activeReport.category] || activeReport.category}`;
        }
        if (activeReport.confirmed_count >= 5) statusText += ' ✅ (Verified)';

        currentStatus.textContent = statusText;
        // Updated: Include Date + Time
        statusMeta.textContent = `Last updated: ${new Date(activeReport.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
        statusCard.className = `card status-${activeReport.status}`;
        statusIcon.textContent = activeReport.status === 'smooth' ? '🟢' : activeReport.status === 'slow' ? '🟡' : '🔴';
        verifyActions.style.display = activeReport.status !== 'smooth' ? 'block' : 'none';
    } else {
        currentReportId = null;
        currentStatus.textContent = 'Smooth';
        statusMeta.textContent = 'No recent reports (defaulting to Smooth)';
        statusCard.className = 'card status-smooth';
        statusIcon.textContent = '🟢';
        verifyActions.style.display = 'none';
    }

    fetchComments();
}

async function fetchComments() {
    const commentsList = document.getElementById('comments-list');
    const { data: comments, error } = await sb
        .from('comments')
        .select('*')
        .eq('station_id', currentStationId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) return;
    if (comments && comments.length > 0) {
        commentsList.innerHTML = comments.map(c => `
            <div class="comment-item">
                <p class="comment-body">${escapeHTML(c.body)}</p>
                <p class="comment-meta">Commuter • ${new Date(c.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
        `).join('');
    } else {
        commentsList.innerHTML = '<p style="color: #65676b; font-size: 14px;">No comments yet.</p>';
    }
}

// --- Submit a Report ---
async function sendReport(status) {
    if (!currentStationId) return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { alert('Please login to report status!'); return; }

    const now = Date.now();
    if (now - lastSubmitTime < 5 * 60 * 1000) {
        alert("Wait a few minutes before reporting again.");
        return;
    }

    const commentBody = document.getElementById('comment-body').value.trim();
    const { error: reportErr } = await sb
        .from('reports')
        .insert([{ station_id: currentStationId, user_id: user.id, status: status, category: selectedCategory }]);

    if (reportErr) { alert('Error: ' + reportErr.message); return; }

    if (commentBody) {
        await sb.from('comments').insert([{ station_id: currentStationId, user_id: user.id, body: commentBody }]);
        document.getElementById('comment-body').value = ''; 
    }

    lastSubmitTime = now;
    selectedCategory = null;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    alert(`Successfully reported: ${status.toUpperCase()} at ${currentStationName}`);
}

// Verification functions (Confirm/Resolve)
async function confirmReport() {
    if (!currentReportId) return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { alert('Please login!'); return; }
    const { error } = await sb.from('upvotes').insert([{ report_id: currentReportId, user_id: user.id }]);
    if (error) alert(error.code === '23505' ? 'Already confirmed.' : error.message);
    else alert('Confirmed!');
}

async function resolveReport() {
    if (!currentReportId) return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { alert('Please login!'); return; }
    const { error } = await sb.from('resolves').insert([{ report_id: currentReportId, user_id: user.id }]);
    if (error) alert(error.code === '23505' ? 'Already marked resolved.' : error.message);
    else alert('Resolved report noted!');
}

// Listeners
stationSelector.addEventListener('change', (e) => {
    currentStationName = e.target.value;
    getStatus(); // Refresh UI for new station
});

document.querySelectorAll('#report-section .btn').forEach(button => {
    button.addEventListener('click', () => sendReport(button.getAttribute('data-status')));
});

document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const cat = button.getAttribute('data-category');
        if (selectedCategory === cat) { selectedCategory = null; button.classList.remove('selected'); }
        else { document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected')); selectedCategory = cat; button.classList.add('selected'); }
    });
});

document.getElementById('confirm-btn').addEventListener('click', confirmReport);
document.getElementById('resolve-btn').addEventListener('click', resolveReport);

// Initial Load
async function init() {
    await loadStations();
    await getStatus();
}
init();

// Real-time
sb.channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, getStatus)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, fetchComments)
    .subscribe();
