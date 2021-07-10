export const uploadToS3 = async function(files, path, id, projectId, callback) {
  const curFile;
  const uploadProgresses = [];
  path = path.replace(/\/\/+/g, "/");
  for (let i = 0; i < files.length; i++) {
    curFile = files[i];
    await uploadFile(curFile);
  }

  async function uploadFile(file) {
    const key = path + id;

    uploadProgresses.push({
      name: file.name,
      size: file.size,
      percent: 0,
      done: false
    });

    const index = uploadProgresses.length - 1;

    callback(uploadProgresses);

    let response = await $.post("api/project/" + projectId + "/file/s3/put", {
      key: key,
      fileType: file.type
    });
    
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", response);
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", reqListener);

    function uploadProgress(evt) {
      const percentComplete = Math.round(
        (evt.loaded * 100) / evt.total
      );
      uploadProgresses[index].percent = percentComplete;
      callback(uploadProgresses);
    }

    function reqListener() {
      xhr = this;
      // When finished uploading:
      if (xhr.status === 200) {
        uploadProgresses[index].done = true;
        callback(uploadProgresses, key);
      } else {
        // unsuccessful upload
      }
    }
    xhr.onerror = function() {
      // error handling
    };
    xhr.send(file);
  }
}

export const formToJson = function(jqForm) {
  return jqForm.serializeArray().reduce(function(data, x) {
    data[x.name] = x.value;
    return data;
  }, {});
}

export default {};