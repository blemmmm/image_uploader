import React, { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import {
  FacebookShareButton,
  RedditShareButton,
  TelegramShareButton,
  TwitterShareButton,
} from "react-share";

function Index() {
  const [image, set_image] = useState(null);
  const [uploaded_img, set_uploaded_img] = useState(null);
  const [old_metadata, set_old_metadata] = useState(null);
  const [new_metadata, set_new_metadata] = useState(null);
  const [is_open, set_is_open] = useState(false);
  const [show_overlay, set_show_overlay] = useState({ display: "none" });
  const link = `http://localhost:3000/i/${uploaded_img}`;
  const inputRef = useRef();

  const close_modal = () => {
    set_is_open(false);
    set_show_overlay({ display: "none" });
  };
  const open_modal = () => {
    set_is_open(true);
    set_show_overlay({ display: "block" });
  };
  const upload_image = async (e) => {
    e.preventDefault();
    try {
      const form_data = new FormData();
      form_data.append("file", image);

      Swal.fire({
        title: "Uploading your image...",
        timer: 1000,
        didOpen: () => {
          Swal.showLoading();
        },
        didClose: async () => {
          const response = await fetch("/upload", {
            method: "POST",
            body: form_data,
          });

          const data = await response.json();
          set_uploaded_img(data.filename);
          set_old_metadata(data.old_metadata);
          set_new_metadata(data.new_metadata);
          inputRef.current.value = null;
          set_image(null);
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom",
            showConfirmButton: false,
            timer: 1500,
          });

          Toast.fire({
            icon: "success",
            title: "Image Uploaded!",
          });
        },
      });
    } catch (err) {
      console.log(err.message);
    }
  };
  const copy_link = async () => {
    await navigator.clipboard.writeText(link);

    const Toast = Swal.mixin({
      toast: true,
      position: "bottom",
      showConfirmButton: false,
      timer: 1500,
    });

    Toast.fire({
      icon: "success",
      title: "Link Copied!",
    });
  };

  console.log("old", old_metadata);
  console.log("new", new_metadata);
  return (
    <div>
      {/* Main Content */}
      <div className="flex h-screen">
        <div className="m-auto w-auto px-10 py-4">
          <form
            className="flex justify-center items-center flex-row w-[500px]"
            onSubmit={upload_image}
          >
            <div className="w-96 py-2">
              <input
                className="form-control
                      inline-block
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
                required
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={(e) => set_image(e.target.files[0])}
              ></input>
            </div>
            <button className="px-6 py-2 ml-2 text-lg font-semibold text-white transition-colors duration-150 bg-indigo-700 rounded focus:shadow-outline hover:bg-indigo-800">
              UPLOAD
            </button>
          </form>
          {uploaded_img ? (
            <div className="flex justify-center items-center flex-col py-6 bg-gray-50 h-[500px] w-[500px]">
              <div className="relative">
                <img
                  src={`http://localhost:3000/i/${uploaded_img}`}
                  className="object-scale-down h-[500px] w-[500px]"
                />
                <button
                  onClick={() => open_modal()}
                  className="h-fit absolute top-0 right-0 bg-[#00000080] text-white p-2 shadow-lg rounded font-semibold hover:bg-[#312e81e6] m-2"
                >
                  <Icon className="h-6 w-6" icon="bx:bxs-share-alt" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      <Transition appear show={is_open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={close_modal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden align-middle transition-all transform bg-white shadow-xl rounded-md">
                <Dialog.Title
                  as="h1"
                  className="text-lg text-left font-medium leading-6 text-gray-900"
                >
                  <div className="flex flex-row items-center">
                    <Icon
                      icon="fa-solid:share"
                      className="h-6 w-6 px-1 text-gray-900"
                    />
                    <span>Share</span>
                  </div>
                </Dialog.Title>
                <div className="relative text-gray-700 my-4">
                  <input
                    className="w-full h-10 pl-3 pr-8 text-base font-semibold border rounded-md disabled:bg-indigo-200 disabled:text-indigo-700"
                    type="text"
                    value={link}
                    disabled
                  />
                  <button
                    onClick={copy_link}
                    className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-indigo-700 rounded-r-md hover:bg-indigo-800 focus:bg-indigo-700"
                    on
                  >
                    Copy Link
                  </button>
                </div>
                <div className="flex flex-row items-center justify-center">
                  <FacebookShareButton
                    url={link}
                    quote={`I uploaded a photo on ImageHippo, check it out! --> ${link}`}
                    hashtag="#ImageHippo"
                  >
                    <button className="px-1 text-5xl" title="Share to Facebook">
                      <Icon icon="logos:facebook" />
                    </button>
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={link}
                    title="I uploaded a photo on ImageHippo, check it out!"
                  >
                    <button className="px-1 text-5xl" title="Tweet your Photo">
                      <Icon icon="logos:twitter" />
                    </button>
                  </TwitterShareButton>
                  <TelegramShareButton
                    url={link}
                    title="I uploaded a photo on ImageHippo, check it out!"
                  >
                    <button className="px-1 text-5xl" title="Send to Telegram">
                      <Icon icon="logos:telegram" />
                    </button>
                  </TelegramShareButton>
                  <RedditShareButton
                    url={link}
                    title="I uploaded a photo on ImageHippo, check it out!"
                  >
                    <button className="px-1 text-5xl" title="Post to Reddit">
                      <Icon icon="logos:reddit-icon" />
                    </button>
                  </RedditShareButton>
                </div>
                {old_metadata && new_metadata && (
                  <div className="flex flex-row items-start justify-between">
                    <div className="flex flex-col items-start">
                      <h1>Old Metadata</h1>
                      <span>Format: {old_metadata.format}</span>
                      <span>Height: {old_metadata.height}</span>
                      <span>Width: {old_metadata.width}</span>
                      <span>Size: {old_metadata.size}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <h1>New Metadata</h1>
                      <span>Format: {new_metadata.format}</span>
                      <span>Height: {new_metadata.height}</span>
                      <span>Width: {new_metadata.width}</span>
                      <span>Size: {new_metadata.size}</span>
                    </div>
                  </div>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Overlay */}
      <div
        style={show_overlay}
        className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full"
      ></div>
    </div>
  );
}

export default Index;
