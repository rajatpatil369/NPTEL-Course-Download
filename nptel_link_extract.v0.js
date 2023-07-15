let file_name = null;

if (document.title.includes(' - Course')) {
    file_name = document.title.split(' - Course')[0] + '.sh';
} else if (document.title.includes(' - - Unit')) {
    file_name = document.title.split(' - - Unit')[0] + '.sh';
} else {
    throw new Error('Unexpected condition: `document.title`');
}

const temp = [];

const elements = document.querySelectorAll('.gcb-left-activity-title-with-progress.gcb-nav-pa a');

const delay = 500;

let count = 0;

elements.forEach((element, index) => {
    
    // standard .href attribute gives full link
    if (element.getAttribute('href').startsWith('unit?')) {
        // console.log(`fetching ${element.href} ...`);
        
        setTimeout(() => {      // -> Error: Network response was NOT okay.
            
            fetch(element.href)
            .then(response => {
                if (response.ok) {
                    // console.log(`Response received OK with status code: $(response.status)`);
                    return response.text();
                }
                // response.text().then(html => console.log(html));
                throw new Error('Network response was NOT okay.');
            })
            .then(html => {
                // console.log(html);
                
                // parse the HTML string into a DOM document
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                const divElement = doc.querySelector('#lesson-video-container');
                
                // feedback forms, assignment solutions, transcripts, books, videos, problem solving sessions -> Error: divElement is null
                if (divElement !== null) {
                    video_id = divElement.getAttribute('data-video-id');   // custom html attribute
                    // console.log(`yt-dlp -o "${index}. ${element.textContent.trim()} [${video_id}].%(ext)s" -f18 -- ${video_id}`);
                    
                    temp.push([++count, element.textContent.trim(), video_id]);
                }
            })
            .catch(error => {
                console.log('Error:', error.message)
            });
            
        }, index * delay);

    }
});

setTimeout(() => {
    // console.log(temp); // Check the contents of the temp array

    const content = temp.map(i_title_id => {
        // console.log(i_title_id); // Check the value of i_title_id for each iteration
        const [i, video_title, id] = i_title_id;
        return `yt-dlp -o "${i}. ${video_title} [${id}].%(ext)s" -f18 -- ${id}`;
    }).join('\n');

    // console.log(content); // Check the content string after mapping
    
    // const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([content], file_name, { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = file_name;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

    console.log('File written successfully!');

}, (elements.length + 4) * delay);



/* Problems:
 * 1) SLOW
 * 2) processed elements NOT in order: filter elements before processing * 
 */
