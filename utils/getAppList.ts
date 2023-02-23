import Redis from '@ioc:Adonis/Addons/Redis';
import axios from 'axios';

import { AppListResponse } from '../interface/AppListResponse';

export const getAppList = async (): Promise<AppListResponse | null> => {
    const appList = await Redis.get('app_list');

    if (appList) {
        return JSON.parse(appList) as AppListResponse;
    }

    return await axios.get<AppListResponse>(`http://api.steampowered.com/ISteamApps/GetAppList/v2`)
        .then(async ({ data }) => {
            await Redis.set('app_list', JSON.stringify(data), "EX", 6000);
            return data;
        })
        .catch(() => {
            return null;
        })

}