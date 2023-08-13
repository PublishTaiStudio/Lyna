/*-----------------------------------------------------------------------------------------------------------\
|  _____     _   _____ _             _ _          _____  _____  _____  __      _______  _____  _____  _____  |
| |_   _|   (_) /  ___| |           | (_)        / __  \|  _  |/ __  \/  |    / / __  \|  _  |/ __  \|____ | |
|   | | __ _ _  \ `--.| |_ _   _  __| |_  ___    `' / /'| |/' |`' / /'`| |   / /`' / /'| |/' |`' / /'    / / |
|   | |/ _` | |  `--. \ __| | | |/ _` | |/ _ \     / /  |  /| |  / /   | |  / /   / /  |  /| |  / /      \ \ |
|   | | (_| | | /\__/ / |_| |_| | (_| | | (_) |  ./ /___\ |_/ /./ /____| |_/ /  ./ /___\ |_/ /./ /___.___/ / |
|   \_/\__,_|_| \____/ \__|\__,_|\__,_|_|\___/   \_____/ \___/ \_____/\___/_/   \_____/ \___/ \_____/\____/  |
\-----------------------------------------------------------------------------------------------------------*/

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

var configPage = fs.readFileSync(path.join(__dirname, '..', 'pages', 'home', 'home.json')),
    preview = null;

if(!fs.existsSync(path.join(__dirname, '..', 'pages', 'demo'))){
    fs.mkdirSync(path.join(__dirname, '..', 'pages', 'demo'));
}
if(!fs.existsSync(path.join(__dirname, '..', 'pages', 'demo', 'demo.json'))){
    fs.writeFileSync(path.join(__dirname, '..', 'pages', 'demo', 'demo.json'), configPage);
}

app.allowRendererProcessReuse = true;
app.whenReady().then(() => {
    preview = createWindow('index.html', true, 1100, 619);
    var config = createWindow('app/gui.html', false, 800, 600);

    config.webContents.executeJavaScript(`data = ${configPage};`);

    reloadPrev();

    config.focus();

    ipcMain.on('logoSelect', (event) => {
        dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
        .then(result => {
            fs.copyFileSync(result.filePaths[0], path.join(__dirname, '..', 'pages', 'demo', 'demo.png'));
            event.reply('logoSelected', path.join('pages', 'demo', 'demo.png'));
        }).catch(err => {
            console.log(err);
        });
    });
    ipcMain.on('backgroundSelect', (event) => {
        dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
        .then(result => {
            fs.copyFileSync(result.filePaths[0], path.join(__dirname, '..', 'pages', 'demo', 'demoBack.png'));
            event.reply('backgroundSelected', path.join('pages', 'demo', 'demoBack.png'));
        }).catch(err => {
            console.log(err);
        });
    });
    ipcMain.on('change', (event, arg) => {
        fs.writeFileSync(path.join(__dirname, '..', 'pages', 'demo', 'demo.json'), arg);
        reloadPrev();
    });
    ipcMain.on('save', (event, arg) => {
        let data = JSON.parse(arg);

        if(fs.existsSync(path.join(__dirname, '..', 'pages', 'demo', 'demo.json'))){
            fs.writeFileSync(path.join(__dirname, '..', 'pages', 'demo', 'demo.json'), arg);
        }
        else{
            fs.writeFileSync(path.join(__dirname, '..', 'pages', data.name, data.name + '.json'), arg);
        }

        fs.rename(path.join(__dirname, '..', 'pages', 'demo'), path.join(__dirname, '..', 'pages', data.name), () => {
            fs.rename(path.join(__dirname, '..', 'pages', data.name, 'demo.json'), path.join(__dirname, '..', 'pages', data.name, data.name + '.json'), () => {
                console.log('DONE!');
                dialog.showMessageBox(config, {
                    message: "your page has been saved! now send pull request.",
                    title: "Lyna Setup",
                    icon: path.join(__dirname,'..', 'pages', 'home', 'lyna.png')
                })
                .then(result => {
                    app.quit();
                })
            });
        });
    });
});

function reloadPrev(){
    preview.reload();
    preview.webContents.executeJavaScript(`$('body').append('<script src="app/preview.js"></script>');`);
}

function createWindow (url, resize, w, h) {
    var win = new BrowserWindow({
        width: w,
        height: h,
        autoHideMenuBar: true,
        resizable: resize,
        icon: path.join(__dirname, '..', 'pages', 'home', 'lyna.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
  
    win.loadFile(url);

    return win;
}