import { OB11BaseNoticeEvent } from '@/onebot/event/notice/OB11BaseNoticeEvent';
import { EventType } from '@/onebot/event/OneBotEvent';
import { NapCatCore } from '@/core';

export class OB11FriendRequestEvent extends OB11BaseNoticeEvent {
    override post_type = EventType.REQUEST;
    request_type = 'friend';

    user_id: string;
    comment: string;
    flag: string;

    constructor(core: NapCatCore, user_id: string, comment: string, flag: string) {
        super(core);
        this.user_id = user_id;
        this.comment = comment;
        this.flag = flag;
    }
}
