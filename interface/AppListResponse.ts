// Generated by https://quicktype.io

export interface AppListResponse {
    applist: Applist;
}

export interface Applist {
    apps: App[];
}

export interface App {
    appid: number;
    name: string;
}