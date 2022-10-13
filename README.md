# Generic Template
Template Ionic / Angular / Capacitor dengan default halaman:
- Login  
- Home  
- Setting  
- Dev Test  

## Using Template
- Klik ajah itu tombol hijau (Use this template) di [halaman git](https://github.com/nandakho/ionicTemplate)  
- Clone repo hasil generate template, `Git clone [link_repo]`  
- Install semua library yang dibutuhkan dengan `npm i`  
- Edit appId dan appName di file `capacitor.config.json`,`ionic.config.json`,`package.json` dan `package-lock.json`  
- Tambah capacitor native device (android), `ionic cap add android`  
- Edit file `android/app/build.gradle`, ubah version name jadi format x.y.z (x = major, y = minor, z = revision)  
- Edit file `android/app/src/main/AndroidManifest.xml`, tambah kan ini permission berikut ini di bawah permission INTERNET yang tergenerate otomatis    
```
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" />
```  
- Kelar semua, tinggal run deh, `ionic cap run android -l --target [device_id]`