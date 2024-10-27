function download(content, name) {
	const file = new File([content], name, {type: 'text/plain'});
	const download_link = document.createElement('a');
	download_link.href = URL.createObjectURL(file);
	download_link.download = name;
	document.body.appendChild(download_link);
	download_link.click();
	document.body.removeChild(download_link);
	URL.revokeObjectURL(download_link.href);
}

function getYtId(url, key, container, len) {
	fetch(url)
		.then(response => response.text())
		.then(html => {
			const id_pattern = /loadIFramePlayer\("([a-zA-Z0-9_-]{11})", 'videoDiv'\);/;
			const match = html.match(id_pattern);
			if (match !== null) {
				const [, id] = match;
				container[key] = id;
			} else {
				container[key] = null;
			}
			container.length += 1;
			// console.log(match, url, key);
			if (container.length == len) {
				delete container.length;
				let bat_file = '';
				for (const k in container) {
					if (container[k] === null) { continue; }
					// TODO: do somthing about the escaping the % sign
					bat_file += `start "" yt-dlp -o "${k.replace(/\?/g, '#').replace(/\//g, '#').replace(/:/g, '#')} [%%(id)s].%%(ext)s" -f136+251 -- ${container[k]}\n`;
				}
				const file_name = `${(new URL('https://onlinecourses.nptel.ac.in/noc24_cs125/unit?unit=22&lesson=23')).pathname.split('/')[1]}.bat`;
				download(bat_file, file_name);
			}
		});
}

function unescape_html(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function getLessons() {
	const course = window.location.pathname.split('/')[1];
	if (course.match(/^noc\d{2}_[a-z]{2}\d{3}$/) === null) {
		return;
	}
	const base_url = 'https://onlinecourses.nptel.ac.in';
	return fetch(`${base_url}/${course}`)
		.then(response => response.text())
		.then(html => {
			const link_pattern = /<a href="(unit\?unit=\d+&lesson=\d+)" id="lesson_\d+">(Tutorial|Lecture)\s*(\d{2}) :(.+?)<\/a>/g;
			const matches = [...html.matchAll(link_pattern)];
			// console.log(matches, matches.length);
			const lectures = {length: 0};
			for (const m of matches) {
				const [, href, type, n, title] = m;
				// console.log(href, n, title);
				getYtId(`${base_url}/${course}/${href}`, `${type} ${n}. ${unescape_html(title.trim())}`, lectures, matches.length);
			}
		});
}

getLessons();
