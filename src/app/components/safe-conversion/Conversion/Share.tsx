import { copyTextToClipboard } from "@/utils/clipboard";
import Image from "next/image";
import { useRef, useState } from "react";

const Share: React.FC<{ url: string }> = ({ url }) => {
  const [isUpdated, setIsUpdated] = useState(false);
  const [isCopied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const urlRef = useRef<string>(url);

  if (urlRef.current !== url) {
    urlRef.current = url;
    setIsUpdated(true);
  }

  const onClickCopy = () => {
    setTimeout(() => {
      setCopied(false);
    }, 2500)
    copyTextToClipboard(url)
    setCopied(true);
    setIsUpdated(false)
  }

  const buttonText = () => {
    if (isUpdated) {
      return (
        <span>
          Save
          <span className="inline">
            <Image
              src="/startup-finance/images/icons/saveUpdated.svg"
              alt="question mark tooltip"
              width={15}
              height={15}
              className="ml-2 inline invert"
            />
          </span>
        </span>
      );
    }
    if (isCopied) {
      return "Copied!";
    }
    return <span>
          Save
          <span className="inline">
            <Image
              src="/startup-finance/images/icons/save.svg"
              alt="question mark tooltip"
              width={15}
              height={15}
              className="ml-2 inline invert"
            />
          </span>
        </span>
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }

  return (
    <div className="w-full m-auto my-4 text-center">
      <button
        className={`w-36 px-4 py-2 rounded-md focus:outline-none focus:ring-2 text-white  ${isUpdated ? "bg-green-500 hover:bg-green-600 focus:ring-green-500" : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"}`}
        onClick={() => setShowModal(true)}
      >
        { buttonText()}
      </button>
      {showModal && (
        <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Share this worksheet
              </h3>
              <p>The link to this worksheet contains all the cap table data in the URL. If you update make sure to share the updated link!</p>
              <div className="mt-2">
                <input 
                className="flex-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onFocus={handleFocus}
                value={url}></input>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClickCopy}
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Share;
