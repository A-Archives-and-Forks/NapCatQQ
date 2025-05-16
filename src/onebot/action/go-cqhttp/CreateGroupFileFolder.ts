import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    folder_name: Type.String(),
});

type Payload = Static<typeof SchemaData>;
interface ResponseType{
    result:unknown;
    groupItem:unknown;
}
export class CreateGroupFileFolder extends  OneBotAction<Payload, ResponseType>  {
    override actionName = ActionName.GoCQHTTP_CreateGroupFileFolder;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.creatGroupFileFolder(payload.group_id.toString(), payload.folder_name)).resultWithGroupItem;
    }
}
