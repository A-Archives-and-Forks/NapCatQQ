import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    user_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GroupPoke extends GetPacketStatusDepends<Payload, void> {
    override actionName = ActionName.GroupPoke;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.pkt.operation.GroupPoke(+payload.group_id, +payload.user_id);
    }
}
