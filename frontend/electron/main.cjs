const { app, BrowserWindow } = require('electron');
const path = require('path');

// Sử dụng `app.isPackaged` chuẩn xác nhất để kiểm tra xem App đã được build thành cài đặt hay chưa.
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // Ẩn menu bar mặc định (File, Edit, View...)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:15173');
    // Mở DevTools nếu đang ở chế độ dev
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
