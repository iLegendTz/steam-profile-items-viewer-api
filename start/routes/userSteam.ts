import Route from '@ioc:Adonis/Core/Route';

Route.group(() => {
    Route.post('/user-profile-by-custom-id', 'UserSteamController.userProfileByCustomId');
    Route.post('/user-profile-by-steam-id', 'UserSteamController.userProfileBySteamId');
})
    .prefix('users');
