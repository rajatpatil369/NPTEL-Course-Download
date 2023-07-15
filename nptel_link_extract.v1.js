let format;

let file_name;
if (document.title.includes(' - Course')) {
    file_name = document.title.split(' - Course')[0] + '.sh';
} else if (document.title.includes(' - - Unit')) {
    file_name = document.title.split(' - - Unit')[0] + '.sh';
} else {
    throw new Error('Unexpected condition: `document.title` is NOT in the expected format.');
}

/* get all `a` tags with the specified class name <- NodeList
 * this contains links for youtube video lessons, feedback forms, assignment and solutions, transcripts, books, and problem solving sessions
 */
const course_content = document.querySelectorAll('.gcb-left-activity-title-with-progress.gcb-nav-pa a');
/* filter out assessment links (standard `.href` attribute gives full URL, hence `getAttribute`)
 * group element and its index, so that the order could be maintained
 */
const lessons = Array.from(course_content)
    .filter(x => x.getAttribute('href').startsWith('unit?'))
    .map((x, i) => [i, x]);

const processed = [];


function main() {
    /* only fetch those links that are yet to be processed
     */
    const indices_of_processed = processed.map(x => x[0]);
    const fetch_promises = [];
    lessons
        .filter((x, i) => !indices_of_processed.includes(i))
        .forEach(([index, a_tag]) => {
            const promise = fetch(a_tag.href)
                .then(response => response.ok ? response.text() : null)
                .then(html => {
                    /* if the response for a URL is not received, for "some reason" e.g. 500 internal server error because you're overloading the server with requests, the URL would be marked as unprocessed
                    */
                    if (html) {
                        /* parse the HTML string into a DOM document
                            */
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        const div_element = doc.querySelector('#lesson-video-container');
                        /* `div#lesson-video-container` exists only for video lessons
                        */
                        // console.log(div_element);
                        if (div_element !== null) {
                            video_id = div_element.getAttribute('data-video-id');
                            processed.push([index, a_tag.textContent.trim(), video_id]);
                        } else {
                            processed.push([index]);
                        }
                    }
                    /* else: 500 internal server error (or something similar), will try again later...
                    */
                });
            fetch_promises.push(promise);
        });
    /* wait for all promises to settle down (resolve or reject)
     * then coordinate the logic that depends on the completion of multiple asynchronous operations (i.e. `fetch_promises`)
     */
    Promise.all(fetch_promises)
        .then(() => {
            /* check if the loop should continue or terminate
             */
            if (processed.length !== lessons.length) {
                /* call the next iteration after a random delay
                 * all this is for avoiding 500 internal server error
                 */
                // console.log('initiating next iteration...);
                /* strange: this condition doesn't occur commonly anymore, at first it did (the 500 internal server error)
                 * maybe it will when there are more requests to fetch ;)
                 */
                setTimeout(() => main, Math.random() * 4069);
            } else {    /* exit the loop */    
                /* fyi: `.filter`, `.map`, and `.join` are non-destructive methods (i.e. they do NOT modify the original Array, instead they return a new one on which the operations have been performed)
                 * and `.sort` is a destructive method that modifies the original array and returns a reference to the Array that has been modified
                 */
                const content = processed
                    .filter(x => x.length == 3)
                    .sort((a, b) => a[0] - b[0])
                    .map(([_, lesson_title, video_id], j) => `yt-dlp -o "${j + 1}. ${lesson_title} [%(id)s].%(ext)s" ${format} -- ${video_id}`)
                    .join('\n');
                console.log(content);

                const file = new File([content], file_name, { type: 'text/plain' });

                const download_link = document.createElement('a');
                download_link.href = URL.createObjectURL(file);
                download_link.download = file_name;

                document.body.appendChild(download_link);
                download_link.click();
                document.body.removeChild(download_link);
                URL.revokeObjectURL(download_link.href);

                console.log('DONE!');
            }
        });
}

format = prompt('Enter your preferred format: (`-f18` by default)', '-f18');
if (format) {
    main();
}
/* else: abort if user clicks on "Cancel"
 */
