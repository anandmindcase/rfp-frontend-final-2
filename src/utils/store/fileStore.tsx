import { execFile } from "child_process";
import { create } from "zustand";
import { persist } from 'zustand/middleware';


interface FileState {
  files: File[];
  excels:File[];
  selectedFiles: File[];
  addExcels:(file:File[])=>void;
  removeallExcel:()=>void;
  removeExcel:(index:number)=>void;
  selectFile: (file: File) => void;
  removeSelectedFile:(name:string)=>void;
  addFiles: (file: File[]) => void;
  removeallFiles:()=>void;
  deleteFile: (index: number) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  excels:[],
  selectedFiles: [],
  addExcels: (newFiles) => set((state) => ({ excels: [...state.excels, ...newFiles] })),  
  removeExcel:(index)=>
    set((state) => ({
      excels: state.excels.filter((_, i) => i !== index),
    })),
  removeallExcel:()=>
    set((state) => ({
      excels:[],
    })),
  removeallFiles:()=>
    set((state) => ({
      files:[],
    })),
  selectFile: (file) => set((state) => ({ selectedFiles: [...state.selectedFiles, file] })),
  removeSelectedFile: (name) => set((state) => ({ selectedFiles: state.selectedFiles.filter((file) => file.name !== name) })),
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  deleteFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),
})
);

interface FetchFileState {
  fetchFiles:string[];
  addFetchFiles:(files:string[])=>void;
  removeFetchFiles:(fileName:string)=>void;
  addFetchFile:(file:string)=>void;
}

export const useFetchFiles=create<FetchFileState>((set)=>({
    fetchFiles:[],
    addFetchFiles: (files) => set((state) => ({ fetchFiles: [...state.fetchFiles, ...files] })),
    addFetchFile: (file) => set((state) => ({ fetchFiles: [...state.fetchFiles, file] })),
    removeFetchFiles: (fileName) => set((state) => ({ fetchFiles: state.fetchFiles.filter((file) => file !== fileName) })),
}))

// export const useFetchFiles = create<FetchFileState>()(
//   persist(
//     (set) => ({
//       fetchFiles:[],
//       addFetchFiles: (files) => set((state) => ({ fetchFiles: [...state.fetchFiles, ...files] })),
//       addFetchFile: (file) => set((state) => ({ fetchFiles: [...state.fetchFiles, file] })),
//       removeFetchFiles: (fileName) => set((state) => ({ fetchFiles: state.fetchFiles.filter((file) => file !== fileName) })),
//     }),
//     {
//       name: 'fetch-files-storage', 
//       getStorage: () => localStorage,
//     }
//   )
// )