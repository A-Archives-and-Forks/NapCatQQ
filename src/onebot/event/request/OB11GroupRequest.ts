import { OB11GroupNoticeEvent } from '@/onebot/event/notice/OB11GroupNoticeEvent';
import { EventType } from '@/onebot/event/OneBotEvent';
import { NapCatCore } from '@/core';

export class OB11GroupRequestEvent extends OB11GroupNoticeEvent {
    override post_type = EventType.REQUEST;
    request_type = 'group';

    override user_id: string;
    comment: string;
    flag: string;
    sub_type: string;

    constructor(core: NapCatCore, groupId: string, userId: string, sub_type: string, comment: string, flag: string) {
        super(core, groupId, userId);
        this.user_id = userId;
        this.sub_type = sub_type;
        this.comment = comment;
        this.flag = flag;
    }
}
