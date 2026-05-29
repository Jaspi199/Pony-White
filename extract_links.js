const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const srcDir = '/Users/ignaciotoro/Documents/GitHub/Ponywhite/src/pages';
const links = {};

fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.html')) {
        const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
        const $ = cheerio.load(content);
        const fileLinks = [];
        
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                fileLinks.push({
                    text: $(el).text().trim().substring(0, 50),
                    href: href
                });
            }
        });
        
        if (fileLinks.length > 0) {
            links[file] = fileLinks;
        }
    }
});

console.log(JSON.stringify(links, null, 2));
