const { app, BrowserWindow, Tray, ipcMain } = require('electron')
const path = require('path')
const { exec, execSync } = require('child_process')
const assetsDirectory = path.join(__dirname, "assets")

let tray = undefined;
let window = undefined;

if (process.platform === 'darwin') {

    const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
        if (window) {
            if (window.isMinimized()) window.restore()
            window.focus()
        }
    })

    if (isSecondInstance) {
        app.quit()
    }

    // Don't show the app in the doc
    app.dock.hide()

    app.on('ready', () => {
        createTray();
        createWindow();
    })

    // Quit the app when the window is closed
    app.on('window-all-closed', () => {
        app.quit()
    })

    const createTray = () => {
        tray = new Tray(path.join(assetsDirectory, 'switch.png'))
        tray.on('right-click', toggleWindow)
        tray.on('double-click', toggleWindow)
        tray.on('click', function (event) {
            toggleWindow()
            // Show devtools when command clicked
            if (window.isVisible() && process.defaultApp && event.metaKey) {
                window.openDevTools({ mode: 'detach' })
            }
        })
    }

    const getWindowPosition = () => {
        const windowBounds = window.getBounds()
        const trayBounds = tray.getBounds()
        // Center window horizontally below the tray icon
        const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
        // Position window 4 pixels vertically below the tray icon
        const y = Math.round(trayBounds.y + trayBounds.height + 10);

        return { x: x, y: y }
    }

    const createWindow = () => {
        window = new BrowserWindow({
            width: 300,
            height: 280,
            show: false,
            frame: false,
            fullscreenable: false,
            resizable: false,
            transparent: true,
            webPreferences: {
                // Prevents renderer process code from not running when window is
                // hidden
                backgroundThrottling: false
            }
        })
        window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

        // Hide the window when it loses focus
        window.on('blur', () => {
            if (!window.webContents.isDevToolsOpened()) {
                window.hide()
            }
        });

        setInterval(() => {
            try {
                const isShow = execSync('defaults read com.apple.finder CreateDesktop', {}).toString("utf-8")
                window && window.webContents.send('desktop', parseInt(isShow));


                const isShowFile = execSync('defaults read com.apple.finder AppleShowAllFiles').toString("utf-8")
                window && window.webContents.send('file', parseInt(isShowFile));
            } catch (e) {
                console.error(e)
                window && window.webContents.send('desktop', 1);
                window && window.webContents.send('file', 0);
            }
        }, 1000)
    }

    const toggleWindow = () => {
        if (window.isVisible()) {
            window.hide()
        } else {
            showWindow()
        }
    }

    const showWindow = () => {
        const position = getWindowPosition()
        window.setPosition(position.x, position.y, false)
        window.show()
        window.focus()
    }


    ipcMain.on("desktop", (event, arg) => {
        const showCmd = "defaults write com.apple.finder CreateDesktop 1;killall Finder";
        const hideCmd = "defaults write com.apple.finder CreateDesktop 0;killall Finder";
        try {
            const isShow = execSync('defaults read com.apple.finder CreateDesktop').toString("utf-8")
            if (parseInt(isShow) === 1) {
                exec(hideCmd, {})
            } else {
                exec(showCmd, {})
            }
        } catch (e) {
            exec(hideCmd, {})
        }

    })

    ipcMain.on("file", (event, arg) => {
        const showCmd = "defaults write com.apple.finder AppleShowAllFiles -bool TRUE;killall Finder";
        const hideCmd = "defaults write com.apple.finder AppleShowAllFiles -bool FALSE;killall Finder";
        try {
            const isShow = execSync('defaults read com.apple.finder AppleShowAllFiles').toString("utf-8")
            if (parseInt(isShow) === 1) {
                exec(hideCmd, {})
            } else {
                exec(showCmd, {})
            }
        } catch (e) {
            exec(showCmd, {})
        }
    })

}