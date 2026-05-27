<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/logo.png';


	const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-grid">
			<!-- Brand Column -->
			<div class="footer-brand-col">
				<a href={resolve('/app')} class="footer-logo">
					<img src={logo} alt="MicroBlog" width="30" height="30" />
					<span>MicroBlog</span>
				</a>
				<p class="footer-tagline">
					Write short, meaningful posts in a simple and private space. No noise, no distractions.
				</p>
			</div>

			<!-- Navigation Column -->
			<div class="footer-col">
				<h4 class="footer-heading">Navigate</h4>
				<ul class="footer-links">
					<li><a href={resolve('/app')}>Home Feed</a></li>
					<li><a href={resolve('/app/profile')}>Edit Profile</a></li>
				</ul>
			</div>

			<!-- About Column -->
			<div class="footer-col">
				<h4 class="footer-heading">About</h4>
				<ul class="footer-links">
					<li><a href={resolve('/')}>Landing Page</a></li>
					<li><a href={resolve('/auth/login')}>Sign In</a></li>
					<li><a href={resolve('/auth/register')}>Register</a></li>
				</ul>
			</div>
		</div>

		<div class="footer-divider"></div>

		<div class="footer-bottom">
			<p class="w-full text-center text-sm">&copy; {currentYear} MicroBlog. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	.footer { background:#f8fafc;border-top:1px solid #e2e8f0;margin-top:auto }
	.footer-inner { max-width:64rem;margin:0 auto;padding:3rem 1.5rem 2rem }

	.footer-grid { display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem }
	@media(max-width:640px) { .footer-grid { grid-template-columns:1fr;gap:2rem } }

	.footer-brand-col { display:flex;flex-direction:column;gap:.75rem }
	.footer-logo { display:flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:700;font-size:1.05rem;color:#0f172a;transition:opacity .2s }
	.footer-logo:hover { opacity:.75 }
	.footer-brand-icon { display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:.5rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff }
	.footer-tagline { font-size:.8125rem;color:#64748b;line-height:1.6;max-width:20rem }

	.footer-col { display:flex;flex-direction:column;gap:.625rem }
	.footer-heading { font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:.125rem }
	.footer-links { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.375rem }
	.footer-links a { font-size:.8125rem;color:#475569;text-decoration:none;transition:color .15s }
	.footer-links a:hover { color:#6366f1 }

	.footer-divider { height:1px;background:#e2e8f0;margin:2rem 0 1.25rem }

	.footer-bottom { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem }
	.footer-copy { font-size:.75rem;color:#94a3b8 }
	.footer-badge { display:flex;align-items:center;gap:.375rem;font-size:.6875rem;color:#94a3b8 }
	.badge-dot { width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 4px rgba(34,197,94,.4);animation:pulse 2s ease-in-out infinite }
	@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
</style>
