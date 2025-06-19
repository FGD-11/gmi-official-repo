document.addEventListener('deviceready', function () {
  var permissions = cordova.plugins.permissions;
  permissions.requestPermissions(
    [
      permissions.CAMERA,
      permissions.ACCESS_FINE_LOCATION,
      permissions.POST_NOTIFICATIONS
    ],
    function (status) {
      if (status.hasPermission) {
        console.log("Semua izin diberikan");
      } else {
        console.warn("Beberapa izin ditolak");
      }
    },
    function () {
      console.error("Gagal meminta izin");
    }
  );
});


document.addEventListener('deviceready', onDeviceReady, false);

async function onDeviceReady() {
  console.log('Device is ready');

  const permissions = cordova.plugins.permissions;

  // === 1. Request permission untuk notifikasi (Android 13+) ===
  if (cordova.platformId === 'android') {
    permissions.checkPermission(permissions.POST_NOTIFICATIONS, function (status) {
      if (!status.hasPermission) {
        permissions.requestPermission(permissions.POST_NOTIFICATIONS, function (result) {
          if (result.hasPermission) {
            console.log('POST_NOTIFICATIONS permission granted');
          } else {
            alert("Izin notifikasi ditolak. Notifikasi tidak akan tampil.");
          }
        }, function (error) {
          console.error('Error meminta POST_NOTIFICATIONS:', error);
        });
      } else {
        console.log('POST_NOTIFICATIONS permission sudah diberikan');
      }
    }, function (error) {
      console.error('Gagal memeriksa izin:', error);
    });
  }

  // === 2. Request permission FCM ===
  try {
    const granted = await cordova.plugins.firebase.messaging.requestPermission({ forceShow: true });
    console.log('FCM permission granted:', granted);
  } catch (err) {
    console.warn('FCM permission denied:', err);
    alert("Aplikasi tidak dapat mengirim notifikasi tanpa izin.");
    return;
  }

  // === 3. Subscribe ke topic "AllUsers" ===
  cordova.plugins.firebase.messaging.subscribeToTopic("AllUsers")
    .then(() => {
      console.log("Berhasil subscribe ke topic 'AllUsers'");
    })
    .catch(err => {
      console.error("Gagal subscribe ke topic:", err);
    });

  // === 4. Ambil token device (untuk testing manual via Postman) ===
  cordova.plugins.firebase.messaging.getToken()
    .then((token) => {
      console.log("FCM Token:", token);
      alert("Token:\n" + token); // Bisa disalin manual untuk testing
    })
    .catch(err => {
      console.error("Gagal mengambil token:", err);
    });

  // === 5. Tangani pesan saat aplikasi aktif ===
  cordova.plugins.firebase.messaging.onMessage((payload) => {
    console.log("Pesan diterima (foreground):", payload);

    // Tampilkan alert sederhana (bisa ganti pakai custom UI)
    alert("📩 Notifikasi Masuk:\n" + payload.notification.title + "\n" + payload.notification.body);
  });

  // === 6. Tangani saat notifikasi di-tap ===
  cordova.plugins.firebase.messaging.onBackgroundMessage((payload) => {
    console.log("Notifikasi di-tap (background):", payload);

    // Bisa arahkan user ke halaman tertentu jika payload.data tersedia
  });
}
