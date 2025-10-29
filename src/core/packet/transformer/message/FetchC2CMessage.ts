import * as proto from '@/core/packet/transformer/proto';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OidbPacket, PacketBufBuilder, PacketTransformer } from '@/core/packet/transformer/base';

class FetchC2CMessage extends PacketTransformer<typeof proto.SsoGetC2cMsgResponse> {
    constructor() {
        super();
    }

    build(targetUid: string, startSeq: number, endSeq: number): OidbPacket {
        const req = new NapProtoMsg(proto.SsoGetC2cMsg).encode({
            friendUid: targetUid,
            startSequence: startSeq,
            endSequence: endSeq,
        });
        return {
            cmd: 'trpc.msg.register_proxy.RegisterProxy.SsoGetC2cMsg',
            data: PacketBufBuilder(req)
        };
    }

    parse(data: Buffer) {
        return new NapProtoMsg(proto.SsoGetC2cMsgResponse).decode(data);
    }
}

export default new FetchC2CMessage();
