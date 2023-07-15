# NPTEL Course Download

A helper JavaScript program to download NPTEL courses.

## Dependencies
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)

**Note:** The course content must have been released in order for you to make use of this script.

## Usage
1. Navigate to the course website.
2. Access the developer tools either by using `CTRL+SHIFT+I` or by clicking on the three vertical dots at the top left and selecting the appropriate option from the menu.
3. Go to the console tab.
4. Copy and paste the code from "nptel_link_extract.v1.js" into the console.
5. Press Enter.
6. The script will generate a Linux bash script.
   - On Unix/Linux, you need to modify the execution permissions using `chmod u+x`.
   - On Windows, you can rename the downloaded file's extension to `.bat` and run it in a command prompt.

**Note:** Make sure you have the necessary permissions and dependencies installed before running the script.
