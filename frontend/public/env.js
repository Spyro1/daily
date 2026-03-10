window.__ENV__ = window.__ENV__ || {};

if (!window.__ENV__.VITE_API_BASE_URL) {
	const protocol = window.location.protocol;
	const hostname = window.location.hostname;
	window.__ENV__.VITE_API_BASE_URL = protocol + '//' + hostname + ':8000';
}