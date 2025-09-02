export interface CreateChatDraft {
    name?: string;
    photoFile?: File;
    isGroup: boolean;
    participantIds: string[];
}
