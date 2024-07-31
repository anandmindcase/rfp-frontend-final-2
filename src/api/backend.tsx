import type { PdfData } from "~/pages/documents";
import { Chunk } from "~/utils/store/questionStore";

const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export interface SaveQnaResponse {
  message: string;
}

export interface ProcessQueryResponse {
  id: string;
  message: string;
  pdf_data: PdfData[];
  Chunks: Chunk[];
  page: number[];
}

export interface UploadExcelResponse {
  message: string;
  details: string[];
}

export interface UploadPdfResponse {
  message: string;
  details: string[];
}

class BackendClient {
  private async get(endpoint: string): Promise<Response> {
    const url = backendUrl + endpoint;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }

  private async post(endpoint: string, body?: unknown): Promise<Response> {
    const url = backendUrl + endpoint;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }

  public async postExcelFile(
    endpoint: string,
    files: File[]
  ): Promise<UploadExcelResponse | undefined> {
    const url = backendUrl + endpoint;
    // console.log("excels", files);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json() as Promise<UploadExcelResponse>;
    } catch (e) {
      console.log("got error on excel upload", e);
      return undefined;
    }
  }

  public async postPdfFile(
    endpoint: string,
    files: File[]
  ): Promise<UploadPdfResponse | undefined> {
    const url = backendUrl + endpoint;
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json() as Promise<UploadPdfResponse>;
    } catch (e) {
      console.log("error on pdf upload", e);
      return undefined;
    }
  }

  public async saveQna(
    endpoint: string,
    query: string,
    newAns: string
  ): Promise<SaveQnaResponse | undefined> {
    const url = backendUrl + endpoint;
    const qna = {
      question: query,
      answer: newAns,
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(qna),
      });
      if (!response.ok) {
        console.log("error saving qna");
        return undefined;
      }
      return response.json() as Promise<SaveQnaResponse>;
    } catch (e) {
      console.log("error saving qna", e);
      return undefined;
    }
  }

  public async fetchQueryWithScore(
    endpoint: string,
    query: string,
    score: number
  ): Promise<ProcessQueryResponse | undefined> {
    const url = backendUrl + endpoint;
    const requestData = {
      query: query,
      confidence_score: score,
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      console.log("response",response);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      let data = await response.json() as ProcessQueryResponse;

      if(!data.pdf_data.length) return data; 
      const resp = data?.pdf_data?.map((data: PdfData) => {
        data.url = data.url.replace("https://rpf-backend.azurewebsites.net","https://solutionwebapp.azurewebsites.net");
        return ({
          id: data.pdf_name,
          filename: data.pdf_name,
          url: data.url,
          type: data.type,
        });
      });
      const chunks = data?.Chunks?.map((chunk: Chunk) => {
        chunk.chunk_url = chunk.chunk_url.replace("https://rpf-backend.azurewebsites.net","https://solutionwebapp.azurewebsites.net");
        chunk.fileUrl = chunk.fileUrl.replace("https://rpf-backend.azurewebsites.net","https://solutionwebapp.azurewebsites.net");
        return ({
          ...chunk,
        });
      });
      data = {
        ...data,
        Chunks: chunks,
        pdf_data: resp as unknown as PdfData[],
      };
      return data
    } catch (e) {
      console.log("error fetching query", e);
      return undefined;
    }
  }

  public async getFiles(endpoint: string): Promise<string[] | undefined> {
    const url = backendUrl + endpoint;
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.json() as Promise<string[]>;
    } catch (e) {
      console.log("error fetching query", e);
      return undefined;
    }
  }

  public async deleteFile(endpoint: string, fileName: string): Promise<void> {
    const url = `${backendUrl}${endpoint}?file_name=${encodeURIComponent(fileName)}`;
  
    console.log("delete file request URL", url);
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // This header can remain even if no body is sent
        },
      });
  
      if (response.ok) {
        console.log("File deleted successfully");
      }
    } catch (e) {
      if (e instanceof Error) {
        console.log("Error deleting file:", e.message);
      } else {
        console.log("Unexpected error deleting file:", e);
      }
    }
  }
}

export const backendClient = new BackendClient();
