import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FileUrl {
  id:string,
  filename: string;
  url: string;
  type:string;
}

export interface Chunk{
  chunk:string,
  fileUrl:string,
  pdfName:string,
  chunk_url:string,
  pageno:number
}

interface Response{
  reponseMessage:string,
  files?:FileUrl[],
  chunks:Chunk[],
  confidence_score?:number
}


export interface QuestionState {
  queries: string[];
  activeQuery:number;
  apiResponse:Response[];
  askQuestion:boolean;
  setAskQuestion:(ask:boolean)=>void;
  activeChunk:string;
  setActiveChunk:(res:string)=>void;
  activeChunkIndex:number;
  setActiveChunkIndex:(res:number)=>void;
  addApiResponse:(res:Response)=>void;
  setActiveQuery:(num:number)=>void;
  fileUrls:FileUrl[];
  addFileUrl: (files: FileUrl) => void;
  changeApiResponse:(index:number,res:Response)=>void;
  changeResponse:(index:number,res:string)=>void;
  responses: string[];
  setResponseAtIndex: (index: number, newResponse: string) => void;
  addQueries: (questions: string[]) => void;
  removeQuery: (index:number)=>void;
  addResponse: (response: string) => void;
  clearQueries: () => void;
  changeQueryatIndex:(index:number,question:string)=>void;
  emptyResponseAtIndex:(index:number)=>void;

  setQuestions: (questions: string[]) => void;
}

const useQuestionStore = create<QuestionState>()(
  persist(
    (set) => ({
      queries: [],
      fileUrls:[],
      activeQuery:0,
      askQuestion:false,
      setAskQuestion(ask) {
        set({askQuestion:ask});
      },
      activeChunk:"",
      setActiveChunk:(res)=>
        set((state)=>({
          activeChunk:res,
        })),
      activeChunkIndex:-1,
      setActiveChunkIndex:(res)=>
        set((state)=>({
          activeChunkIndex:res
        })),  
        changeApiResponse:(index,res)=>
          set((state)=>({
            apiResponse:[...state.apiResponse.slice(0,index),res,...state.apiResponse.slice(index+1)],
          })),
          changeResponse:(index, res)=>
            set((state) => ({    
              responses: [...state.responses.slice(0, index), res, ...state.responses.slice(index + 1)],
            })),
      apiResponse:[],

      setActiveQuery:(num)=>
        set((state)=>({
          activeQuery:num,
        })),
        addApiResponse: (res) =>
          set((state) => ({
            apiResponse: [...state.apiResponse, res],
          })),
      addFileUrl: (file) => 
        set((state) => {
          const existingFile = state.fileUrls.find((f) => f.filename === file.filename);
          if (!existingFile) {
            return { fileUrls: [...state.fileUrls, file] };
          }
          return state;
        }),
      responses: [],
      emptyResponseAtIndex:(index)=>
        set((state)=>({
          responses:[...state.responses.slice(0,index),"",...state.responses.slice(index+1)],  
        })),  
      changeQueryatIndex:(index,question)=>
        set((state)=>({
          queries:[...state.queries.slice(0,index),question,...state.queries.slice(index+1)],
        })),
      setResponseAtIndex: (index, newResponse) =>
        set((state) => {
          const updatedResponses = [...state.responses];
          updatedResponses[index] = newResponse;
          return { responses: updatedResponses };
        }),
      removeQuery: (index)=>
        set((state)=>{
          const newQueries=state.queries.filter((_,i)=>i!==index);
          return {queries:newQueries};
        }),
      addQueries: (questions) =>
        set((state) => ({


          queries: [...state.queries, ...questions],
        })),
      addResponse: (response) =>
        set((state) => ({
          responses: [...state.responses, response],
        })),

      clearQueries: () => set({ queries: [] }),

      setQuestions: (queries) => set({ queries }),
    }),
    {
      name: 'questions-storage', 
      getStorage: () => localStorage,
    }
  )
);

function clearData() {
  useQuestionStore.setState({ queries: [], responses: [],fileUrls:[],apiResponse:[],askQuestion:false,activeChunk:"" }); // Reset Zustand store
  localStorage.removeItem('questions-storage'); // Remove item from local storage
}


export { useQuestionStore, clearData };