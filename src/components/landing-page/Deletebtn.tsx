import React from "react";
import { Button } from "../ui/button";
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
import { Trash2 } from "lucide-react";
import { useFetchFiles } from "~/utils/store/fileStore";
interface DeletebtnProps {
  fileName: string;
}
import { useFileStore } from "~/utils/store/fileStore";
import { backendClient } from "~/api/backend";
const Deletebtn: React.FC<DeletebtnProps> = ({ fileName }) => {
  const removeFetchFiles = useFetchFiles((state) => state.removeFetchFiles);
  
  const handleDelete = async () => {
    try {
      await backendClient.deleteFile("/delete-file/", fileName);
      removeFetchFiles(fileName);
      console.log("file deleted");
    } catch (e) {
      console.log("error deleting file", e);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Trash2 className="" strokeWidth={1.25} size={20} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the file
            and remove it from your servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
                (async () => {
                  await handleDelete();
                })().catch((error) => {
                  console.error("Failed to delete file", error);
                });
              }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Deletebtn;
