import React, { useState } from 'react';

function Index () {
  const [image, set_image] = useState(null);
  const [uploaded_img, set_uploaded_img] = useState(null);
  const upload_image = async (e) => {
    e.preventDefault();
    try {
      const form_data = new FormData();
      form_data.append('file', image);


      const response = await fetch('/upload', {
        method: 'POST',
        body: form_data,
      });

      const data = await response.json();
      set_uploaded_img(data.filename);
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div>
      <form className="flex justify-center items-center flex-col" onSubmit={upload_image}>
        <div className="w-96 p-1">
          <input className="form-control
            block
            w-full
            px-3
            py-1.5
            text-base
            font-normal
            text-gray-700
            bg-white bg-clip-padding
            border border-solid border-gray-300
            rounded
            transition
            ease-in-out
            m-0
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          type="file"
          accept="image/*"
          onChange={(e) => set_image(e.target.files[0])}>
          </input>
        </div>
        <button className="h-12 px-6 m-2 text-lg text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800">UPLOAD</button>
      </form>
      <a href={`http://localhost:3000/i/${uploaded_img}`} target="_blank" rel="noreferrer">{uploaded_img}</a>
    </div>
  );
}

export default Index;