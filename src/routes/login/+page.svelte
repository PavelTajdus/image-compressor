<script>
	export let form;
</script>

<svelte:head>
	<title>Admin Login</title>
</svelte:head>

<div class="container">
	<div class="login-card">
		<h1>Admin Login</h1>
		
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		<form method="POST">
			<div class="form-group">
				<label for="password">Password</label>
				<input 
					type="password" 
					id="password" 
					name="password" 
					required 
					placeholder="Enter admin password"
				/>
			</div>
			<button type="submit">Login</button>
		</form>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter', sans-serif;
		background: #f8f9fa;
		color: #1a1a1a;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}

	.login-card {
		background: white;
		padding: 40px;
		border-radius: 16px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
		text-align: center;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 24px;
		font-size: 1.5rem;
	}

	.form-group {
		margin-bottom: 20px;
		text-align: left;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		font-size: 0.9rem;
	}

	input {
		width: 100%;
		padding: 10px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	button {
		width: 100%;
		padding: 12px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover {
		background: #2563eb;
	}

	.error {
		color: #dc2626;
		background: #fee2e2;
		padding: 10px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 0.9rem;
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #0d0d0d;
			color: #e5e5e5;
		}
		.login-card {
			background: #1a1a1a;
			border: 1px solid #333;
		}
		input {
			background: #262626;
			border-color: #404040;
			color: white;
		}
		h1 { color: white; }
	}
</style>
