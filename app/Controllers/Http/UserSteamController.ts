import Env from '@ioc:Adonis/Core/Env';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import axios from 'axios';

import { PlayerSummaryResponse } from 'interface/PlayerSummaryResponse';
import { ResolveVanityURLResponse } from 'interface/ResolveVanityURLResponse';
import { getSteamProfileItemsInformation } from '../../../utils/getSteamProfileItemsInformation';

export default class UserSteamController {
    public async userProfileByCustomId({ request, response }: HttpContextContract) {
        const { customId } = request.body();

        if (!customId) {
            return response.status(400).send({ message: 'customId no contiene ningun valor' });
        }

        const vanityURLResponse = await this.getSteamIdByCustomId(customId);

        if (!vanityURLResponse) {
            return response.status(500).send({ message: 'Ocurrio un error al recuperar el usuario' });
        }

        if (vanityURLResponse.response.success != 1) {
            switch (vanityURLResponse.response.success) {
                case 42:
                    return response.status(404).send({ message: 'No se encontro al usuario' });

                default:
                    return response.status(500).send({ message: 'Ocurrio un error al recuperar el usuario' });
            }
        }

        const { response: { steamid } } = vanityURLResponse;

        const playerSummary = await this.getPlayerSummary(steamid);

        if (!playerSummary) {
            return response.status(500).send({ message: 'Ocurrio un error al recuperar el usuario' });
        }

        if (playerSummary.response.players.length === 0) {
            return response.status(404).send({ message: 'No se encontro al usuario' });
        }

        const player = playerSummary.response.players[0];

        const items = await getSteamProfileItemsInformation(player.profileurl);

        return response.status(200).send({ player, items });
    }

    public async userProfileBySteamId({ request, response }: HttpContextContract) {
        const { steamid } = request.body();

        if (!steamid) {
            return response.status(400).send({ message: 'steamid no contiene ningun valor' });
        }

        const playerSummary = await this.getPlayerSummary(steamid);

        if (!playerSummary) {
            return response.status(500).send({ message: 'Ocurrio un error al recuperar el usuario' });
        }

        if (playerSummary.response.players.length === 0) {
            return response.status(404).send({ message: 'No se encontro al usuario' });
        }

        const player = playerSummary.response.players[0];

        const items = await getSteamProfileItemsInformation(player.profileurl);

        return response.status(200).send({ player, items });
    }

    async getPlayerSummary(id: string): Promise<PlayerSummaryResponse | null> {
        return await axios
            .get<PlayerSummaryResponse>(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Env.get('API_KEY')}&steamids=${id}`)
            .then(({ data }) => {
                return data;
            })
            .catch(() => {
                return null;
            });
    }


    async getSteamIdByCustomId(customId: string): Promise<ResolveVanityURLResponse | null> {
        return await axios
            .get<ResolveVanityURLResponse>(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${Env.get('API_KEY')}&vanityurl=${customId}`)
            .then(({ data }) => {
                return data;
            })
            .catch(() => {
                return null;
            });
    }
}
