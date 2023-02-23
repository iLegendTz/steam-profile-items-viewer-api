export interface ProfileItems {
    background: Item,
    avatar: Item,
    frame: Item
}

export interface Item {
    gameId: number | null,
    gameName: string | null,
    src: string | null,
}