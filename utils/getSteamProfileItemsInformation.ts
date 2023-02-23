import axios from 'axios';
import * as cheerio from 'cheerio';
import { Item } from '../interface/ProfileItems';
import { getAppList } from './getAppList';

export const getSteamProfileItemsInformation = async (steamProfileUrl: string) => {
    const response = await axios.get(steamProfileUrl);
    const htmlCode = cheerio.load(response.data);

    const background = await getBackground(htmlCode);
    const avatar = await getAvatar(htmlCode);
    const frame = await getFrame(htmlCode)


    return { background, avatar, frame }
}

const getBackground = async (htmlCode: cheerio.CheerioAPI): Promise<Item | null> => {
    if (htmlCode('div.has_profile_background').length === 0) {
        return null;
    }

    let src: string = "";

    if (htmlCode('div.profile_animated_background').find('source[type=video/mp4]').length > 0) {
        src = htmlCode('div.profile_animated_background').find('source[type=video/mp4]').first().attr('src') as string;
    }
    else if (htmlCode('div.no_header.profile_page.has_profile_background').length > 0) {
        src = htmlCode('div.no_header.profile_page.has_profile_background').css('background-image')?.replace(/(url\(|\)|'|")/gi, '').trim() as string;
    }


    return await getGameInfoFromItemLink(src);
};

const getAvatar = async (htmlCode: cheerio.CheerioAPI): Promise<Item | null> => {
    let src: string = "";

    src = htmlCode('div.playerAvatarAutoSizeInner>img').attr('src') as string;

    return await getGameInfoFromItemLink(src);
}


const getFrame = async (htmlCode: cheerio.CheerioAPI): Promise<Item | null> => {
    let src: string = "";

    src = htmlCode('div.playerAvatarAutoSizeInner>div.profile_avatar_frame>img').attr('src') as string;

    return await getGameInfoFromItemLink(src);
}

const getGameInfoFromItemLink = async (src: string): Promise<Item> => {
    return await getAppList()
        .then((data) => {
            if (!data || !src) { return { gameId: null, gameName: null, src: null } as Item; }

            const urlArray = src.split("/");
            const gameId = parseInt(urlArray[urlArray.findIndex((value) => value === "items") + 1]);

            if (isNaN(gameId)) { return { gameId: null, gameName: null, src } as Item; }

            const game = data.applist.apps.find((game) => game.appid === gameId);

            if (!game) { return { gameId: null, gameName: null, src } as Item; }

            return { gameId: game.appid, gameName: game.name, src } as Item;
        });
}