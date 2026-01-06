/*-----------------------------------------------------------------------------------------\
|  _______                 _____  .               _                ___    ___/  ___    __  |
| '   /      ___  `       (      _/_   ,   .   ___/ `   __.       /   \ .'  /\ /   \ .'    |
|     |     /   ` |        `--.   |    |   |  /   | | .'   \        _-' |  / |   _-' |---. |
|     |    |    | |           |   |    |   | ,'   | | |    |       /    |,'  |  /    |   | |
|     /    `.__/| /      \___.'   \__/ `._/| `___,' /  `._.'      /___, /`---' /___, `._.' |
|                                                 `                                        |                                                                                                                                                                                                                                                 
\-----------------------------------------------------------------------------------------*/

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const readme = cheerio.load(fs.readFileSync('README.md'));
readme('.services img').remove();
var list = [],
    file = {};
function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            list.push(files[i]);
            readme('.services').append(`<img src="img/services/${files[i]}" width="5%" style="margin: 1%;" title="${files[i].replace('.png', '')}"></img>`);
        }
    }
    return files_;
}
getFiles('img/services');

file.all = list;
fs.writeFileSync(`lib/services.json`, `${JSON.stringify(file)}`);
fs.writeFileSync(`README.md`, readme.html());

// Fonction pour supprimer un répertoire récursivement
const deleteDirectory = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const currentPath = path.join(dirPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                // Si c'est un répertoire, récursion pour supprimer son contenu
                deleteDirectory(currentPath);
            } else {
                // Si c'est un fichier, le supprimer
                fs.unlinkSync(currentPath);
            }
        });
        // Supprimer le répertoire lui-même
        fs.rmdirSync(dirPath);
        console.log(`Le répertoire ${dirPath} a été supprimé avec succès.`);
    }
};

// Appeler la fonction pour supprimer le répertoire
deleteDirectory(path.join(__dirname, 'pages', 'demo'));

console.log('DONE !');
