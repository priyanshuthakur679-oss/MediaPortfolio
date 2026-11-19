document.body.classList.add('is-loading');

const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('.loader__count');
let loadProgress = 0;
const countTimer = window.setInterval(() => {
	loadProgress = Math.min(loadProgress + Math.ceil(Math.random() * 14), 100);
	loaderCount.textContent = String(loadProgress).padStart(2, '0');
	if (loadProgress === 100) window.clearInterval(countTimer);
}, 90);

window.addEventListener('load', () => {
	window.setTimeout(() => {
		loader.classList.add('is-done');
		document.body.classList.remove('is-loading');
	}, 350);
}, { once: true });

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
	const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
	menuToggle.setAttribute('aria-expanded', String(!isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
	nav.classList.toggle('is-open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => {
	link.addEventListener('click', () => {
		nav.classList.remove('is-open');
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Open navigation');
	});
});

const revealObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add('is-visible');
			observer.unobserve(entry.target);
		}
	});
}, { threshold: 0.13 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const cursor = document.querySelector('.cursor');
if (window.matchMedia('(pointer: fine)').matches) {
	window.addEventListener('pointermove', (event) => {
		cursor.style.left = `${event.clientX}px`;
		cursor.style.top = `${event.clientY}px`;
	});
	document.querySelectorAll('a, button, input, select, textarea').forEach((element) => {
		element.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
		element.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
	});
}

const magneticItems = document.querySelectorAll('.magnetic');
magneticItems.forEach((item) => {
	item.addEventListener('pointermove', (event) => {
		if (window.matchMedia('(pointer: coarse)').matches) return;
		const bounds = item.getBoundingClientRect();
		const x = event.clientX - bounds.left - bounds.width / 2;
		const y = event.clientY - bounds.top - bounds.height / 2;
		item.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
	});
	item.addEventListener('pointerleave', () => { item.style.transform = ''; });
});

const parallaxItems = document.querySelectorAll('[data-parallax]');
let parallaxQueued = false;
window.addEventListener('scroll', () => {
	if (parallaxQueued) return;
	parallaxQueued = true;
	window.requestAnimationFrame(() => {
		parallaxItems.forEach((item) => {
			const bounds = item.getBoundingClientRect();
			const factor = Number(item.dataset.parallax);
			if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
				item.style.transform = `translateY(${(bounds.top - window.innerHeight / 2) * factor}px)`;
			}
		});
		parallaxQueued = false;
	});
}, { passive: true });

const video = document.querySelector('.reel-video');
const reelFrame = document.querySelector('.reel-frame');
const playButtons = document.querySelectorAll('.reel-play, .control-play');
const muteButton = document.querySelector('.control-mute');
const progress = document.querySelector('.video-progress');
const timeDisplay = document.querySelector('.video-time');
const formatTime = (seconds) => {
	if (!Number.isFinite(seconds)) return '00:00';
	const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
	const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
	return `${minutes}:${remainder}`;
};

const toggleVideo = () => {
	if (video.paused) video.play().catch(() => { reelFrame.classList.remove('is-playing'); });
	else video.pause();
};
playButtons.forEach((button) => button.addEventListener('click', toggleVideo));
video.addEventListener('click', toggleVideo);
video.addEventListener('play', () => {
	reelFrame.classList.add('is-playing');
	document.querySelectorAll('.control-play i').forEach((icon) => { icon.className = 'fa-solid fa-pause'; });
});
video.addEventListener('pause', () => {
	reelFrame.classList.remove('is-playing');
	document.querySelectorAll('.control-play i').forEach((icon) => { icon.className = 'fa-solid fa-play'; });
});
video.addEventListener('timeupdate', () => {
	progress.value = video.duration ? String((video.currentTime / video.duration) * 100) : '0';
	timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
});
video.addEventListener('loadedmetadata', () => {
	timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
});
progress.addEventListener('input', () => {
	if (video.duration) video.currentTime = (Number(progress.value) / 100) * video.duration;
});
muteButton.addEventListener('click', () => {
	video.muted = !video.muted;
	muteButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
	muteButton.innerHTML = `<i class="fa-solid ${video.muted ? 'fa-volume-xmark' : 'fa-volume-high'}"></i>`;
});
document.querySelector('.control-fullscreen').addEventListener('click', () => {
	if (document.fullscreenElement) document.exitFullscreen();
	else reelFrame.requestFullscreen?.();
});

document.querySelectorAll('.project__visual').forEach((project) => {
	project.addEventListener('click', () => {
		video.pause();
		video.src = project.dataset.video;
		video.load();
		document.querySelector('.reel-duration').textContent = `${project.dataset.title.toUpperCase()} — SELECTED FILM`;
		document.querySelector('#showreel').scrollIntoView({ behavior: 'smooth' });
		video.addEventListener('loadeddata', () => video.play().catch(() => {}), { once: true });
	});
});

document.querySelector('.contact-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = event.currentTarget;
	const data = new FormData(form);
	const subject = encodeURIComponent(`Project inquiry: ${data.get('project') || 'New project'}`);
	const body = encodeURIComponent(`Hi Priyanshu,\n\n${data.get('message')}\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nProject: ${data.get('project') || 'Not specified'}`);
	document.querySelector('.form-status').textContent = 'Opening an email draft. Add your preferred recipient before sending.';
	window.location.href = `mailto:?subject=${subject}&body=${body}`;
});
