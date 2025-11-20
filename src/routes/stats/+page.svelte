<script>
  export let data;
  const { stats } = data;

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
</script>

<svelte:head>
  <title>Statistics - Image Compressor</title>
</svelte:head>

<div class="container">
  <header>
    <div class="logo">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#3b82f6"/>
        <path d="M14 19L24 14L34 19V29L24 34L14 29V19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 24V34" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 19L24 24L34 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Statistics</h1>
    <p>Track your compression savings</p>
    <div class="back-link-wrapper">
      <a href="/" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Compressor
      </a>
    </div>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <div class="card-content">
        <h3>Total Images</h3>
        <p class="stat-value">{stats.totalImages}</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
          <line x1="16" y1="5" x2="22" y2="5"/>
          <line x1="19" y1="2" x2="19" y2="8"/>
        </svg>
      </div>
      <div class="card-content">
        <h3>Total Processed</h3>
        <p class="stat-value">{formatSize(stats.totalOriginalSize)}</p>
      </div>
    </div>
    <div class="stat-card highlight">
      <div class="card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
      <div class="card-content">
        <h3>Total Saved</h3>
        <p class="stat-value">{stats.totalSavings}%</p>
      </div>
    </div>
  </div>

  <div class="file-stats-grid">
    <div class="file-stat-card">
      <h3>Incoming Files</h3>
      {#if stats.inputStats && stats.inputStats.length > 0}
        <div class="stat-list">
          {#each stats.inputStats as stat}
            <div class="stat-row">
              <span class="stat-label">{stat.mime_type.split('/')[1].toUpperCase()}</span>
              <div class="stat-bar-container">
                <div class="stat-bar" style="width: {(stat.count / stats.totalImages) * 100}%"></div>
              </div>
              <span class="stat-count">{stat.count}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-text">No data available</p>
      {/if}
    </div>

    <div class="file-stat-card">
      <h3>Best Output Format</h3>
      {#if stats.outputStats && stats.outputStats.length > 0}
        <div class="stat-list">
          {#each stats.outputStats as stat}
            <div class="stat-row">
              <span class="stat-label">{stat.output_format.toUpperCase()}</span>
              <div class="stat-bar-container">
                <div class="stat-bar output" style="width: {(stat.count / stats.totalImages) * 100}%"></div>
              </div>
              <span class="stat-count">{stat.count}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-text">No data available</p>
      {/if}
    </div>
  </div>

  <div class="recent-activity">
    <div class="activity-header">
      <h2>Recent Activity</h2>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>File</th>
            <th>Type</th>
            <th>Original</th>
            <th>Compressed</th>
            <th>Saved</th>
          </tr>
        </thead>
        <tbody>
          {#each stats.recentLogs as log}
            <tr>
              <td class="time">{new Date(log.timestamp).toLocaleString()}</td>
              <td class="filename" title={log.filename}>
                <div class="file-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span>{log.filename}</span>
                </div>
              </td>
              <td><span class="type-badge">{log.mime_type.split('/')[1].toUpperCase()}</span></td>
              <td class="mono">{formatSize(log.original_size)}</td>
              <td class="mono">{formatSize(log.compressed_size)}</td>
              <td>
                <span class="badge" class:positive={log.savings_percent > 0}>
                  -{log.savings_percent}%
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8f9fa;
    color: #1a1a1a;
    min-height: 100vh;
    padding: 40px 20px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #0d0d0d;
      color: #e5e5e5;
    }
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 60px;
    animation: fadeInUp 0.6s ease-out;
    display: block; /* Reset flex */
  }

  .logo {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;
  }

  .logo svg {
    filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  h1 {
    font-family: 'Instrument Serif', serif;
    font-size: 3.5rem;
    margin: 0;
    font-weight: 400;
    letter-spacing: -0.02em;
    color: #1a1a1a;
  }

  header p {
    font-size: 1.1rem;
    color: #6b6b6b;
    margin: 12px 0 24px 0;
  }

  .back-link-wrapper {
    display: flex;
    justify-content: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(229, 229, 229, 0.5);
    border-radius: 12px;
    color: #1a1a1a;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .back-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #3b82f6;
    color: #3b82f6;
  }

  /* ... rest of styles ... */

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 28px;
    border-radius: 20px;
    border: 1px solid rgba(229, 229, 229, 0.5);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
    animation: fadeInUp 0.6s ease-out both;
  }

  .stat-card:nth-child(1) { animation-delay: 0.1s; }
  .stat-card:nth-child(2) { animation-delay: 0.2s; }
  .stat-card:nth-child(3) { animation-delay: 0.3s; }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #eff6ff;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-card.highlight .card-icon {
    background: #f0fdf4;
    color: #15803d;
  }

  .stat-card h3 {
    margin: 0 0 4px 0;
    color: #6b6b6b;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
    font-feature-settings: "tnum";
  }

  .stat-card.highlight .stat-value {
    color: #15803d;
  }

  .recent-activity {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(229, 229, 229, 0.5);
    overflow: hidden;
    animation: fadeInUp 0.6s ease-out 0.4s both;
  }

  .activity-header {
    padding: 24px 32px;
    border-bottom: 1px solid rgba(229, 229, 229, 0.5);
  }

  .activity-header h2 {
    margin: 0;
    font-family: 'Instrument Serif', serif;
    font-size: 1.75rem;
    font-weight: 400;
    color: #1a1a1a;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  th {
    padding: 20px 32px;
    text-align: left;
    background: rgba(248, 249, 250, 0.5);
    font-weight: 600;
    color: #6b6b6b;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(229, 229, 229, 0.5);
  }

  td {
    padding: 20px 32px;
    border-bottom: 1px solid rgba(229, 229, 229, 0.5);
    color: #1a1a1a;
    transition: background-color 0.2s;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: rgba(59, 130, 246, 0.02);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .file-info svg {
    color: #9ca3af;
  }

  .filename span {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  .type-badge {
    display: inline-block;
    padding: 4px 8px;
    background: #f3f4f6;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4b5563;
  }

  .mono {
    font-family: 'SF Mono', 'Roboto Mono', monospace;
    font-size: 0.9rem;
    color: #6b6b6b;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
    background: #f3f4f6;
    color: #6b7280;
  }

  .badge.positive {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .header-content h1, .activity-header h2, .stat-value {
      color: #e5e5e5;
    }

    .header-content p, .stat-card h3 {
      color: #9a9a9a;
    }

    .back-link {
      background: rgba(26, 26, 26, 0.8);
      border-color: rgba(51, 51, 51, 0.5);
      color: #e5e5e5;
    }

    .back-link:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .stat-card, .recent-activity {
      background: rgba(26, 26, 26, 0.8);
      border-color: rgba(51, 51, 51, 0.5);
    }

    .stat-card:hover {
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.3);
    }

    .card-icon {
      background: rgba(59, 130, 246, 0.1);
    }

    .stat-card.highlight .card-icon {
      background: rgba(21, 128, 61, 0.2);
      color: #4ade80;
    }

    .stat-card.highlight .stat-value {
      color: #4ade80;
    }

    .activity-header, td, th {
      border-bottom-color: rgba(51, 51, 51, 0.5);
    }

    th {
      background: rgba(38, 38, 38, 0.5);
      color: #9ca3af;
    }

    td {
      color: #d1d5db;
    }

    tr:hover td {
      background: rgba(59, 130, 246, 0.05);
    }

    .type-badge {
      background: #374151;
      color: #d1d5db;
    }

    .mono {
      color: #9ca3af;
    }

    .badge {
      background: #374151;
      color: #d1d5db;
    }

    .badge.positive {
      background: #064e3b;
      color: #6ee7b7;
      border-color: #065f46;
    }
  }

  .file-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .file-stat-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 24px;
    border-radius: 20px;
    border: 1px solid rgba(229, 229, 229, 0.5);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    animation: fadeInUp 0.6s ease-out 0.2s both;
  }

  .file-stat-card h3 {
    margin: 0 0 20px 0;
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #1a1a1a;
  }

  .stat-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-label {
    width: 60px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6b6b6b;
  }

  .stat-bar-container {
    flex: 1;
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
  }

  .stat-bar {
    height: 100%;
    background: #3b82f6;
    border-radius: 4px;
    transition: width 0.6s ease-out;
  }

  .stat-bar.output {
    background: #10b981;
  }

  .stat-count {
    width: 40px;
    text-align: right;
    font-size: 0.9rem;
    font-weight: 500;
    color: #1a1a1a;
    font-feature-settings: "tnum";
  }

  .empty-text {
    color: #9ca3af;
    font-style: italic;
    text-align: center;
    margin: 20px 0;
  }

  @media (prefers-color-scheme: dark) {
    .file-stat-card {
      background: rgba(26, 26, 26, 0.8);
      border-color: rgba(51, 51, 51, 0.5);
    }

    .file-stat-card h3 {
      color: #e5e5e5;
    }

    .stat-bar-container {
      background: #374151;
    }

    .stat-count {
      color: #e5e5e5;
    }

    .stat-label {
      color: #9ca3af;
    }
  }
</style>
