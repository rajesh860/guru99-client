interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface LoginRequestBody {
  username: string;
  password: string;
  appUrl:string;
  panel:string;
}

interface LoginResponse {
  token: string;
  userId:string;
  userTypeInfo: number | string;
  status?:boolean;
  message?:string
}
