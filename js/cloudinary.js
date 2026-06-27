// ===== CLOUDINARY UPLOAD =====
var CLOUDINARY_CLOUD  = 'dmww01npw';
var CLOUDINARY_PRESET = 'prodajkupi_unsigned';

function uploadToCloudinary(file, onProgress, onDone, onError) {
  var formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', 'prodajkupi');

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD + '/image/upload');

  xhr.upload.addEventListener('progress', function(e) {
    if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
  });

  xhr.addEventListener('load', function() {
    if (xhr.status === 200) {
      var res = JSON.parse(xhr.responseText);
      // Proveri moderaciju — ako je rejected odbij sliku
      var mod = res.moderation && res.moderation[0];
      if (mod && mod.status === 'rejected') {
        onError('Slika sadrži neprimereni sadržaj i nije dozvoljena.');
        return;
      }
      var url = res.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
      onDone(url, res.public_id, res);
    } else {
      onError('HTTP ' + xhr.status);
    }
  });

  xhr.addEventListener('error', function() { onError('Mrežna greška.'); });
  xhr.send(formData);
}
