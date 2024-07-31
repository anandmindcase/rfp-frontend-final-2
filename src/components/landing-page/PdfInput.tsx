import React from "react";
import { useState, useCallback } from "react";
import { BadgeCheck, Trash2, Send } from "lucide-react";
import { useFileStore } from "~/utils/store/fileStore";
import { useDropzone } from "react-dropzone";
import { backendClient } from "~/api/backend";
import { Button } from "../ui/button";
import Deletebtn from "./Deletebtn";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
interface PdfInputProps {
  fileFetchLoading: boolean;
  setValue: (value: string) => void;
}
import { useFetchFiles } from "~/utils/store/fileStore";

const PdfInput: React.FC<PdfInputProps> = ({ fileFetchLoading, setValue }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isPdfUploaded, setIsPdfUploaded] = useState<boolean>(false);

  const files = useFileStore((state) => state.files);
  const addFiles = useFileStore((state) => state.addFiles);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const removeallFiles = useFileStore((state) => state.removeallFiles);
  const fetchFiles = useFetchFiles((state) => state.fetchFiles);

  const onDropPdf = useCallback(
    (acceptedFiles: File[]) => {
      const pdfs = acceptedFiles.filter((file) => {
        const fileNameParts = file.name.split(".");
        const fileExtension = fileNameParts[fileNameParts.length - 1];
        return fileExtension === "pdf" || 
        fileExtension === "xlsx" ||
        fileExtension === "xls" ||
        fileExtension === "xlsm" ||
        fileExtension === "xlsb" ||
        fileExtension === "xlt" ||
        fileExtension === "xltx" ||
        fileExtension === "xltm" ||
        fileExtension === "csv"
      });
      console.log("pdfs", pdfs);
      

      if (pdfs.length > 0) {
        addFiles(pdfs);
        // console.log("files", files);
      } else {
        alert("Please select only Excel or CSV files.");
      }
    },
    [addFiles]
  );

  const {
    getRootProps: getRootPropsPdf,
    getInputProps: getInputPropsPdf,
    isDragActive: isDragActivePdf,
  } = useDropzone({
    onDrop: onDropPdf,
    maxFiles: 10,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
    },
  });

  const handlePdfSubmit = async () => {
    if (files.length > 0 && !isPdfUploaded) {
      try {
        setLoading(true);
        const pdfResponse = await backendClient.postPdfFile(
          "/upload-files/",
          files
        );

        setIsPdfUploaded(true);
        setLoading(false);
        removeallFiles();
        
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    } else {
      setValue("excel");
    }
  };

  return (
    <div className="mt-5 flex h-min  w-full flex-col items-center justify-center rounded-[16px] border-2 bg-white shadow-xl ">
      <div className="mx-4 mb-2 mt-4 self-start">
        <h1 className="text-[18px] font-medium">Upload files</h1>
        <p className="mt-1 text-[14px] text-gray-800">
          Upload relevant files to the database
        </p>
      </div>
      <div className="mt-2 flex  w-full flex-col justify-start gap-y-6 p-4 ">
        {isPdfUploaded ? (
          <div className="mt-2 flex h-[100px] w-11/12 flex-col items-center justify-center px-4 text-green-500 ">
            <BadgeCheck strokeWidth={1.25} />
            File is uploaded
          </div>
        ) : (
          <div
            className={` flex bg-${
              isDragActivePdf ? "gray-200" : "[#f7f8f9]"
            } bg-gray-00 font-nunito text-gray-90 border-grey-400 h-[180px] w-full flex-col items-center justify-center rounded-[16px] border-[3px] border-dashed`}
            {...getRootPropsPdf()}
          >
            {" "}
            <div className="mb-4">
              <svg
                id="Layer_1"
                enable-background="new 0 0 36 36"
                height="36"
                viewBox="0 0 512 512"
                width="36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <g clip-rule="evenodd" fill-rule="evenodd">
                    <path
                      d="m168.584 0h173.398l153.062 153.091v293.98c0 35.698-29.202 64.929-64.929 64.929h-261.53c-35.698 0-64.9-29.231-64.9-64.929v-382.142c0-35.698 29.202-64.929 64.899-64.929z"
                      fill="#e5252a"
                    />
                    <path
                      d="m341.982 0 153.062 153.091h-136.559c-9.1 0-16.503-7.432-16.503-16.532z"
                      fill="#b71d21"
                    />
                    <path
                      d="m31.206 218.02h352.618c7.842 0 14.25 6.408 14.25 14.25v129.36c0 7.842-6.408 14.25-14.25 14.25h-352.618c-7.842 0-14.25-6.408-14.25-14.25v-129.36c0-7.842 6.409-14.25 14.25-14.25z"
                      fill="#b71d21"
                    />
                  </g>
                  <path
                    d="m117.759 244.399h-26.598c-4.565 0-8.266 3.701-8.266 8.266v43.598 10.738 34.206c0 4.565 3.701 8.266 8.266 8.266s8.266-3.701 8.266-8.266v-25.94h18.331c19.224 0 34.864-15.64 34.864-34.863v-1.141c.001-19.224-15.639-34.864-34.863-34.864zm18.332 36.004c0 10.108-8.224 18.331-18.332 18.331h-18.332v-2.472-35.332h18.331c10.108 0 18.332 8.224 18.332 18.331v1.142zm70.62-36.004h-26.597c-4.565 0-8.266 3.701-8.266 8.266v88.542c0 4.565 3.701 8.266 8.266 8.266h26.597c19.224 0 34.864-15.64 34.864-34.863v-35.347c0-19.224-15.64-34.864-34.864-34.864zm18.332 70.21c0 10.108-8.224 18.331-18.332 18.331h-18.331v-72.01h18.331c10.108 0 18.332 8.224 18.332 18.331zm53.897-53.678v22.882h38.317c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266h-38.317v40.862c0 4.565-3.701 8.266-8.266 8.266s-8.266-3.701-8.266-8.266v-88.542c0-4.565 3.701-8.266 8.266-8.266h53.195c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266z"
                    fill="#fff"
                  />
                </g>
              </svg>
            </div>
            <input {...getInputPropsPdf()} />
            {isDragActivePdf ? (
              <p>Drop the files here ...</p>
            ) : (
              <>
                {loading ? (
                  <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
                ) : (
                  <>
                    <p className="text-[14px] text-gray-700 hover:cursor-default">
                      Drag &apos;n drop files(s) to upload{" "}
                    </p>
                    <p className="cursor-pointer font-semibold underline">
                      or browse
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <div className="mx-auto flex w-fit max-w-[90%] flex-col gap-y-2">
          {files.length > 0 &&
            files.map((file, index) => {
              return (
                <div className="flex" key={index}>
                  <div>
                    {
                      file.name.split(".")[file.name.split(".").length - 1] === "pdf" ? (
                        <svg
                        id="Layer_1"
                        enable-background="new 0 0 20 20"
                        height="20"
                        viewBox="0 0 512 512"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <g clip-rule="evenodd" fill-rule="evenodd">
                            <path
                              d="m168.584 0h173.398l153.062 153.091v293.98c0 35.698-29.202 64.929-64.929 64.929h-261.53c-35.698 0-64.9-29.231-64.9-64.929v-382.142c0-35.698 29.202-64.929 64.899-64.929z"
                              fill="#e5252a"
                            />
                            <path
                              d="m341.982 0 153.062 153.091h-136.559c-9.1 0-16.503-7.432-16.503-16.532z"
                              fill="#b71d21"
                            />
                            <path
                              d="m31.206 218.02h352.618c7.842 0 14.25 6.408 14.25 14.25v129.36c0 7.842-6.408 14.25-14.25 14.25h-352.618c-7.842 0-14.25-6.408-14.25-14.25v-129.36c0-7.842 6.409-14.25 14.25-14.25z"
                              fill="#b71d21"
                            />
                          </g>
                          <path
                            d="m117.759 244.399h-26.598c-4.565 0-8.266 3.701-8.266 8.266v43.598 10.738 34.206c0 4.565 3.701 8.266 8.266 8.266s8.266-3.701 8.266-8.266v-25.94h18.331c19.224 0 34.864-15.64 34.864-34.863v-1.141c.001-19.224-15.639-34.864-34.863-34.864zm18.332 36.004c0 10.108-8.224 18.331-18.332 18.331h-18.332v-2.472-35.332h18.331c10.108 0 18.332 8.224 18.332 18.331v1.142zm70.62-36.004h-26.597c-4.565 0-8.266 3.701-8.266 8.266v88.542c0 4.565 3.701 8.266 8.266 8.266h26.597c19.224 0 34.864-15.64 34.864-34.863v-35.347c0-19.224-15.64-34.864-34.864-34.864zm18.332 70.21c0 10.108-8.224 18.331-18.332 18.331h-18.331v-72.01h18.331c10.108 0 18.332 8.224 18.332 18.331zm53.897-53.678v22.882h38.317c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266h-38.317v40.862c0 4.565-3.701 8.266-8.266 8.266s-8.266-3.701-8.266-8.266v-88.542c0-4.565 3.701-8.266 8.266-8.266h53.195c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266z"
                            fill="#fff"
                          />
                        </g>
                      </svg>
                      ):(
                        <Image src="/excel.svg" alt="Excel SVG" width={20} height={20} />

                      )
                    }

                  </div>
                  <div className="ml-3 mr-[10px] line-clamp-1 w-[300px]">
                    <p className="text-[14px] ">{file.name}</p>
                  </div>
                  <div className="">
                    <Trash2
                      onClick={() => deleteFile(index)}
                      className=""
                      strokeWidth={1.25}
                      size={18}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="flex justify-center gap-x-1">
          <hr className="my-auto h-[1.25px] w-[30%] bg-slate-900" />
          <p>Your files</p>
          <hr className="my-auto h-[1.25px] w-[30%] bg-slate-900" />
        </div>
        <div className="flex flex-col justify-center">
          {fileFetchLoading ? (
            <div className="flex  items-center justify-center">
              <div className="loader h-5 w-5 rounded-full border-2 border-gray-200 ease-linear"></div>
            </div>
          ) : (
            <div className="mx-auto flex w-fit max-w-[90%] flex-col gap-y-2">
              {fetchFiles.length > 0 &&
                fetchFiles.map((file, index) => {
                  return (
                    <div className="flex" key={index}>
                      <div>
                      {
                      file.split(".")[file.split(".").length - 1] === "pdf" ? (
                        <svg
                        id="Layer_1"
                        enable-background="new 0 0 20 20"
                        height="20"
                        viewBox="0 0 512 512"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <g clip-rule="evenodd" fill-rule="evenodd">
                            <path
                              d="m168.584 0h173.398l153.062 153.091v293.98c0 35.698-29.202 64.929-64.929 64.929h-261.53c-35.698 0-64.9-29.231-64.9-64.929v-382.142c0-35.698 29.202-64.929 64.899-64.929z"
                              fill="#e5252a"
                            />
                            <path
                              d="m341.982 0 153.062 153.091h-136.559c-9.1 0-16.503-7.432-16.503-16.532z"
                              fill="#b71d21"
                            />
                            <path
                              d="m31.206 218.02h352.618c7.842 0 14.25 6.408 14.25 14.25v129.36c0 7.842-6.408 14.25-14.25 14.25h-352.618c-7.842 0-14.25-6.408-14.25-14.25v-129.36c0-7.842 6.409-14.25 14.25-14.25z"
                              fill="#b71d21"
                            />
                          </g>
                          <path
                            d="m117.759 244.399h-26.598c-4.565 0-8.266 3.701-8.266 8.266v43.598 10.738 34.206c0 4.565 3.701 8.266 8.266 8.266s8.266-3.701 8.266-8.266v-25.94h18.331c19.224 0 34.864-15.64 34.864-34.863v-1.141c.001-19.224-15.639-34.864-34.863-34.864zm18.332 36.004c0 10.108-8.224 18.331-18.332 18.331h-18.332v-2.472-35.332h18.331c10.108 0 18.332 8.224 18.332 18.331v1.142zm70.62-36.004h-26.597c-4.565 0-8.266 3.701-8.266 8.266v88.542c0 4.565 3.701 8.266 8.266 8.266h26.597c19.224 0 34.864-15.64 34.864-34.863v-35.347c0-19.224-15.64-34.864-34.864-34.864zm18.332 70.21c0 10.108-8.224 18.331-18.332 18.331h-18.331v-72.01h18.331c10.108 0 18.332 8.224 18.332 18.331zm53.897-53.678v22.882h38.317c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266h-38.317v40.862c0 4.565-3.701 8.266-8.266 8.266s-8.266-3.701-8.266-8.266v-88.542c0-4.565 3.701-8.266 8.266-8.266h53.195c4.565 0 8.266 3.701 8.266 8.266s-3.701 8.266-8.266 8.266z"
                            fill="#fff"
                          />
                        </g>
                      </svg>
                      ):(
                        <Image src="/excel.svg" alt="Excel SVG" width={20} height={20} />

                      )
                    }
                      </div>
                      <div className="ml-3 mr-[10px] line-clamp-1 w-[300px]">
                        <p className="text-[14px] ">{file}</p>
                      </div>
                      <Deletebtn fileName={file}/>
                    </div>
                  );
                })}

              {fetchFiles.length === 0 && (
                <div className="flex justify-center">
                  <p className="text-[14px] text-gray-700 hover:cursor-default">
                    No files uploaded yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex self-end">
          <Button
            disabled={loading}
            className={
              files.length > 0
                ? "min-w-[80px] text-[14px]"
                : !isPdfUploaded
                ? "bg-gray-400 text-[14px] hover:bg-gray-400"
                : "min-w-[80px] text-[14px]"
            }
            onClick={() => {
              handlePdfSubmit()
                .then(() => {
                  console.log("Response saved successfully");
                })
                .catch((error) => {
                  console.error("Failed to save response", error);
                });
            }}
          >
            {loading ? (
              <div className="flex  items-center justify-center">
                <div className="loader h-3 w-3 rounded-full border-2 border-gray-200 ease-linear"></div>
              </div>
            ) : (
              <>
                {isPdfUploaded ? (
                  <p>Next</p>
                ) : (
                  <div className="flex ">
                    <Send
                      strokeWidth={1.25}
                      size={16}
                      className="my-auto mr-2"
                    />
                    <p className="">Send</p>
                  </div>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PdfInput;
