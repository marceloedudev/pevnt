export interface IItemParams {
    itemId: number;
}

export interface IUserParams {
    userId: number;
}

export interface IUserBeginPayload {
    user_id: number;
}

export interface IUserCompletedPayload {
    user_id: number;
    url: string;
}

export interface IUserFailedPayload {
    user_id: number;
}
